import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
export async function requireAdminForApi() {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { ok: true, admin };
}
export function jsonError(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }
export function asLines(value: unknown) { if (Array.isArray(value)) return value.map(String).filter(Boolean); if (typeof value !== "string") return []; return value.split(/\r?\n/).map(s => s.trim()).filter(Boolean); }
