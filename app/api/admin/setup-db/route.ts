import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/admin-api";
import { funelAdminPolicySql } from "@/lib/admin-policy-sql";
import { supabaseApiHeaders, supabaseUrl, supabaseServiceRoleKey } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminForApi();
  if (!auth.ok) return auth.response;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      {
        error: "Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel.",
        schema_file: "supabase/schema.sql",
        policy_file: "supabase/funel-admin-policies.sql",
        policy_sql: funelAdminPolicySql,
      },
      { status: 500 }
    );
  }

  const results: Record<string, string> = {
    supabase_url: supabaseUrl,
    key_format: supabaseServiceRoleKey.startsWith("sb_") ? "new sb_ format" : "legacy JWT format",
  };

  const tables = ["products", "site_settings", "inquiries", "inquiry_notes", "pages", "case_studies"];
  for (const table of tables) {
    const r = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=1`, {
      headers: supabaseApiHeaders(supabaseServiceRoleKey),
    });
    const detail = await r.text().then((text) => text.slice(0, 180));
    results[`table_${table}`] = r.ok ? "OK" : `CHECK SQL (${r.status}: ${detail})`;
  }

  return NextResponse.json({
    ...results,
    schema_file: "supabase/schema.sql",
    policy_file: "supabase/funel-admin-policies.sql",
    policy_sql: funelAdminPolicySql,
    next_step:
      "If uploads or product writes return RLS/401/403, run supabase/funel-admin-policies.sql once in the Supabase SQL Editor.",
  });
}
