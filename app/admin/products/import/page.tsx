import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import ProductImportForm from "@/components/admin/ProductImportForm";
import { requireAdminPage } from "@/lib/admin-page";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Bulk Import Products | Funel Sensor Admin",
};

export default async function ProductImportPage() {
  const admin = await requireAdminPage();

  return (
    <AdminShell admin={admin}>
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">Batch upload</span>
          <h1>Bulk import products 批量导入产品</h1>
          <p>上传产品 ZIP 包，一次性创建或更新产品信息和图片。</p>
        </div>
        <Link href="/admin/products" className="btn ghost admin-back-btn">
          Back to products 返回产品页面
        </Link>
      </div>
      <ProductImportForm />
    </AdminShell>
  );
}
