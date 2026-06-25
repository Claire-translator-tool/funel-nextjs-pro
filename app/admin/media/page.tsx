import AdminShell from "@/components/admin/AdminShell";
import MediaLibraryManager from "@/components/admin/MediaLibraryManager";
import { requireAdminPage } from "@/lib/admin-page";
import { listPublicImages } from "@/lib/supabase-storage";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Media Library | Funel Sensor Admin",
};

export default async function AdminMediaPage() {
  const admin = await requireAdminPage();
  const images = await listPublicImages().catch(() => []);

  return (
    <AdminShell admin={admin}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold text-green-950">Media Library</h1>
          <p className="mt-1 text-slate-600">
            Upload product images once and reuse the generated image URLs in product pages.
          </p>
        </div>
        <MediaLibraryManager images={images} />
      </div>
    </AdminShell>
  );
}
