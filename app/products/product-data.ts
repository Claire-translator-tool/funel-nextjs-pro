import { hasSupabaseAdminConfig, supabaseRest } from "@/lib/supabase";

export type Product = {
  slug: string;
  model?: string | null;
  name: string;
  category?: string | null;
  summary?: string | null;
  specs?: string[] | null;
  applications?: string[] | null;
  benefits?: string[] | null;
  image_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  updated_at?: string | null;
};

const analyzerImage = "https://sc01.alicdn.com/kf/A7a9e8ba9d0ee48089a75084483e264beq.png";
const controllerImage = "https://sc01.alicdn.com/kf/A720309b651ed4be6b3a7d972061cbea2Z.png";

function normalizeProducts(data: Product[]) {
  return data.filter((product) => product.slug && product.name);
}

export function productImage(product?: Product | null) {
  if (!product) return analyzerImage;
  if (product.image_url?.startsWith("http") || product.image_url?.startsWith("/")) return product.image_url;
  if (product.slug.includes("conductivity") || product.slug.includes("controller") || product.slug.includes("mp301")) return controllerImage;
  return analyzerImage;
}

export async function getProducts() {
  if (!hasSupabaseAdminConfig()) return [];
  const select = "slug,model,name,category,summary,specs,applications,benefits,image_url,seo_title,seo_description,seo_keywords,updated_at";
  try {
    const data = normalizeProducts(
      await supabaseRest<Product[]>(`products?select=${select}&published=eq.true&order=created_at.asc`, {
        next: { revalidate: 60, tags: ["products"] },
      })
    );
    return data;
  } catch (error) {
    console.error("Public product list failed", error);
    return [];
  }
}

export async function getProductBySlug(slug: string, options: { includeDraft?: boolean } = {}) {
  if (!hasSupabaseAdminConfig()) return null;
  const select = "slug,model,name,category,summary,specs,applications,benefits,image_url,seo_title,seo_description,seo_keywords,updated_at";
  const publishedFilter = options.includeDraft ? "" : "&published=eq.true";

  try {
    const data = normalizeProducts(
      await supabaseRest<Product[]>(
        `products?select=${select}&slug=eq.${encodeURIComponent(slug)}${publishedFilter}&order=updated_at.desc&limit=1&offset=0`,
        options.includeDraft
          ? { cache: "no-store" }
          : { next: { revalidate: 60, tags: ["products", `product:${slug}`] } }
      )
    );
    return data[0] || null;
  } catch (error) {
    console.error("Public product detail failed", error);
    return null;
  }
}
