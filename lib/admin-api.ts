import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAdminForApi() {
  const token = (await cookies()).get("funel_admin_token");
  if (!token) {
    return { ok: false, response: jsonError("Unauthorized", 401) };
  }
  return { ok: true };
}
