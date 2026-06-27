import Link from "next/link";
import type { ReactNode } from "react";
import LogoutButton from "@/components/admin/LogoutButton";
import type { AdminUser } from "@/lib/types";

type AdminShellProps = {
  admin: AdminUser;
  children: ReactNode;
};

const navItems = [
  { href: "/admin", label: "Dashboard", helper: "仪表板" },
  { href: "/admin/inquiries", label: "Inquiries", helper: "咨询/询问" },
  { href: "/admin/products", label: "Products", helper: "产品" },
  { href: "/admin/media", label: "Media Library", helper: "媒体库" },
  { href: "/admin/pages", label: "Pages", helper: "页面数" },
  { href: "/admin/settings", label: "Settings", helper: "设置" },
];

export default function AdminShell({ admin, children }: AdminShellProps) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link href="/admin">Funel Admin</Link>
          <small>{admin.email}</small>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span>{item.label}</span>
              <small>{item.helper}</small>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-actions">
          <Link href="/" className="btn ghost">
            View site 查看网站
          </Link>
          <LogoutButton />
        </div>
      </aside>
      <main className="admin-workspace">{children}</main>
    </div>
  );
}
