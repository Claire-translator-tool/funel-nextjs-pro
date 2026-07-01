import { cleanSupabaseUrl, supabaseApiHeaders, supabaseServiceRoleKey, supabaseUrl } from "./supabase";
const bucketName = "product-images";

async function storageError(response: Response, fallback: string) {
  const detail = await response.text().catch(() => "");
  return formatStorageError(response, fallback, detail);
}

function formatStorageError(response: Response, fallback: string, detail = "") {
  return `${fallback}: ${response.status}${detail ? ` - ${detail}` : ""}`;
}

function isMissingBucketResponse(response: Response, detail: string) {
  const message = detail.toLowerCase();

  return (
    response.status === 404 ||
    (response.status === 400 && message.includes("not found")) ||
    (message.includes("bucket") && message.includes("not found")) ||
    message.includes("bucket not found") ||
    message.includes('\"statuscode\":\"404\"') ||
    message.includes('\"statuscode\":404')
  );
}

function storageHeaders(contentType?: string) {
  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SECRET_KEY is not configured.");
  }

  const headers = supabaseApiHeaders(supabaseServiceRoleKey, {
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
  });

  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

async function ensurePublicBucket(bucket = bucketName) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase Storage is not configured.");
  }

  const baseUrl = cleanSupabaseUrl(supabaseUrl);
  const check = await fetch(`${baseUrl}/storage/v1/bucket/${bucket}`, {
    headers: storageHeaders(),
    cache: "no-store",
  });

  if (check.ok) return;
  const checkDetail = await check.text().catch(() => "");
  if (!isMissingBucketResponse(check, checkDetail)) {
    throw new Error(formatStorageError(check, "Storage bucket check failed", checkDetail));
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
    const createDetail = await create.text().catch(() => "");
    const lowered = createDetail.toLowerCase();
    if (!lowered.includes("already exists") && !lowered.includes("duplicate")) {
      throw new Error(formatStorageError(create, "Storage bucket create failed", createDetail));
    }
  }
}

export async function uploadPublicImage({ file, path }: { file: File; path: string }) {
  await ensurePublicBucket();
  const baseUrl = cleanSupabaseUrl(supabaseUrl);
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
  const baseUrl = cleanSupabaseUrl(supabaseUrl);
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
  const baseUrl = cleanSupabaseUrl(supabaseUrl);
  const res = await fetch(`${baseUrl}/storage/v1/object/list/${bucketName}`, {
    method: "POST",
    headers: storageHeaders("application/json"),
    body: JSON.stringify({ prefix: "products", limit: 100 }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await storageError(res, "Storage image list failed"));
  }
  const data = await res.json();
  return data.filter((f: any) => f.name && !f.name.endsWith("/")).map((f: any) => ({
    name: f.name,
    path: `products/${f.name}`,
    url: `${baseUrl}/storage/v1/object/public/${bucketName}/products/${f.name}`,
    updated_at: f.updated_at,
  }));
}
