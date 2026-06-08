import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
function headers() { const h: Record<string,string> = { apikey: key }; if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) h.Authorization = `Bearer ${key}`; return h; }
function csvCell(value: unknown) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }

export async function GET() {
  if (!(await cookies()).get("funel_admin_token")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await fetch(`${url}/rest/v1/inquiries?select=*&order=created_at.desc&limit=1000`, { headers: headers(), cache: "no-store" });
  const rows = res.ok ? await res.json() : [];
  const header = ["created_at","status","name","email","company","country","phone","whatsapp","product_interest","quantity","message","source_page"];
  const csv = [header.join(","), ...rows.map((r: Record<string, unknown>)=>header.map((h)=>csvCell(r[h])).join(","))].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=funel-inquiries.csv" } });
}
