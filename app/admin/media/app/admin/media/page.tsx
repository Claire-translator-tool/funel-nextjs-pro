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

  const params = await searchParams;
  const uploaded =
    typeof params.uploaded === "string" ? decodeURIComponent(params.uploaded) : "";
  const images = await listProductImages();

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <div className="admin-head">
          <div>
            <h1>Media Library</h1>
            <p className="muted">
              Upload product images and copy public URLs for product pages.
            </p>
          </div>
          <a className="btn ghost" href="/admin/products">
            Back to products
          </a>
        </div>

        <form
          className="card pad product-editor"
          action="/api/admin/media/upload"
          method="post"
          encType="multipart/form-data"
        >
          <h2>Upload image</h2>
          <label>
            File
            <input className="input" type="file" name="image_file" accept="image/*" required />
          </label>
          <label>
            Name hint
            <input className="input" name="slug" placeholder="ph-orp-analyzer" />
          </label>
          <button className="btn primary" type="submit">
            Upload image
          </button>
        </form>

        {uploaded ? (
          <div className="card pad">
            <h2>Uploaded</h2>
            <img
              style={{
                display: "block",
                width: "min(260px, 100%)",
                maxHeight: 180,
                objectFit: "contain",
                border: "1px solid #dbe7e1",
                borderRadius: 10,
                background: "#fff",
                padding: 8,
              }}
              src={uploaded}
              alt="Uploaded product"
            />
            <input className="input" readOnly value={uploaded} />
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
            marginTop: 18,
          }}
        >
          {images.map((image) => (
            <div className="card pad" key={image.url}>
              <img
                style={{
                  display: "block",
                  width: "min(260px, 100%)",
                  maxHeight: 180,
                  objectFit: "contain",
                  border: "1px solid #dbe7e1",
                  borderRadius: 10,
                  background: "#fff",
                  padding: 8,
                }}
                src={image.url}
                alt={image.name}
              />
              <input className="input" readOnly value={image.url} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
