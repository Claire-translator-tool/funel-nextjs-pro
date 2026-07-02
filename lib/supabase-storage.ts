import {
  cleanSupabaseUrl,
  isSupabasePlatformKey,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "./supabase";

const defaultBucket = "product-images";

type MediaObject = {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: {
    size?: number;
    mimetype?: string;
    [key: string]: unknown;
  };
};

export type PublicImageItem = {
  name: string;
  path: string;
  url: string;
  size?: number;
  updated_at?: string;
};

type StorageResult = {
  response: Response;
  detail: string;
};

export function getMediaBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || defaultBucket;
}

export function getPublicStorageUrl(bucket: string, path: string) {
  return `${cleanSupabaseUrl(supabaseUrl)}/storage/v1/object/public/${bucket}/${path}`;
}

function looksLikeRlsFailure(detail: string) {
  const lower = detail.toLowerCase();
  return lower.includes("row-level security") || lower.includes("rls") || lower.includes("42501");
}

function storageAuthHelp(lastDetail = "") {
  const suffix = lastDetail ? ` Last response: ${lastDetail}` : "";
  const rlsHint = looksLikeRlsFailure(lastDetail)
    ? " Supabase Storage RLS policy is missing for bucket product-images. Open /admin/system and run the one-time database policy SQL. Supabase 图片库缺少 Storage RLS 策略，请打开 /admin/system，复制并运行一次数据库权限 SQL。"
    : "";

  return [
    "Supabase Storage authorization failed.",
    "For new sb_secret keys, the key must be used only as the apikey header on the server; user access uses the admin session JWT.",
    "Please verify Vercel env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, SUPABASE_STORAGE_BUCKET=product-images.",
    "Supabase 图片库授权失败。请确认 Vercel 环境变量指向 givzkjmmxmrxcxtlwlys 项目，并确保 SUPABASE_STORAGE_BUCKET=product-images。",
    rlsHint,
    suffix,
  ]
    .filter(Boolean)
    .join(" ");
}

export function isSupabaseStorageAuthorizationError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return message.includes("Supabase Storage authorization failed") || message.includes("Supabase 图片库授权失败");
}

function addContentType(headers: Record<string, string>, contentType?: string) {
  if (contentType) {
    return { ...headers, "Content-Type": contentType };
  }

  return headers;
}

