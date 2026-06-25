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
      <div className="grid gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-950">Products</h1>
            <p className="mt-1 text-slate-600">
              Edit product pages, buyer value, and product keyword SEO fields.
            </p>
          </div>
          <Link
            href="/admin/products/import"
            className="rounded-lg bg-green-700 px-5 py-2 text-sm font-bold text-white hover:bg-green-800"
          >
            Bulk import products
          </Link>
        </div>
        <ProductManager products={products} />
      </div>
    </AdminShell>
  );
}
