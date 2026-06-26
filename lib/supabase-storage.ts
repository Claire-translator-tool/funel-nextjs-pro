import { supabaseServiceRoleKey, supabaseUrl } from "./supabase";
const bucketName = "product-images";

function storageHeaders(contentType?: string) {
  const headers: Record<string, string> = { apikey: supabaseServiceRoleKey };
  if (supabaseServiceRoleKey && !supabaseServiceRoleKey.startsWith("sb_")) {
    headers.Authorization = `Bearer ${supabaseServiceRoleKey}`;
  }
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

export async function uploadPublicImage({ file, path }: { file: File; path: string }) {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${path}`, {
    method: "POST",
    headers: {
      ...storageHeaders(file.type),
      "x-upsert": "true"
    },
    body: file
  });
  if (!res.ok) throw new Error("Upload failed");
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;
}

export async function uploadPublicImageBuffer({ buffer, path, contentType, bucket = bucketName }: any) {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: { ...storageHeaders(contentType), "x-upsert": "true" },
    body: buffer
  });
  if (!res.ok) throw new Error("Upload failed");
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export async function listPublicImages() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return [];
  const res = await fetch(`${supabaseUrl}/storage/v1/object/list/${bucketName}`, {
    method: "POST",
    headers: storageHeaders("application/json"),
    body: JSON.stringify({ prefix: "products", limit: 100 })
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.filter((f: any) => f.name && !f.name.endsWith("/")).map((f: any) => ({
    name: f.name,
    path: `products/${f.name}`,
    url: `${supabaseUrl}/storage/v1/object/public/${bucketName}/products/${f.name}`,
    updated_at: f.updated_at
  }));
    }
