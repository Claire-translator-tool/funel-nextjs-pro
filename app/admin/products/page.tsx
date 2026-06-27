import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import ProductManager from "@/components/admin/ProductManager";
import { requireAdminPage } from "@/lib/admin-page";
import { listAdminProducts } from "@/lib/cms";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Products | Funel Sensor Admin",
};

export default async function AdminProductsPage() {
  const admin = await requireAdminPage();
  const products = await listAdminProducts();

  return (
    <AdminShell admin={admin}>
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">Catalog</span>
          <h1>Products 产品</h1>
          <p>编辑产品页面、买家价值点和产品关键词 SEO 字段。</p>
        </div>
        <Link href="/admin/products/import" className="btn primary">
          Bulk import products 批量导入产品
        </Link>
      </div>
      <ProductManager products={products} />
    </AdminShell>
  );
}
