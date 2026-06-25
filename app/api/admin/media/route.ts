import sharp from "sharp";
import { NextResponse } from "next/server";
import { jsonError, requireAdminForApi } from "@/lib/admin-api";
import { uploadPublicImage, uploadPublicImageBuffer } from "@/lib/supabase-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "media";
}

function safeExtension(file: File) {
  const fromType = file.type.split("/")[1];
  const fromName = file.name.split(".").pop();
  const extension = (fromType || fromName || "jpg").toLowerCase();

  if (extension === "jpeg") {
    return "jpg";
  }

  return extension.replace(/[^a-z0-9]/g, "") || "jpg";
}

async function compressToWebp(file: File) {
  const input = Buffer.from(await file.arrayBuffer());

  return sharp(input)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

export async function POST(request: Request) {
  const auth = await requireAdminForApi();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("Please choose an image file.");
    }

    if (!file.type.startsWith("image/")) {
      return jsonError("Only image files can be uploaded.");
    }

    if (file.size > 20 * 1024 * 1024) {
      return jsonError("Image is too large. Please upload an image under 20 MB.");
    }

    const folder = safeSegment(String(formData.get("folder") || "products"));
    const slug = safeSegment(String(formData.get("slug") || "media"));
    const timestamp = Date.now();

    try {
      const webp = await compressToWebp(file);
      const path = `${folder}/${slug}-${timestamp}.webp`;
      const url = await uploadPublicImageBuffer({
        buffer: webp,
        path,
        contentType: "image/webp",
      });

      return NextResponse.json({ ok: true, url, path });
    } catch (compressionError) {
      if (file.size > 8 * 1024 * 1024) {
        throw compressionError;
      }

      const extension = safeExtension(file);
      const path = `${folder}/${slug}-${timestamp}.${extension}`;
      const url = await uploadPublicImage({ file, path });
      return NextResponse.json({ ok: true, url, path });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Image upload failed.",
      },
      { status: 500 }
    );
  }
}
