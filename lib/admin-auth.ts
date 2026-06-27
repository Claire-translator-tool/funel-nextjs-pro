import { cookies } from "next/headers";
import { getSupabaseUser, hasSupabaseAdminConfig, supabaseRest } from "@/lib/supabase";

export async function getAdminSession() {
  const token = (await cookies()).get("funel_admin_token")?.value;
  if (!token) return null;

  // Fallback admin (password-based login without Supabase auth)
  if (token.startsWith("fallback-admin:")) {
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
      if (profiles[0]) {
        return {
          id: profiles[0].user_id,
          email: profiles[0].email || user.email,
          role: profiles[0].role || "admin",
        };
      }
    } catch {
      // admin_profiles table may not exist; fall through to user-based check
    }

    // Accept any authenticated Supabase user as admin
    if (user.email) {
      return { id: user.id, email: user.email, role: "admin" };
    }

    return null;
  } catch {
    return null;
  }
}
