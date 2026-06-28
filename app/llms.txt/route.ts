import { getProducts } from "@/app/products/product-data";
import { getSiteSettings } from "@/app/site-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function lineList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export async function GET() {
  const [site, products] = await Promise.all([getSiteSettings(), getProducts()]);
  const publishedProducts = products.slice(0, 40);
  const productLines = publishedProducts.map((product) => {
    const category = product.category ? ` (${product.category})` : "";
    return `${product.name}${category}: ${site.site_domain}/products/${product.slug}`;
  });

  const content = `# ${site.site_name}

${site.company_tagline}

FUNEL supplies online water quality analyzers, digital sensors, transmitters, controllers, sampling systems, PLC cabinets and SCADA-integrated monitoring solutions for wastewater treatment, drinking water, industrial process water, environmental monitoring and aquaculture projects.

## Primary Product Categories
${lineList([
  "Online dissolved oxygen analyzers and DO sensors",
  "pH / ORP analyzers and controllers",
  "Conductivity, TDS and salinity analyzers",
  "Turbidity and suspended solids analyzers",
  "COD, ammonia nitrogen and nutrient monitoring analyzers",
  "Multi-parameter water quality controllers",
  "PLC + SCADA monitoring systems for water treatment projects",
])}

## Published Product Pages
${productLines.length ? lineList(productLines) : "- Product pages are available at /products."}

## Buyer Questions This Site Answers
${lineList([
  "Which online analyzer is suitable for wastewater aeration, discharge monitoring or process water?",
  "What signal outputs are available for PLC, SCADA and remote monitoring?",
  "Can FUNEL support OEM, system integrators and project configuration?",
  "How can buyers request datasheets, samples and quotations?",
])}

## Important URLs
${lineList([
  `${site.site_domain}/products`,
  `${site.site_domain}/contact`,
  `${site.site_domain}/sitemap.xml`,
])}

## Contact
Email: ${site.contact_email}
WhatsApp: ${site.contact_whatsapp}
`;

  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
