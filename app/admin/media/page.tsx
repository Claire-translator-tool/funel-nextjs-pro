import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listProductImages } from "../../../lib/admin-storage";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Funel Admin</h2>
      <a href="/admin">Dashboard</a>
      <a href="/admin/inquiries">Inquiries</a>
      <a href="/admin/products">Products</a>
      <a href="/admin/media">Media Library</a>
      <a href="/admin/pages">Pages</a>
      <a href="/admin/settings">Settings</a>
      <form action="/api/admin/logout" method="post">
        <button className="btn ghost" style={{ width: "100%" }}>
          Logout
        </button>
      </form>
    </aside>
  );
}

export default async function AdminMediaPage({ searchParams }: Props) {
  if (!(await cookies()).get("funel_admin_token")) redirect("/admin/login");

  const [params, images] = await Promise.all([searchParams, listProductImages()]);
  const uploadedUrl = typeof params.url === "string" ? params.url : "";

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <div className="admin-head">
          <div>
            <h1>Media Library</h1>
            <p className="muted">Upload product images once and reuse the image URL in product pages.</p>
          </div>
          <a className="btn ghost" href="/admin/products">Back to products</a>
        </div>

        {params.uploaded === "1" && <div className="notice">Image uploaded.</div>}
        {params.error && <div className="notice error">Upload failed. Please choose a JPG, PNG, WebP or GIF under 8 MB.</div>}

        <form className="card pad product-editor" action="/api/admin/media/upload" method="post" encType="multipart/form-data">
          <h2>Upload image</h2>
          <label>Image file<input className="input" type="file" name="file" accept="image/*" required /></label>
          <button className="btn primary" type="submit">Upload image</button>
          {uploadedUrl && (
            <label>Uploaded URL<input className="input" readOnly value={uploadedUrl} /></label>
          )}
        </form>

        <div className="editor-grid">
          {images.length === 0 && <div className="card pad">No images yet.</div>}
          {images.map((image) => (
            <div className="card pad" key={image.url}>
              <img
                src={image.url}
                alt={image.name}
                style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8, border: "1px solid #d9e5df" }}
              />
              <b>{image.name}</b>
              <input className="input" readOnly value={image.url} />
              <div className="actions" style={{ marginTop: 12 }}>
                 <a className="btn ghost" href={image.url} target="_blank" rel="noreferrer">Open image</a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
