import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { lines, supabaseHeaders, uploadImage } from "../../../../../lib/admin-storage";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

function back(request: Request, suffix = "") {
  return NextResponse.redirect(new URL(`/admin/products${suffix}`, request.url), { status: 303 });
}

export async function POST(request: Request) {
  if (!(await cookies()).get("funel_admin_token")) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const form = await request.formData();
  const id = String(form.get("id") || "");
  if (!id || !url || !key) return back(request, "?error=missing_config");

  try {
    const imageFile = form.get("image_file");
    let imageUrl = String(form.get("image_url") || "").trim() || null;

    if (imageFile instanceof File && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile, String(form.get("slug") || "product"));
    }

    const payload = {
      name: String(form.get("name") || "").trim(),
      slug: String(form.get("slug") || "").trim(),
      model: String(form.get("model") || "").trim() || null,
      category: String(form.get("category") || "").trim() || null,
      summary: String(form.get("summary") || "").trim() || null,
      image_url: imageUrl,
      specs: lines(form.get("specs")),
      applications: lines(form.get("applications")),
      benefits: lines(form.get("benefits")),
      seo_title: String(form.get("seo_title") || "").trim() || null,
      seo_description: String(form.get("seo_description") || "").trim() || null,
      seo_keywords: lines(form.get("seo_keywords")),
      published: form.get("published") === "on",
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(`${url}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: supabaseHeaders({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify(payload),
    });

    return res.ok ? back(request, "?saved=1") : back(request, "?error=save_failed");
  } catch {
    return back(request, "?error=upload_failed");
  }
}
