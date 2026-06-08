import type { MetadataRoute } from "next";
import { getProducts } from "./products/product-data";

const domain = "https://www.funelsensor.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const staticPaths = ["", "/products", "/contact"];
  const productPaths = products.map((product) => `/products/${product.slug}`);

  return [...staticPaths, ...productPaths].map((path) => ({
    url: `${domain}${path}`,
    lastModified: new Date(),
  }));
}
