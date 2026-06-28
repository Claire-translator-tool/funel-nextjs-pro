import { supabaseApiHeaders } from "@/lib/supabase";

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const analyzerImage = "https://sc01.alicdn.com/kf/A7a9e8ba9d0ee48089a75084483e264beq.png";
const controllerImage = "https://sc01.alicdn.com/kf/A720309b651ed4be6b3a7d972061cbea2Z.png";

const fallbackProducts: Product[] = [
  { slug: "pfdo-800-dissolved-oxygen-analyzer", name: "Online Dissolved Oxygen Analyzer", category: "Dissolved Oxygen", summary: "Online DO monitoring for aeration tanks, wastewater treatment, aquaculture and process water.", specs: ["Range: 0-20 mg/L", "4-20mA / RS485 Modbus", "Continuous online monitoring"] },
  { slug: "ph-orp-online-analyzer", name: "Online pH ORP Analyzer", category: "pH / ORP", summary: "Online pH and ORP measurement for dosing, neutralization, wastewater and industrial water.", specs: ["pH: 0-14", "ORP: -2000 to +2000 mV", "4-20mA / RS485 Modbus"] },
  { slug: "conductivity-tds-salinity-analyzer", name: "Conductivity TDS Salinity Analyzer", category: "Conductivity", summary: "Online conductivity, TDS and salinity monitoring for RO, boiler, cooling and process water.", specs: ["Conductivity / TDS / salinity", "Temperature compensation", "RS485 Modbus"] },
  { slug: "turbidity-online-analyzer", name: "Online Turbidity Analyzer", category: "Turbidity", summary: "Online turbidity monitoring for waterworks, wastewater discharge and surface water projects.", specs: ["Online turbidity monitoring", "Digital sensor support", "Continuous water quality control"] },
  { slug: "mp301-multi-parameter-controller", name: "Multi-Parameter Water Quality Controller", category: "Controller", summary: "Multi-parameter controller for pH, ORP, conductivity, turbidity, DO and integrated stations.", specs: ["Multi-channel monitoring", "RS485 / 4-20mA", "Cabinet integration"] },
  { slug: "cod-ammonia-nitrogen-analyzer", name: "COD and Ammonia Nitrogen Analyzer", category: "Nutrient Monitoring", summary: "Online COD and ammonia nitrogen analyzer for wastewater discharge and compliance monitoring.", specs: ["COD / ammonia nitrogen monitoring", "Wastewater discharge applications", "Project configuration support"] },
];

function headers() {
  return supabaseApiHeaders(key);
}

function normalizeProducts(data: Product[]) {
  return data.filter((product) => product.slug && product.name);
}

export function productImage(product: Product) {
  if (product.image_url?.startsWith("http")) return product.image_url;
  if (product.slug.includes("conductivity") || product.slug.includes("controller") || product.slug.includes("mp301")) return controllerImage;
  return analyzerImage;
}

export async function getProducts() {
  if (!url || !key) return fallbackProducts;
  const select = "slug,model,name,category,summary,specs,applications,benefits,image_url,seo_title,seo_description,seo_keywords,updated_at";
  try {
    const res = await fetch(`${url}/rest/v1/products?select=${select}&published=eq.true&order=created_at.asc`, { headers: headers(), cache: "no-store" });
    if (!res.ok) return fallbackProducts;
    const data = normalizeProducts(await res.json());
    return data.length ? data : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

export async function getProductBySlug(slug: string) {
  if (!url || !key) return fallbackProducts.find((product) => product.slug === slug) || null;
  const select = "slug,model,name,category,summary,specs,applications,benefits,image_url,seo_title,seo_description,seo_keywords,updated_at";
  try {
    const res = await fetch(`${url}/rest/v1/products?select=${select}&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`, { headers: headers(), cache: "no-store" });
    if (!res.ok) return fallbackProducts.find((product) => product.slug === slug) || null;
    const data = normalizeProducts(await res.json());
    return data[0] || null;
  } catch {
    return fallbackProducts.find((product) => product.slug === slug) || null;
  }
}
