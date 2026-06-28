import { cookies } from "next/headers";
import { getSupabaseUser, hasSupabaseAdminConfig, supabaseRest } from "@/lib/supabase";

const defaultAdminEmails = ["claire23803@gmail.com"];

function allowFallbackAdminSession() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.FUNEL_ENABLE_LOCAL_FALLBACK_LOGIN === "true"
  );
}

function adminEmailAllowlist() {
  const configured = process.env.FUNEL_ADMIN_EMAILS || process.env.ADMIN_EMAILS || "";
  const emails = configured
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return emails.length ? emails : defaultAdminEmails;
}

function isAllowedAdminEmail(email?: string | null) {
  return Boolean(email && adminEmailAllowlist().includes(email.toLowerCase()));
}

export async function getAdminSession() {
  const token = (await cookies()).get("funel_admin_token")?.value;
  if (!token) return null;

  // Local-only fallback for development. Production must use Supabase Auth.
  if (token.startsWith("fallback-admin:") && allowFallbackAdminSession()) {
    return { id: "fallback", email: "admin@funel-sensor.com", role: "admin" };
  }

  // Supabase JWT-based login
  if (!hasSupabaseAdminConfig()) return null;

  try {
    const user = await getSupabaseUser(token);
    if (!user?.id) return null;

    // Try admin_profiles table first
    try {
      const profiles: any[] = await supabaseRest(
        `admin_profiles?user_id=eq.${user.id}&limit=1`
      );
      if (profiles[0]?.role === "admin") {
        return {
          id: profiles[0].user_id,
          email: profiles[0].email || user.email,
          role: profiles[0].role || "admin",
        };
      }
    } catch {
      // admin_profiles table may not exist; fall through to user-based check
    }

    // If admin_profiles is not ready yet, only allow the configured owner email.
    if (isAllowedAdminEmail(user.email)) {
      return { id: user.id, email: user.email, role: "admin" };
    }

    return null;
  } catch {
    return null;
  }
}
