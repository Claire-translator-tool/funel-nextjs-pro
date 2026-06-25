import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireAdminForApi } from "@/lib/admin-api";
import { importProductsFromZip } from "@/lib/funelImport/importProductsFromZip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").slice(0, 120);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi();

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const publishMode = String(formData.get("publishMode") || "draft") === "published" ? "published" : "draft";

    if (!(file instanceof File)) {
      return jsonError("Please upload a ZIP product package.");
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      return jsonError("Only .zip product packages are supported.");
    }

    const maxBytes = 80 * 1024 * 1024;

    if (file.size > maxBytes) {
      return jsonError("ZIP file is too large. Please keep it under 80 MB.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "tmp", "funel-import-uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const zipPath = path.join(uploadDir, `${Date.now()}-${safeFileName(file.name)}`);
    await fs.writeFile(zipPath, buffer);

    try {
      const summary = await importProductsFromZip({ zipPath, publishMode });
      return NextResponse.json({ ok: true, summary });
    } finally {
      await fs.rm(zipPath, { force: true });
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown import error.",
      },
      { status: 500 }
    );
  }
        }
