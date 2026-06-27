import { products as fallbackProducts } from "@/lib/site";
import { hasSupabaseAdminConfig, supabaseRest } from "@/lib/supabase";
import type { CmsProduct } from "@/lib/types";

export async function getPublicProducts() {
  if (!hasSupabaseAdminConfig()) return fallbackProducts.map(p => ({ ...p, published: true }));
  try {
    const rows = await supabaseRest<CmsProduct[]>("products?published=eq.true&select=*&order=created_at.asc");
    return rows.length ? rows : fallbackProducts.map(p => ({ ...p, published: true }));
  } catch { return fallbackProducts.map(p => ({ ...p, published: true })); }
}

export async function listAdminProducts() {
  if (!hasSupabaseAdminConfig()) return fallbackProducts.map(p => ({ ...p, published: true }));
  try {
    return await supabaseRest<CmsProduct[]>("products?select=*&order=created_at.asc");
  } catch { return fallbackProducts.map(p => ({ ...p, published: true })); }
}
