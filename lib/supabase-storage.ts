import { supabaseServiceRoleKey, supabaseUrl } from "./supabase";

const bucketName = "product-images";

async function storageError(response: Response, fallback: string) {
  const detail = await response.text().catch(() => "");
  return `${fallback}: ${response.status}${detail ? ` - ${detail}` : ""}`;
}

function storageHeaders(contentType?: string) {
  const headers: Record<string, string> = { apikey: supabaseServiceRoleKey };
  if (supabaseServiceRoleKey && !supabaseServiceRoleKey.startsWith("sb_")) {
    headers.Authorization = `Bearer ${supabaseServiceRoleKey}`;
  }
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

async function ensureBucket(bucket = bucketName) {
  if (!supabaseUrl || !supabaseServiceRoleKey) return;
  const check = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucket}`, {
    headers: storageHeaders(),
    cache: "no-store",
  });
  if (check.ok) return;
  if (check.status !== 404) return; // bucket exists or unknown error, proceed
  await fetch(`${supabaseUrl}/storage/v1/bucket`, {
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
}

export async function uploadPublicImage({ file, path }: { file: File; path: string }) {
  await ensureBucket();
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${path}`, {
    method: "POST",
    headers: {
      ...storageHeaders(file.type),
      "x-upsert": "true",
    },
    body: file,
  });
  if (!res.ok) throw new Error(await storageError(res, "Product image upload failed"));
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;
}

export async function uploadPublicImageBuffer({
  buffer,
  path,
  contentType,
  bucket = bucketName,
}: {
  buffer: Buffer;
  path: string;
  contentType: string;
  bucket?: string;
}) {
  await ensureBucket(bucket);
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: { ...storageHeaders(contentType), "x-upsert": "true" },
    body: buffer,
  });
  if (!res.ok) throw new Error(await storageError(res, "Media upload failed"));
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export async function listPublicImages() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return [];
  const res = await fetch(`${supabaseUrl}/storage/v1/object/list/${bucketName}`, {
    method: "POST",
    headers: storageHeaders("application/json"),
    body: JSON.stringify({ prefix: "products", limit: 200, offset: 0 }),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data as Array<{ name: string; updated_at?: string }>)
    .filter((f) => f.name && f.name.includes("."))
    .map((f) => ({
      name: f.name,
      path: `products/${f.name}`,
      url: `${supabaseUrl}/storage/v1/object/public/${bucketName}/products/${f.name}`,
      updated_at: f.updated_at,
    }));
}
