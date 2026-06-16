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
  const slug = String(form.get("slug") || "").trim();
  const name = String(form.get("name") || "").trim();

  if (!url || !key) return back(request, "?error=missing_config");
  if (!slug || !name) return back(request, "?error=missing_required");

  try {
    const imageFile = form.get("image_file");
    let imageUrl = String(form.get("image_url") || "").trim() || null;

    if (imageFile instanceof File && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile, slug);
    }

    const payload = {
      name,
      slug,
      model: String(form.get("model") || "").trim() || null,
      category: String(form.get("category") || "").trim() || null,
      summary: String(form.get("summary") || "").trim() || null,
      image_url: imageUrl || "/images/project-case.png",
      specs: lines(form.get("specs")),
      published: true,
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(`${url}/rest/v1/products`, {
      method: "POST",
      headers: supabaseHeaders({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify(payload),
    });

    return response.ok ? back(request, "?created=1") : back(request, "?error=create_failed");
  } catch {
    return back(request, "?error=upload_failed");
  }
}
