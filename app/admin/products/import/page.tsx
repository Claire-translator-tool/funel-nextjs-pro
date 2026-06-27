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
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold text-green-950">Bulk import products</h1>
          <p className="mt-1 text-slate-600">
            Upload a product ZIP package to create or update product records and images.
          </p>
        </div>
        <ProductImportForm />
      </div>
    </AdminShell>
  );
}
