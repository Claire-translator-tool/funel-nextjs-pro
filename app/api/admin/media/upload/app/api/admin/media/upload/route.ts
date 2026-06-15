import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { uploadImage } from "../../../../../lib/admin-storage";

export async function POST(request: Request) {
  if (!(await cookies()).get("funel_admin_token")) {
    return NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });
  }

  const form = await request.formData();
  const file = form.get("image_file");
  const slug = String(form.get("slug") || "media");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(new URL("/admin/media?error=no_file", request.url), {
      status: 303,
    });
  }

  const imageUrl = await uploadImage(file, slug);

  return NextResponse.redirect(
    new URL(`/admin/media?uploaded=${encodeURIComponent(imageUrl)}`, request.url),
    { status: 303 }
  );
}

