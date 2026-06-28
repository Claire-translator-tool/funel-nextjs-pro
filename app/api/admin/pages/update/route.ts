import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseApiHeaders } from "@/lib/supabase";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

function headers(extra: Record<string, string> = {}) {
  return supabaseApiHeaders(key, extra);
}

function back(request: Request, suffix = "") {
  return NextResponse.redirect(new URL(`/admin/pages${suffix}`, request.url), { status: 303 });
}

export async function POST(request: Request) {
  if (!(await cookies()).get("funel_admin_token")) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const form = await request.formData();
  const id = String(form.get("id") || "");
  const slug = String(form.get("slug") || "").trim();
  const title = String(form.get("title") || "").trim();

  if (!id || !slug || !title || !url || !key) return back(request, "?error=missing_fields");

  let blocks: unknown = {};
  try {
    blocks = JSON.parse(String(form.get("blocks") || "{}"));
  } catch {
    return back(request, "?error=invalid_json");
  }

  const payload = {
    slug,
    title,
    blocks,
    seo_title: String(form.get("seo_title") || "").trim() || null,
    seo_description: String(form.get("seo_description") || "").trim() || null,
    published: form.get("published") === "on",
    updated_at: new Date().toISOString(),
  };

  const res = await fetch(`${url}/rest/v1/pages?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("Page update failed", await res.text().catch(() => ""));
    return back(request, "?error=save_failed");
  }

  return back(request, "?saved=1");
}
