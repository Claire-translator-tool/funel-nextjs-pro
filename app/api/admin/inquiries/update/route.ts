import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const allowedStatuses = new Set(["new", "in_progress", "won"]);

function headers(extra: Record<string, string> = {}) {
  const h: Record<string, string> = { apikey: key, ...extra };
  if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) {
    h.Authorization = `Bearer ${key}`;
  }
  return h;
}

function back(request: Request, suffix = "") {
  return NextResponse.redirect(new URL(`/admin/inquiries${suffix}`, request.url), { status: 303 });
}

export async function POST(request: Request) {
  if (!(await cookies()).get("funel_admin_token")) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const form = await request.formData();
  const id = String(form.get("id") || "");
  const statusValue = String(form.get("status") || "new");
  const status = allowedStatuses.has(statusValue) ? statusValue : "new";
  const note = String(form.get("note") || "").trim();

  if (!id || !url || !key) return back(request, "?error=missing_config");

  const updateRes = await fetch(`${url}/rest/v1/inquiries?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
  });

  if (!updateRes.ok) return back(request, "?error=update_failed");

  if (note) {
    await fetch(`${url}/rest/v1/inquiry_notes`, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify({ inquiry_id: id, note, created_by: "admin" }),
    });
  }

  return back(request, "?saved=1");
}
