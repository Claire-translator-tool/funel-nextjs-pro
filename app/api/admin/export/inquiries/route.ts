import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/admin-api";
import {
  cleanSupabaseUrl,
  supabaseApiHeaders,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "@/lib/supabase";

const key = supabaseServiceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
function headers() { return supabaseApiHeaders(key); }
function csvCell(value: unknown) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }

export async function GET() {
  const auth = await requireAdminForApi();
  if (!auth.ok) return auth.response;

  const res = supabaseUrl && key
    ? await fetch(`${cleanSupabaseUrl()}/rest/v1/inquiries?select=*&order=created_at.desc&limit=1000`, { headers: headers(), cache: "no-store" })
    : null;
  const rows = res?.ok ? await res.json() : [];
  if (res && !res.ok) console.error("Inquiry export failed", await res.text().catch(() => ""));
  const header = ["created_at","status","name","email","company","country","phone","whatsapp","product_interest","quantity","message","source_page"];
  const csv = [header.join(","), ...rows.map((r: Record<string, unknown>)=>header.map((h)=>csvCell(r[h])).join(","))].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=funel-inquiries.csv" } });
}
