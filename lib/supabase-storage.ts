import {
  cleanSupabaseUrl,
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

function cleanKey(value: string) {
  return value.trim();
}

function shouldSendBearerForServerKey(key: string) {
  const value = cleanKey(key);
  // Supabase's new sb_secret_ keys must be sent as apikey only. The
  // Authorization header is reserved for legacy JWT service_role keys.
  return Boolean(
    value &&
      !value.startsWith("sb_secret_") &&
      !value.startsWith("sb_publishable_") &&
      value.split(".").length === 3
  );
}

export function getMediaBucket() {
  return (process.env.SUPABASE_STORAGE_BUCKET || defaultBucket).trim() || defaultBucket;
}

export function getPublicStorageUrl(bucket: string, path: string) {
  return `${cleanSupabaseUrl(supabaseUrl)}/storage/v1/object/public/${bucket}/${path}`;
}

function looksLikeRlsFailure(detail: string) {
  const lower = detail.toLowerCase();
  return lower.includes("row-level security") || lower.includes("rls") || lower.includes("42501");
}

function looksLikeJwsFailure(detail: string) {
  const lower = detail.toLowerCase();
  return lower.includes("invalid compact jws") || lower.includes("jwt");
}

function looksLikeInvalidKeyFailure(detail: string) {
  const lower = detail.toLowerCase();
  return lower.includes("invalid api key") || lower.includes("api key might also be owned by another supabase project");
}

function storageAuthHelp(lastDetail = "") {
  const suffix = lastDetail ? ` Last response: ${lastDetail}` : "";
  const invalidKeyHint = looksLikeInvalidKeyFailure(lastDetail)
    ? " The current Vercel SUPABASE_SECRET_KEY is not accepted by project givzkjmmxmrxcxtlwlys. Replace the existing variable, do not add a duplicate, then redeploy. 当前 Vercel 里的 SUPABASE_SECRET_KEY 没被 givzkjmmxmrxcxtlwlys 项目接受；请编辑已有变量，不要新增重复变量，然后重新部署。"
    : "";
  const rlsHint = looksLikeRlsFailure(lastDetail)
    ? " If SUPABASE_SECRET_KEY is correct, run the /admin/system one-time Storage RLS SQL. 如果服务端密钥确认正确，请打开 /admin/system 并运行一次 Storage 权限 SQL。"
    : "";
  const jwsHint = looksLikeJwsFailure(lastDetail)
    ? " A new sb_secret key must not be treated as a browser JWT. This code sends it only from the server. 新版 sb_secret 只能在服务端使用，本代码不会把它发到浏览器。"
    : "";

  return [
    "Supabase Storage authorization failed.",
    "Admin image uploads must pass with the server-side SUPABASE_SECRET_KEY for project givzkjmmxmrxcxtlwlys.",
    "Verify Vercel env vars: NEXT_PUBLIC_SUPABASE_URL=https://givzkjmmxmrxcxtlwlys.supabase.co, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, SUPABASE_STORAGE_BUCKET=product-images, then redeploy.",
    "Supabase 图片库授权失败。后台图片上传必须使用 givzkjmmxmrxcxtlwlys 项目的服务端 SUPABASE_SECRET_KEY。请确认 Vercel 环境变量和 product-images 存储桶后重新部署。",
    invalidKeyHint,
    jwsHint,
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
  const serverKey = cleanKey(supabaseServiceRoleKey);
  const publicKey = cleanKey(supabaseAnonKey);
  const sessionToken = token ? cleanKey(token) : "";

  if (serverKey) {
    const authHeaders: Record<string, string> = { apikey: serverKey };

    if (shouldSendBearerForServerKey(serverKey)) {
      authHeaders.Authorization = `Bearer ${serverKey}`;
    }

    modes.push(addContentType(authHeaders, contentType));

    // When a server key is configured, do not fall back to the user JWT.
    // A bad server key should fail clearly instead of surfacing confusing RLS errors.
    return modes;
  }

  if (sessionToken && publicKey) {
    modes.push(
      addContentType(
        {
          apikey: publicKey,
          Authorization: `Bearer ${sessionToken}`,
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
    if (!supabaseServiceRoleKey && token && isSupabaseStorageAuthorizationError(error)) {
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
