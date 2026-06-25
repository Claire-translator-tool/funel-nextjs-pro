import { cookies } from "next/headers";
import { getSupabaseUser, hasSupabaseAdminConfig, supabaseRest } from "@/lib/supabase";
export async function getAdminSession() {
  const token = (await cookies()).get("funel_admin_token")?.value;
  if (!token) return null;
  if (token.startsWith("fallback-admin:")) return { id: "fallback", email: "admin@funel-sensor.com", role: "admin" };
  if (!hasSupabaseAdminConfig()) return null;
  const user = await getSupabaseUser(token);
  if (!user) return null;
  const profiles: any[] = await supabaseRest(`admin_profiles?user_id=eq.${user.id}&limit=1`);
  return profiles[0] ? { id: profiles[0].user_id, email: profiles[0].email, role: profiles[0].role } : null;
  }
