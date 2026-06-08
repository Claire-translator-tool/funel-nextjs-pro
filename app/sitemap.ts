import type { MetadataRoute } from "next";

const domain = "https://www.funelsensor.com";
const products = [
  "pfdo-800-dissolved-oxygen-analyzer",
  "ph-orp-online-analyzer",
  "conductivity-tds-salinity-analyzer",
  "muc-200-multi-parameter-controller",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/products", "/contact", ...products.map((slug) => `/products/${slug}`)].map((path) => ({
    url: `${domain}${path}`,
    lastModified: new Date(),
  }));
}
