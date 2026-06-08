export type CmsPage = {
  slug: string;
  title: string;
  blocks?: Record<string, unknown> | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published?: boolean | null;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

function headers() {
  const h: Record<string, string> = { apikey: key };
  if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) h.Authorization = `Bearer ${key}`;
  return h;
}

function normalize(data: CmsPage[]) {
  return data.filter((page) => page.slug && page.title && page.published !== false);
}

export function pagePath(slug: string) {
  if (slug === "home") return "";
  if (slug === "products") return "/products";
  if (slug === "contact") return "/contact";
  return `/${slug}`;
}

export function blockText(blocks: CmsPage["blocks"], keyName: string, fallback: string) {
  const value = blocks?.[keyName];
  return typeof value === "string" && value.trim() ? value : fallback;
}

export async function getPageContent(slug: string): Promise<CmsPage | null> {
  if (!url || !key) return null;
  const select = "slug,title,blocks,seo_title,seo_description,published";

  try {
    const res = await fetch(
      `${url}/rest/v1/pages?select=${select}&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`,
      { headers: headers(), next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const rows = normalize((await res.json()) as CmsPage[]);
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function getPublishedPages(): Promise<CmsPage[]> {
  if (!url || !key) return [];
  const select = "slug,title,blocks,seo_title,seo_description,published";

  try {
    const res = await fetch(`${url}/rest/v1/pages?select=${select}&published=eq.true&order=created_at.asc`, {
      headers: headers(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return normalize((await res.json()) as CmsPage[]);
  } catch {
    return [];
  }
}
