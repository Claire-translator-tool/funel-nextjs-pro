import type { MetadataRoute } from "next";
import { getPublishedPages, pagePath } from "./page-content";
import { getProducts } from "./products/product-data";
import { getSiteSettings } from "./site-settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, pages, products] = await Promise.all([getSiteSettings(), getPublishedPages(), getProducts()]);
  const paths = new Set<string>();

  pages.forEach((page) => paths.add(pagePath(page.slug)));
  paths.add("");
  paths.add("/products");
  paths.add("/contact");
  products.forEach((product) => paths.add(`/products/${product.slug}`));

  return Array.from(paths).map((path) => ({
    url: `${site.site_domain}${path}`,
    lastModified: new Date(),
  }));
}
