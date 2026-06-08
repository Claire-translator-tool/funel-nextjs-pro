import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

function headers(extra: Record<string, string> = {}) {
  const h: Record<string, string> = { apikey: key, ...extra };
  if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) h.Authorization = `Bearer ${key}`;
  return h;
}

function back(request: Request, suffix = "") {
  return NextResponse.redirect(new URL(`/admin/settings${suffix}`, request.url), { status: 303 });
}

function cleanKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}

export async function POST(request: Request) {
  if (!(await cookies()).get("funel_admin_token")) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  if (!url || !key) return back(request, "?error=missing_config");

  const form = await request.formData();
  const keys = form.getAll("keys").map((item) => String(item)).filter(Boolean);
  const newKey = cleanKey(String(form.get("new_key") || ""));

  if (newKey) keys.push(newKey);

  const now = new Date().toISOString();
  const payload = Array.from(new Set(keys)).map((settingKey) => ({
    key: settingKey,
    value: String(form.get(`value:${settingKey}`) || (settingKey === newKey ? form.get("new_value") || "" : "")),
    updated_at: now,
  }));

  if (!payload.length) return back(request, "?error=missing_fields");

  const res = await fetch(`${url}/rest/v1/site_settings`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify(payload),
  });

  return res.ok ? back(request, "?saved=1") : back(request, "?error=save_failed");
}
