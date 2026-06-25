const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

const bucketName = "product-images";

function supabaseHeaders(extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { apikey: supabaseKey, ...extra };
  if (supabaseKey && !supabaseKey.startsWith("sb_")) {
    headers.Authorization = `Bearer ${supabaseKey}`;
  }
  return headers;
}

export async function uploadPublicImage({ file, path }: { file: File; path: string }) {
  const url = `${supabaseUrl}/storage/v1/object/${bucketName}/${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": file.type, "x-upsert": "true" }),
    body: file,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;
}

export async function uploadPublicImageBuffer({
  buffer,
  path,
  contentType,
}: {
  buffer: Buffer;
  path: string;
  contentType: string;
}) {
  const url = `${supabaseUrl}/storage/v1/object/${bucketName}/${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": contentType, "x-upsert": "true" }),
    body: buffer,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;
}

export async function listPublicImages() {
  if (!supabaseUrl || !supabaseKey) return [];
  
  const url = `${supabaseUrl}/storage/v1/object/list/${bucketName}`;
  const response = await fetch(url, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefix: "products", limit: 100, sortBy: { column: "name", order: "desc" } }),
  });

  if (!response.ok) return [];
  const files = await response.json();
  return files
    .filter((f: any) => f.name && f.name.includes("."))
    .map((f: any) => ({
      name: f.name,
      path: `products/${f.name}`,
      url: `${supabaseUrl}/storage/v1/object/public/${bucketName}/products/${f.name}`,
    }));
}
