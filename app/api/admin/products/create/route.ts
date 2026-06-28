import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/admin-api";
import { uploadPublicImage, uploadPublicImageBuffer } from "@/lib/supabase-storage";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

function headers(extra: Record<string, string> = {}) {
  const h: Record<string, string> = { apikey: key, ...extra };
  if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) {
    h.Authorization = `Bearer ${key}`;
  }
  return h;
}

function lines(value: FormDataEntryValue | null): string[] {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function safeSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}

async function processImage(file: File, slug: string): Promise<string> {
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const webp = await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const path = `products/${safeSegment(slug)}-${Date.now()}.webp`;
    return await uploadPublicImageBuffer({ buffer: webp, path, contentType: "image/webp" });
  } catch {
    // Fallback: upload original
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `products/${safeSegment(slug)}-${Date.now()}.${ext}`;
    return await uploadPublicImage({ file, path });
  }
}

function back(request: Request, suffix = "") {
  return NextResponse.redirect(new URL(`/admin/products${suffix}`, request.url), { status: 303 });
}

export async function POST(request: Request) {
  const auth = await requireAdminForApi();
  if (!auth.ok) {
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
      imageUrl = await processImage(imageFile, slug);
    }

    const payload = {
      name,
      slug,
      model: String(form.get("model") || "").trim() || null,
      category: String(form.get("category") || "").trim() || null,
      summary: String(form.get("summary") || "").trim() || null,
      image_url: imageUrl || "/images/industrial-water-quality-analyzers.png",
      specs: lines(form.get("specs")),
      applications: lines(form.get("applications")),
      benefits: lines(form.get("benefits")),
      seo_title: String(form.get("seo_title") || "").trim() || null,
      seo_description: String(form.get("seo_description") || "").trim() || null,
      seo_keywords: lines(form.get("seo_keywords")),
      published: form.get("published") === "on",
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(`${url}/rest/v1/products`, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Product create failed", detail);
      return back(request, `?error=${encodeURIComponent(detail || "create_failed")}`);
    }

    return back(request, "?created=1");
  } catch (err) {
    console.error("Product create/upload failed", err);
    const msg = err instanceof Error ? err.message : "upload_failed";
    return back(request, `?error=${encodeURIComponent(msg)}`);
  }
}
