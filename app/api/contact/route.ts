import { NextRequest, NextResponse } from "next/server";
import { supabaseApiHeaders } from "@/lib/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

function text(value: unknown) {
  return String(value || "").trim();
}

function headers() {
  return supabaseApiHeaders(supabaseKey, { "Content-Type": "application/json", Prefer: "return=representation" });
}

async function notify(inquiry: Record<string, string>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const to = process.env.CONTACT_TO_EMAIL || "claire23803@gmail.com";
  const from = process.env.CONTACT_FROM_EMAIL || "Funel Sensor <onboarding@resend.dev>";
  const body = Object.entries(inquiry).map(([k, v]) => `${k}: ${v}`).join("\n");
  await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to, subject: `New Funel inquiry - ${inquiry.product_interest || inquiry.name}`, text: body }) }).catch(() => null);
}

export async function POST(req: NextRequest) {
  const type = req.headers.get("content-type") || "";
  const isForm = type.includes("form");
  const raw = isForm ? Object.fromEntries((await req.formData()).entries()) : await req.json();
  const inquiry = { name: text(raw.name), email: text(raw.email), company: text(raw.company), country: text(raw.country), phone: text(raw.phone), whatsapp: text(raw.whatsapp), product_interest: text(raw.product_interest), quantity: text(raw.quantity), message: text(raw.message), source_page: text(raw.source_page || req.headers.get("referer") || "/contact"), status: "new" };
  if (!inquiry.name || !inquiry.email || !inquiry.message) return isForm ? NextResponse.redirect(new URL("/contact?error=missing", req.url)) : NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
  try {
    if (!supabaseUrl || !supabaseKey) throw new Error("Supabase env missing");
    const res = await fetch(`${supabaseUrl}/rest/v1/inquiries`, { method: "POST", headers: headers(), body: JSON.stringify(inquiry), cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    await notify(inquiry);
    return isForm ? NextResponse.redirect(new URL("/contact?sent=1", req.url)) : NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact inquiry submit failed", error);
    return isForm ? NextResponse.redirect(new URL("/contact?error=server", req.url)) : NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
