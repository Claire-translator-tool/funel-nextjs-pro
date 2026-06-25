import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminUser } from "@/lib/types";

export async function requireAdminPage(): Promise<AdminUser> {
  const token = (await cookies()).get("funel_admin_token");
  if (!token) {
    redirect("/admin/login");
  }
  // Simplified for this demo
  return { email: "admin@funel-sensor.com" };
}
