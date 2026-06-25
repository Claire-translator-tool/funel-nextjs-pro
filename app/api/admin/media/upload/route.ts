import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdminForApi();

  if (!auth.ok) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const forward = new FormData();
  const file = formData.get("file");

  if (file instanceof File) {
    forward.append("file", file);
  }

  forward.append("folder", String(formData.get("folder") || "products"));
  forward.append("slug", String(formData.get("slug") || "media"));

  const response = await fetch(new URL("/api/admin/media", request.url), {
    method: "POST",
    body: forward,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });
  const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    return NextResponse.redirect(
      new URL(`/admin/media?error=${encodeURIComponent(data.error || "upload_failed")}`, request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(
    new URL(`/admin/media?uploaded=1&url=${encodeURIComponent(data.url)}`, request.url),
    { status: 303 }
  );
}