function storageHeaderModes(contentType?: string, token?: string) {
  const modes: Record<string, string>[] = [];

  if (supabaseServiceRoleKey) {
    const base = addContentType({ apikey: supabaseServiceRoleKey }, contentType);

    if (!isSupabasePlatformKey(supabaseServiceRoleKey)) {
      modes.push({ ...base, Authorization: `Bearer ${supabaseServiceRoleKey}` });
    } else {
      // New sb_secret_* keys are not JWTs. Supabase rejects them in the
      // Authorization header with "Invalid Compact JWS", so keep them in apikey only.
      modes.push(base);
    }
  }

  if (token && supabaseAnonKey) {
    modes.push(
      addContentType(
        {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`,
        },
        contentType
      )
    );
  }

  if (!modes.length) {
    throw new Error(storageAuthHelp("SUPABASE_SECRET_KEY is missing."));
  }

  return modes;
}

async function readErrorDetail(response: Response) {
  const text = await response.text().catch(() => "");

  if (!text) {
    return "";
  }

  try {
    const json = JSON.parse(text) as {
      error?: string;
      message?: string;
      statusCode?: string | number;
      hint?: string;
    };

    return [json.error, json.message, json.hint, json.statusCode]
      .filter(Boolean)
      .join(" ");
  } catch {
    return text;
  }
}

function isAuthFailure(status: number, detail: string) {
  const lower = detail.toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    lower.includes("authorization") ||
    lower.includes("unauthorized") ||
    lower.includes("invalid api key") ||
    lower.includes("invalid compact jws") ||
    lower.includes("jwt") ||
    lower.includes("api key") ||
    lower.includes("row-level security") ||
    lower.includes("rls")
  );
}

function formatStorageError(fallback: string, status: number, detail = "") {
  if (isAuthFailure(status, detail)) {
    return storageAuthHelp(`${status}${detail ? ` ${detail}` : ""}`);
  }

  return `${fallback}: ${status}${detail ? ` ${detail}` : ""}`;
}

async function storageFetch(
  url: string,
  init: RequestInit,
  fallback: string,
  contentType?: string,
  token?: string
): Promise<StorageResult> {
  const authErrors: string[] = [];

  for (const headers of storageHeaderModes(contentType, token)) {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...headers,
        ...((init.headers as Record<string, string> | undefined) || {}),
      },
    });

    if (response.ok) {
      return { response, detail: "" };
    }

    const detail = await readErrorDetail(response);

    if (isAuthFailure(response.status, detail)) {
      authErrors.push(`${response.status}${detail ? ` ${detail}` : ""}`);
      continue;
    }

    return { response, detail };
  }

  throw new Error(storageAuthHelp(authErrors[authErrors.length - 1] || fallback));
}

function isBucketMissing(status: number, detail: string) {
  const lower = detail.toLowerCase();

  return (
    status === 404 ||
    lower.includes("bucket not found") ||
    (lower.includes("bucket") && lower.includes("not found")) ||
    lower.includes('\"statuscode\":\"404\"') ||
    lower.includes('\"statuscode\":404')
  );
}

function isBucketAlreadyExists(status: number, detail: string) {
  const lower = detail.toLowerCase();

  return status === 409 || lower.includes("already exists") || lower.includes("duplicate");
}

export async function ensurePublicBucket(bucket = getMediaBucket(), token?: string) {
  if (!supabaseUrl) {
    throw new Error("Supabase URL is not configured.");
  }

  const baseUrl = cleanSupabaseUrl(supabaseUrl);
  let check: StorageResult;

  try {
    check = await storageFetch(
      `${baseUrl}/storage/v1/bucket/${bucket}`,
      { cache: "no-store" },
      "Storage bucket check failed",
      undefined,
      token
    );
  } catch (error) {
    if (token && isSupabaseStorageAuthorizationError(error)) {
      // Authenticated users can upload through Storage RLS even when bucket admin
      // endpoints reject non-service credentials. Let the object upload prove it.
      return;
    }

    throw error;
  }

  if (check.response.ok) {
    return;
  }

  if (!isBucketMissing(check.response.status, check.detail)) {
    throw new Error(formatStorageError("Storage bucket check failed", check.response.status, check.detail));
  }

  const create = await storageFetch(
    `${baseUrl}/storage/v1/bucket`,
    {
      method: "POST",
      body: JSON.stringify({
        id: bucket,
        name: bucket,
        public: true,
        file_size_limit: 20 * 1024 * 1024,
        allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      }),
    },
    "Storage bucket create failed",
    "application/json",
    token
  );

  if (!create.response.ok && !isBucketAlreadyExists(create.response.status, create.detail)) {
    throw new Error(formatStorageError("Storage bucket create failed", create.response.status, create.detail));
  }
}

export async function uploadPublicImageBuffer({
  buffer,
  path,
  contentType,
  bucket = getMediaBucket(),
  token,
}: {
  buffer: Buffer;
  path: string;
  contentType: string;
  bucket?: string;
  token?: string;
}) {
  await ensurePublicBucket(bucket, token);

  const baseUrl = cleanSupabaseUrl(supabaseUrl);
  const upload = await storageFetch(
    `${baseUrl}/storage/v1/object/${bucket}/${path}`,
    {
      method: "POST",
      headers: { "x-upsert": "true" },
      body: buffer,
    },
    "Image upload failed",
    contentType || "application/octet-stream",
    token
  );

  if (!upload.response.ok) {
    throw new Error(formatStorageError("Image upload failed", upload.response.status, upload.detail));
  }

  return getPublicStorageUrl(bucket, path);
}

export async function uploadPublicImage({
  file,
  path,
  bucket = getMediaBucket(),
  token,
}: {
  file: File;
  path: string;
  bucket?: string;
  token?: string;
}) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadPublicImageBuffer({
    buffer,
    path,
    bucket,
    contentType: file.type || "application/octet-stream",
    token,
  });
}

async function listStorageObjects(prefix: string, bucket = getMediaBucket()): Promise<PublicImageItem[]> {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return [];
  }

  await ensurePublicBucket(bucket);

  const baseUrl = cleanSupabaseUrl(supabaseUrl);
  const list = await storageFetch(
    `${baseUrl}/storage/v1/object/list/${bucket}`,
    {
      method: "POST",
      cache: "no-store",
      body: JSON.stringify({
        prefix,
        limit: 100,
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" },
      }),
    },
    "Storage image list failed",
    "application/json"
  );

  if (!list.response.ok) {
    console.error("Storage list failed", {
      bucket,
      prefix,
      status: list.response.status,
      detail: list.detail,
    });
    return [];
  }

  const objects = (await list.response.json()) as MediaObject[];

  return objects
    .filter((item) => item.name && !item.name.endsWith("/"))
    .map((item) => {
      const objectPath = prefix ? `${prefix}/${item.name}` : item.name;
      return {
        name: item.name,
        path: objectPath,
        url: getPublicStorageUrl(bucket, objectPath),
        size: item.metadata?.size,
        updated_at: item.updated_at || item.created_at,
      };
    });
}

export async function listPublicImages() {
  const folders = ["products", "media", "uploads"];
  const results = await Promise.all(
    folders.map((folder) =>
      listStorageObjects(folder).catch((error) => {
        console.error("Storage folder list failed", { folder, error });
        return [];
      })
    )
  );
  const flattened = results.flat();
  const seen = new Set<string>();

  return flattened
    .filter((item) => {
      if (seen.has(item.path)) {
        return false;
      }
      seen.add(item.path);
      return true;
    })
    .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
}
