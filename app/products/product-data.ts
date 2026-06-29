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

const fallbackProducts: Product[] = [
  {
    slug: "online-dissolved-oxygen-analyzer-pfdo-800",
    model: "PFDO-800",
    name: "PFDO-800 Online Dissolved Oxygen Analyzer for Wastewater and Aeration Control",
    category: "Dissolved Oxygen Analyzer",
    summary: "PFDO-800 is an online dissolved oxygen analyzer designed for continuous DO monitoring in wastewater treatment, aeration tanks, aquaculture, and industrial process water.",
    specs: ["Measurement parameter: Dissolved Oxygen", "Measuring range: 0-20 mg/L", "Signal output: 4-20 mA / RS485 Modbus", "Temperature compensation: Automatic temperature compensation", "Monitoring mode: Continuous online measurement"],
    applications: ["Wastewater aeration tank DO monitoring", "Municipal wastewater treatment plants", "Industrial wastewater treatment systems", "Aquaculture dissolved oxygen monitoring", "PLC and SCADA water monitoring systems"],
    benefits: ["Supports continuous online dissolved oxygen monitoring", "Helps optimize aeration control and reduce energy cost", "Suitable for wastewater, aquaculture and industrial water applications", "Easy integration with PLC and SCADA"],
    seo_title: "PFDO-800 Online Dissolved Oxygen Analyzer for Wastewater Aeration Control",
    seo_description: "PFDO-800 online dissolved oxygen analyzer is designed for continuous DO monitoring in wastewater treatment, aeration control, aquaculture and industrial process water.",
    seo_keywords: ["online dissolved oxygen analyzer", "dissolved oxygen analyzer for wastewater", "DO analyzer for aeration tank", "online DO meter"],
  },
  { slug: "ph-orp-online-analyzer", name: "Online pH ORP Analyzer", category: "pH / ORP", summary: "Online pH and ORP measurement for dosing, neutralization, wastewater and industrial water.", specs: ["pH: 0-14", "ORP: -2000 to +2000 mV", "4-20mA / RS485 Modbus"] },
  { slug: "conductivity-tds-salinity-analyzer", name: "Conductivity TDS Salinity Analyzer", category: "Conductivity", summary: "Online conductivity, TDS and salinity monitoring for RO, boiler, cooling and process water.", specs: ["Conductivity / TDS / salinity", "Temperature compensation", "RS485 Modbus"] },
  { slug: "turbidity-online-analyzer", name: "Online Turbidity Analyzer", category: "Turbidity", summary: "Online turbidity monitoring for waterworks, wastewater discharge and surface water projects.", specs: ["Online turbidity monitoring", "Digital sensor support", "Continuous water quality control"] },
  { slug: "mp301-multi-parameter-controller", name: "Multi-Parameter Water Quality Controller", category: "Controller", summary: "Multi-parameter controller for pH, ORP, conductivity, turbidity, DO and integrated stations.", specs: ["Multi-channel monitoring", "RS485 / 4-20mA", "Cabinet integration"] },
  { slug: "cod-ammonia-nitrogen-analyzer", name: "COD and Ammonia Nitrogen Analyzer", category: "Nutrient Monitoring", summary: "Online COD and ammonia nitrogen analyzer for wastewater discharge and compliance monitoring.", specs: ["COD / ammonia nitrogen monitoring", "Wastewater discharge applications", "Project configuration support"] },
];

const fallbackSlugAliases: Record<string, string> = {
  "pfdo-800-dissolved-oxygen-analyzer": "online-dissolved-oxygen-analyzer-pfdo-800",
  "online-dissolved-oxygen-analyzer": "online-dissolved-oxygen-analyzer-pfdo-800",
};

function normalizeProducts(data: Product[]) {
  return data.filter((product) => product.slug && product.name);
}

function findFallbackProductBySlug(slug: string) {
  const canonicalSlug = fallbackSlugAliases[slug] || slug;
  return fallbackProducts.find((product) => product.slug === canonicalSlug) || null;
}

export function productImage(product: Product) {
  if (product.image_url?.startsWith("http") || product.image_url?.startsWith("/")) return product.image_url;
  if (product.slug.includes("conductivity") || product.slug.includes("controller") || product.slug.includes("mp301")) return controllerImage;
  return analyzerImage;
}

export async function getProducts() {
  if (!hasSupabaseAdminConfig()) return fallbackProducts;
  const select = "slug,model,name,category,summary,specs,applications,benefits,image_url,seo_title,seo_description,seo_keywords,updated_at";
  try {
    const data = normalizeProducts(
      await supabaseRest<Product[]>(`products?select=${select}&published=eq.true&order=created_at.asc`, {
        cache: "no-store",
      })
    );
    return data.length ? data : fallbackProducts;
  } catch (error) {
    console.error("Public product list failed", error);
    return fallbackProducts;
  }
}

export async function getProductBySlug(slug: string, options: { includeDraft?: boolean } = {}) {
  if (!hasSupabaseAdminConfig()) return findFallbackProductBySlug(slug);
  const select = "slug,model,name,category,summary,specs,applications,benefits,image_url,seo_title,seo_description,seo_keywords,updated_at";
  const publishedFilter = options.includeDraft ? "" : "&published=eq.true";

  try {
    const data = normalizeProducts(
      await supabaseRest<Product[]>(
        `products?select=${select}&slug=eq.${encodeURIComponent(slug)}${publishedFilter}&limit=1`,
        { cache: "no-store" }
      )
    );
    return data[0] || findFallbackProductBySlug(slug);
  } catch (error) {
    console.error("Public product detail failed", error);
    return findFallbackProductBySlug(slug);
  }
}
