import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/admin-api";
import { adminErrorQuery, requireServerAdminKey } from "@/lib/admin-operation";
import { supabaseRest } from "@/lib/supabase";
import {
  isSupabaseStorageAuthorizationError,
  uploadPublicImage,
  uploadPublicImageBuffer,
} from "@/lib/supabase-storage";
import sharp from "sharp";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  } catch (error) {
    if (isSupabaseStorageAuthorizationError(error)) {
      throw error;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `products/${safeSegment(slug)}-${Date.now()}.${ext}`;
    return await uploadPublicImage({ file, path });
  }
}

function back(request: Request, suffix = "") {
  return NextResponse.redirect(new URL(`/admin/products${suffix}`, request.url), { status: 303 });
}

function refreshProductPages(slug: string) {
  revalidatePath("/");
  revalidatePath("/zh");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
}

export async function POST(request: Request) {
  const auth = await requireAdminForApi();
  if (!auth.ok) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const form = await request.formData();
  const slug = String(form.get("slug") || "").trim();
  const name = String(form.get("name") || "").trim();
  const token = auth.admin.token;

  if (!slug || !name) return back(request, "?error=missing_required");

  try {
    requireServerAdminKey("Product save");

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

    const existing = await supabaseRest<Array<{ id: string }>>(
      `products?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`,
      { token }
    );

    if (existing[0]?.id) {
      await supabaseRest(`products?id=eq.${encodeURIComponent(existing[0].id)}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: payload,
        token,
      });

      refreshProductPages(slug);
      return back(request, "?saved=1");
    }

    await supabaseRest("products", {
      method: "POST",
      prefer: "return=minimal",
      body: payload,
      token,
    });

    refreshProductPages(slug);
    return back(request, "?created=1");
  } catch (err) {
    console.error("Product create/upload failed", err);
    return back(request, `?error=${adminErrorQuery(err, "Product save")}`);
  }
}
