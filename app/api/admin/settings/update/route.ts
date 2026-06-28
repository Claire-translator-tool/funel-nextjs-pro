import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseApiHeaders, supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase";

const url = supabaseUrl;
const key = supabaseServiceRoleKey;

function headers(extra: Record<string, string> = {}) {
  return supabaseApiHeaders(key, extra);
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

  if (!res.ok) {
    console.error("Settings update failed", await res.text().catch(() => ""));
    return back(request, "?error=save_failed");
  }

  return back(request, "?saved=1");
}
