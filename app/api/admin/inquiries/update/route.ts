import { NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/admin-api";
import { supabaseApiHeaders, supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase";

const url = supabaseUrl;
const key = supabaseServiceRoleKey;
const allowedStatuses = new Set(["new", "in_progress", "won"]);

function headers(extra: Record<string, string> = {}) {
  return supabaseApiHeaders(key, extra);
}

function back(request: Request, suffix = "") {
  return NextResponse.redirect(new URL(`/admin/inquiries${suffix}`, request.url), { status: 303 });
}

export async function POST(request: Request) {
  const auth = await requireAdminForApi();

  if (!auth.ok) {
    return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  }

  const form = await request.formData();
  const id = String(form.get("id") || "");
  const statusValue = String(form.get("status") || "new");
  const status = allowedStatuses.has(statusValue) ? statusValue : "new";
  const note = String(form.get("note") || "").trim();

  if (!id || !url || !key) return back(request, "?error=missing_config");

  const updateRes = await fetch(`${url}/rest/v1/inquiries?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
  });

  if (!updateRes.ok) {
    console.error("Inquiry status update failed", await updateRes.text().catch(() => ""));
    return back(request, "?error=update_failed");
  }

  if (note) {
    const noteRes = await fetch(`${url}/rest/v1/inquiry_notes`, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify({ inquiry_id: id, note, created_by: "admin" }),
    });

    if (!noteRes.ok) {
      console.error("Inquiry note create failed", await noteRes.text().catch(() => ""));
    }
  }

  return back(request, "?saved=1");
}
