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
  return NextResponse.redirect(new URL(`/admin/products${suffix}`, request.url), { status: 303 });
}

function list(value: FormDataEntryValue | null) {
  return String(value || "").split(/\n|,/).map((item) => item.trim()).filter(Boolean);
}

export async function POST(request: Request) {
  if (!(await cookies()).get("funel_admin_token")) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const form = await request.formData();
  const id = String(form.get("id") || "");
  if (!id || !url || !key) return back(request, "?error=missing_config");

  const payload = {
    name: String(form.get("name") || "").trim(),
    slug: String(form.get("slug") || "").trim(),
    model: String(form.get("model") || "").trim() || null,
    category: String(form.get("category") || "").trim() || null,
    summary: String(form.get("summary") || "").trim() || null,
    image_url: String(form.get("image_url") || "").trim() || null,
    specs: list(form.get("specs")),
    applications: list(form.get("applications")),
    benefits: list(form.get("benefits")),
    seo_title: String(form.get("seo_title") || "").trim() || null,
    seo_description: String(form.get("seo_description") || "").trim() || null,
    seo_keywords: list(form.get("seo_keywords")),
    published: form.get("published") === "on",
    updated_at: new Date().toISOString(),
  };

  const res = await fetch(`${url}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify(payload),
  });

  return res.ok ? back(request, "?saved=1") : back(request, "?error=save_failed");
}
