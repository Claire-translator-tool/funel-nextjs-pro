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
  let images: Awaited<ReturnType<typeof listPublicImages>> = [];
  let error = "";

  try {
    images = await listPublicImages();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load media library.";
  }

  return (
    <AdminShell admin={admin}>
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">Assets</span>
          <h1>Media Library 图片库</h1>
          <p>上传产品图片后，可复制生成的图片 URL 到产品页面中复用。</p>
        </div>
      </div>
      <MediaLibraryManager images={images} initialError={error} />
    </AdminShell>
  );
}
