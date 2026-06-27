import { supabaseServiceRoleKey, supabaseUrl } from "./supabase";
const bucketName = "product-images";

function cleanUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function isPlatformKey(key: string) {
  return key.startsWith("sb_secret_") || key.startsWith("sb_publishable_");
}

async function storageError(response: Response, fallback: string) {
  const detail = await response.text().catch(() => "");
  return `${fallback}: ${response.status}${detail ? ` - ${detail}` : ""}`;
}

function storageHeaders(contentType?: string) {
  const headers: Record<string, string> = { apikey: supabaseServiceRoleKey };
  if (supabaseServiceRoleKey && !isPlatformKey(supabaseServiceRoleKey)) {
    headers.Authorization = `Bearer ${supabaseServiceRoleKey}`;
  }
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

async function ensurePublicBucket(bucket = bucketName) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase Storage is not configured.");
  }

  const baseUrl = cleanUrl(supabaseUrl);
  const check = await fetch(`${baseUrl}/storage/v1/bucket/${bucket}`, {
    headers: storageHeaders(),
    cache: "no-store",
  });

  if (check.ok) return;
  if (check.status !== 404) {
    throw new Error(await storageError(check, "Storage bucket check failed"));
  }

  const create = await fetch(`${baseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: storageHeaders("application/json"),
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: 20 * 1024 * 1024,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    }),
  });

  if (!create.ok && create.status !== 409) {
    throw new Error(await storageError(create, "Storage bucket create failed"));
  }
}

export async function uploadPublicImage({ file, path }: { file: File; path: string }) {
  await ensurePublicBucket();
  const baseUrl = cleanUrl(supabaseUrl);
  const res = await fetch(`${baseUrl}/storage/v1/object/${bucketName}/${path}`, {
    method: "POST",
    headers: {
      ...storageHeaders(file.type),
      "x-upsert": "true",
    },
    body: file,
  });
  if (!res.ok) throw new Error(await storageError(res, "Product image upload failed"));
  return `${baseUrl}/storage/v1/object/public/${bucketName}/${path}`;
}

export async function uploadPublicImageBuffer({ buffer, path, contentType, bucket = bucketName }: any) {
  await ensurePublicBucket(bucket);
  const baseUrl = cleanUrl(supabaseUrl);
  const res = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: { ...storageHeaders(contentType), "x-upsert": "true" },
    body: buffer,
  });
  if (!res.ok) throw new Error(await storageError(res, "Media upload failed"));
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export async function listPublicImages() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return [];
  await ensurePublicBucket();
  const baseUrl = cleanUrl(supabaseUrl);
  const res = await fetch(`${baseUrl}/storage/v1/object/list/${bucketName}`, {
    method: "POST",
    headers: storageHeaders("application/json"),
    body: JSON.stringify({ prefix: "products", limit: 100 }),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.filter((f: any) => f.name && !f.name.endsWith("/")).map((f: any) => ({
    name: f.name,
    path: `products/${f.name}`,
    url: `${baseUrl}/storage/v1/object/public/${bucketName}/products/${f.name}`,
    updated_at: f.updated_at,
  }));
}
