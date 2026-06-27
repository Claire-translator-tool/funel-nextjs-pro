import AdminShell from "@/components/admin/AdminShell";
import AiToolsPanel from "@/components/admin/AiToolsPanel";
import { requireAdminPage } from "@/lib/admin-page";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "AI Tools | Funel Sensor Admin",
};

export default async function AiToolsPage() {
  const admin = await requireAdminPage();
  return (
    <AdminShell admin={admin}>
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">Automation</span>
          <h1>AI Tools AI 工具</h1>
          <p>
            Use AI to generate SEO content, product descriptions, blog outlines, and inquiry replies.
            自动生成 SEO 内容、产品描述、博客大纲和询盘回复。
          </p>
        </div>
      </div>
      <AiToolsPanel />
    </AdminShell>
  );
}
