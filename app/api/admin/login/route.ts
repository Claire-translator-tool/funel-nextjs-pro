import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { cleanSupabaseUrl, supabaseAnonKey, supabaseUrl } from "@/lib/supabase";

const ADMIN_COOKIE = "funel_admin_token";
const ADMIN_EMAIL = "claire23803@gmail.com";
const FALLBACK_PASSWORD_HASH =
  "a26eadadb988b99a4e7bdf9d42660cb232eec06aca51cfc1cb6a9ab8b5ce6815";

const key =
  supabaseAnonKey ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

function passwordHash(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function allowFallbackLogin() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.FUNEL_ENABLE_LOCAL_FALLBACK_LOGIN === "true"
  );
}

async function readCredentials(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };

    return {
      email: String(body.email || "").trim().toLowerCase(),
      password: String(body.password || ""),
      wantsJson: true,
    };
  }

  const form = await req.formData();

  return {
    email: String(form.get("email") || "").trim().toLowerCase(),
    password: String(form.get("password") || ""),
    wantsJson: false,
  };
}

function responseWithCookie(req: NextRequest, token: string, maxAge = 3600, wantsJson = false) {
  const res = wantsJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/admin", req.url));
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
  const { email, password, wantsJson } = await readCredentials(req);

  if (
    allowFallbackLogin() &&
    email === ADMIN_EMAIL &&
    passwordHash(password) === FALLBACK_PASSWORD_HASH
  ) {
    return responseWithCookie(req, `fallback-admin:${Date.now()}`, 60 * 60 * 8, wantsJson);
  }

  try {
    if (!supabaseUrl || !key) {
      throw new Error("Supabase auth is not configured.");
    }

    const auth = await fetch(`${cleanSupabaseUrl()}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!auth.ok) {
      throw new Error(await auth.text());
    }

    const session = await auth.json();
    return responseWithCookie(req, session.access_token, session.expires_in || 3600, wantsJson);
  } catch {
    if (wantsJson) {
      return NextResponse.json({ error: "Login failed." }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
  }
}
