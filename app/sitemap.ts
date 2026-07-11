import type { MetadataRoute } from "next";
import { getPublishedPages, pagePath } from "./page-content";
import { getProducts } from "./products/product-data";
import { getSiteSettings } from "./site-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, pages, products] = await Promise.all([
    getSiteSettings(),
    getPublishedPages(),
    getProducts(),
  ]);
  const paths = new Set<string>();


  // Base paths
  paths.add("");
  paths.add("/zh");
  paths.add("/products");
  paths.add("/contact");


  // Dynamic pages
  pages.forEach((page) => paths.add(pagePath(page.slug)));
  products.forEach((product) => paths.add(`/products/${product.slug}`));


  return Array.from(paths).map((path) => ({
    url: `${site.site_domain}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/zh" ? "daily" : "weekly",
    priority: path === "" ? 1.0 : path === "/zh" ? 0.9 : 0.7,
  }));
}
