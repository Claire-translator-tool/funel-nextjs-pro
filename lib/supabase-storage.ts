const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const bucketName = "product-images";
function storageHeaders(contentType?: string) {
  const h: any = { apikey: supabaseKey };
  if (supabaseKey && !supabaseKey.startsWith("sb_")) h.Authorization = `Bearer ${supabaseKey}`;
  if (contentType) h["Content-Type"] = contentType;
  return h;
}
export async function uploadPublicImageBuffer({ buffer, path, contentType, bucket = bucketName }: any) {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, { method: "POST", headers: { ...storageHeaders(contentType), "x-upsert": "true" }, body: buffer });
  if (!res.ok) throw new Error("Upload failed");
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
export async function listPublicImages() {
  if (!supabaseUrl || !supabaseKey) return [];
  const res = await fetch(`${supabaseUrl}/storage/v1/object/list/${bucketName}`, { method: "POST", headers: storageHeaders("application/json"), body: JSON.stringify({ prefix: "products", limit: 100 }) });
  if (!res.ok) return [];
  const data = await res.json();
  return data.filter((f: any) => f.name && !f.name.endsWith("/")).map((f: any) => ({ name: f.name, path: `products/${f.name}`, url: `${supabaseUrl}/storage/v1/object/public/${bucketName}/products/${f.name}`, updated_at: f.updated_at }));
}
