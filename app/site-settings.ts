import {
  cleanSupabaseUrl,
  supabaseApiHeaders,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "@/lib/supabase";

export type SiteSettings = {
  site_name: string;
  site_domain: string;
  company_tagline: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_wechat: string;
};

export const defaultSiteSettings: SiteSettings = {
  site_name: "Funel Sensor",
  site_domain: "https://www.funelsensor.com",
  company_tagline:
    "Online water quality analyzers, sensors, and controllers for industrial monitoring projects.",
  contact_email: "claire23803@gmail.com",
  contact_phone: "+8615606523212",
  contact_whatsapp: "+8615606523212",
  contact_wechat: "Claire-chujiu",
};

const key = supabaseServiceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

type SettingRow = { key: string; value: string | null };

function headers() {
  return supabaseApiHeaders(key);
}

export function whatsappLink(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!supabaseUrl || !key) return defaultSiteSettings;

  try {
    const res = await fetch(`${cleanSupabaseUrl()}/rest/v1/site_settings?select=key,value`, {
      headers: headers(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return defaultSiteSettings;

    const rows = (await res.json()) as SettingRow[];
    const values = Object.fromEntries(rows.map((row) => [row.key, row.value || ""]));

    return {
      ...defaultSiteSettings,
      ...values,
    } as SiteSettings;
  } catch {
    return defaultSiteSettings;
  }
}
