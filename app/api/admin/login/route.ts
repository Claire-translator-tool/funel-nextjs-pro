import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "funel_admin_token";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  try {
    const auth = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), cache: "no-store" });
    if (!auth.ok) throw new Error(await auth.text());
    const session = await auth.json();
    const res = NextResponse.redirect(new URL("/admin", req.url));
    res.cookies.set(ADMIN_COOKIE, session.access_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: session.expires_in || 3600 });
    return res;
  } catch {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
  }
}
