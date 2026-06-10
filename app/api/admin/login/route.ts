import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "funel_admin_token";
const ADMIN_EMAIL = "claire23803@gmail.com";
const FALLBACK_PASSWORD_HASH =
  "a26eadadb988b99a4e7bdf9d42660cb232eec06aca51cfc1cb6a9ab8b5ce6815";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

function passwordHash(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function setAdminCookie(req: NextRequest, token: string, maxAge = 3600) {
  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");

  if (
    email === ADMIN_EMAIL &&
    passwordHash(password) === FALLBACK_PASSWORD_HASH
  ) {
    return setAdminCookie(req, `fallback-admin:${Date.now()}`, 60 * 60 * 8);
  }

  try {
    const auth = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!auth.ok) {
      throw new Error(await auth.text());
    }

    const session = await auth.json();
    return setAdminCookie(req, session.access_token, session.expires_in || 3600);
  } catch {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
  }
}
