import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import ProductManager from "@/components/admin/ProductManager";
import { requireAdminPage } from "@/lib/admin-page";
import { listAdminProducts } from "@/lib/cms";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Products | Funel Sensor Admin",
};

type AdminProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function statusMessage(params: Record<string, string | string[] | undefined>) {
  if (params.saved) return { type: "success", text: "Product saved. 产品已保存。" };
  if (params.created) return { type: "success", text: "Product created. 产品已创建。" };
  if (params.error === "missing_config") return { type: "error", text: "Supabase config is missing. Supabase 配置缺失。" };
  if (params.error === "missing_required") return { type: "error", text: "Slug and name are required. 必须填写 slug 和名称。" };
  if (params.error === "save_failed") return { type: "error", text: "Save failed. Please check Vercel runtime logs. 保存失败，请检查 Vercel 日志。" };
  if (params.error === "create_failed") return { type: "error", text: "Create failed. Please check slug uniqueness and Supabase permissions. 创建失败，请检查 slug 是否重复以及 Supabase 权限。" };
  if (params.error === "upload_failed") return { type: "error", text: "Image upload failed. 图片上传失败。" };
  if (typeof params.error === "string") return { type: "error", text: `Operation failed: ${params.error}. 操作失败：${params.error}` };
  return null;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const admin = await requireAdminPage();
  const products = await listAdminProducts();
  const params = (await searchParams) || {};
  const message = statusMessage(params);

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
      {message ? <div className={`admin-alert ${message.type}`}>{message.text}</div> : null}
      <ProductManager products={products} />
    </AdminShell>
  );
}
