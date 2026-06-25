import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
export async function requireAdminPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return admin;
}
