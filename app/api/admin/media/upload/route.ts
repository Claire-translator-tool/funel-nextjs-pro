import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { uploadImage } from "../../../../../lib/admin-storage";

export async function POST(request: Request) {
  if (!(await cookies()).get("funel_admin_token")) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(new URL("/admin/media?error=no_file", request.url), { status: 303 });
  }

  try {
    const imageUrl = await uploadImage(file, "upload");
    return NextResponse.redirect(new URL(`/admin/media?uploaded=1&url=${encodeURIComponent(imageUrl)}`, request.url), {
      status: 303,
    });
  } catch {
    return NextResponse.redirect(new URL("/admin/media?error=upload_failed", request.url), { status: 303 });
  }
}
