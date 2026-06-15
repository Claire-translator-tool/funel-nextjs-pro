const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
export const mediaBucket = "product-images";

export function supabaseHeaders(extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { apikey: supabaseKey, ...extra };
  if (supabaseKey && !supabaseKey.startsWith("sb_secret_") && !supabaseKey.startsWith("sb_publishable_")) {
    headers.Authorization = `Bearer ${supabaseKey}`;
  }
  return headers;
}

export function lines(value: FormDataEntryValue | null) {
  return String(value || "").split(/\n|,/).map(s => s.trim()).filter(Boolean);
}

export async function uploadImage(file: File, slug = "img") {
  const path = `products/${slug}-${Date.now()}.${file.name.split('.').pop()}`;
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${mediaBucket}/${path}`, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": file.type, "x-upsert": "true" }),
    body: file
  });
  if (!res.ok) throw new Error("Upload failed");
  return `${supabaseUrl}/storage/v1/object/public/${mediaBucket}/${path}`;
}

export async function listProductImages() {
  if (!supabaseUrl || !supabaseKey) return [];
  const res = await fetch(`${supabaseUrl}/storage/v1/object/list/${mediaBucket}`, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefix: "products", limit: 100 })
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.filter((f: any) => f.name && f.name.includes(".")).map((f: any) => ({ 
    name: f.name, 
    url: `${supabaseUrl}/storage/v1/object/public/${mediaBucket}/products/${f.name}` 
  }));
}
