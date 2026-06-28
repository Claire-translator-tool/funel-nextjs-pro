import { cleanSupabaseUrl, supabaseApiHeaders, supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase";

const supabaseKey = supabaseServiceRoleKey;

export const mediaBucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

export function supabaseHeaders(extra: Record<string, string> = {}) {
  return supabaseApiHeaders(supabaseKey, extra);
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

  return extension === "jpeg" ? "jpg" : extension.replace(/[^a-z0-9]/g, "") || "jpg";
}

export function publicImageUrl(path: string, bucket = mediaBucket) {
  return `${cleanSupabaseUrl(supabaseUrl)}/storage/v1/object/public/${bucket}/${path}`;
}

function formatStorageError(response: Response, fallback: string, detail = "") {
  return `${fallback}: ${response.status}${detail ? ` - ${detail}` : ""}`;
}

function isMissingBucketResponse(response: Response, detail: string) {
  const message = detail.toLowerCase();

  return (
    response.status === 404 ||
    message.includes("bucket not found") ||
    message.includes('"statuscode":"404"') ||
    message.includes('"statuscode":404')
  );
}

async function ensurePublicBucket(bucket = mediaBucket) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase storage is not configured.");
  }

  const baseUrl = cleanSupabaseUrl(supabaseUrl);
  const check = await fetch(`${baseUrl}/storage/v1/bucket/${bucket}`, {
    headers: supabaseHeaders(),
    cache: "no-store",
  });

  if (check.ok) return;
  const checkDetail = await check.text().catch(() => "");
  if (!isMissingBucketResponse(check, checkDetail)) {
    throw new Error(formatStorageError(check, "Storage bucket check failed", checkDetail));
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

  if (!create.ok && create.status !== 409) {
    const createDetail = await create.text().catch(() => "");
    throw new Error(formatStorageError(create, "Storage bucket create failed", createDetail));
  }
}

export async function uploadImage(file: File, slug = "product") {
  if (!file || file.size === 0) return "";
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image is too large. Please upload an image under 8 MB.");
  }

  await ensurePublicBucket();

  const safeSlug = safeSegment(slug) || "product";
  const path = `products/${safeSlug}-${Date.now()}.${fileExtension(file)}`;
  const response = await fetch(`${cleanSupabaseUrl(supabaseUrl)}/storage/v1/object/${mediaBucket}/${path}`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    }),
    body: file,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Image upload failed: ${response.status} ${detail}`);
  }

  return publicImageUrl(path);
}

export async function listProductImages() {
  if (!supabaseUrl || !supabaseKey) return [];

  try {
    await ensurePublicBucket();
  } catch {
    return [];
  }

  const response = await fetch(`${cleanSupabaseUrl(supabaseUrl)}/storage/v1/object/list/${mediaBucket}`, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      prefix: "products",
      limit: 100,
      
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    }),
    cache: "no-store",
  });

  if (!response.ok) return [];

  const rows = (await response.json()) as Array<{ name: string }>;
  return rows
    .filter((row) => row.name && row.name.includes("."))
    .map((row) => ({
      name: row.name,
      url: publicImageUrl(`products/${row.name}`),
    }));
}
