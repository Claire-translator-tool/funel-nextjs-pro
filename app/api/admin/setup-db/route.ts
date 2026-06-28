import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseServiceRoleKey } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  if (!cookieStore.get("funel_admin_token")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: "Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel." }, { status: 500 });
  }

  const results: Record<string, string> = {
    supabase_url: supabaseUrl,
    key_format: supabaseServiceRoleKey.startsWith("sb_") ? "new sb_ format" : "legacy JWT format",
  };

  const tables = ["products", "site_settings", "inquiries", "media"];
  for (const table of tables) {
    const r = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=1`, {
      headers: {
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
      },
    });
    results[`table_${table}`] = r.ok ? "OK" : `MISSING (${r.status}: ${await r.text().then(t => t.slice(0, 100))})`;
  }

  return NextResponse.json(results);
}
