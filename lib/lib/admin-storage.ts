const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

export const mediaBucket =
  process.env.SUPABASE_STORAGE_BUCKET || "product-images";

function cleanUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function isPlatformKey(key: string) {
  return key.startsWith("sb_secret_") || key.startsWith("sb_publishable_");
}

export function supabaseHeaders(extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { apikey: supabaseKey, ...extra };

  if (supabaseKey && !isPlatformKey(supabaseKey)) {
    headers.Authorization = `Bearer ${supabaseKey}`;
  }

  return headers;
}

export function lines(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function safeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function fileExtension(file: File) {
  const fromName = file.name.split(".").pop() || "";
  const fromType = file.type.split("/").pop() || "";
  const extension = (fromName || fromType || "jpg").toLowerCase();

  if (extension === "jpeg") {
    return "jpg";
  }

  return extension.replace(/[^a-z0-9]/g, "") || "jpg";
}

export function publicImageUrl(path: string, bucket = mediaBucket) {
  return `${cleanUrl(supabaseUrl)}/storage/v1/object/public/${bucket}/${path}`;
}

export async function ensurePublicBucket(bucket = mediaBucket) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase storage is not configured.");
  }

  const baseUrl = cleanUrl(supabaseUrl);
  const check = await fetch(`${baseUrl}/storage/v1/bucket/${bucket}`, {
    headers: supabaseHeaders(),
    cache: "no-store",
  });

  if (check.ok) {
    return;
  }

  if (check.status !== 404) {
    throw new Error(`Storage bucket check failed: ${check.status}`);
  }

  const create = await fetch(`${baseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: 8 * 1024 * 1024,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    }),
  });

  if (!create.ok) {
    throw new Error(`Storage bucket create failed: ${create.status}`);
  }
}

export async function uploadImage(file: File, slug = "product") {
  if (!file || file.size === 0) {
    return "";
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image is too large. Please upload an image under 8 MB.");
  }

  await ensurePublicBucket();

  const safeSlug = safeSegment(slug) || "product";
  const path = `products/${safeSlug}-${Date.now()}.${fileExtension(file)}`;
  const response = await fetch(
    `${cleanUrl(supabaseUrl)}/storage/v1/object/${mediaBucket}/${path}`,
    {
      method: "POST",
      headers: supabaseHeaders({
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      }),
      body: file,
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Image upload failed: ${response.status} ${detail}`);
  }

  return publicImageUrl(path);
}

export async function listProductImages() {
  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  await ensurePublicBucket();

  const response = await fetch(
    `${cleanUrl(supabaseUrl)}/storage/v1/object/list/${mediaBucket}`,
    {
      method: "POST",
      headers: supabaseHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        prefix: "products",
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return [];
  }

  const rows = (await response.json()) as Array<{ name: string }>;

  return rows
    .filter((row) => row.name && row.name.includes("."))
    .map((row) => ({
      name: row.name,
      url: publicImageUrl(`products/${row.name}`),
    }));
}

