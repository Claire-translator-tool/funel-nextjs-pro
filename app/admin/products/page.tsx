import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  model?: string | null;
  category?: string | null;
  summary?: string | null;
  image_url?: string | null;
  specs?: string[] | null;
  applications?: string[] | null;
  benefits?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  published?: boolean | null;
};

function headers() {
  const h: Record<string, string> = { apikey: key };
  if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) {
    h.Authorization = `Bearer ${key}`;
  }
  return h;
}

async function getProducts(): Promise<ProductRow[]> {
  if (!url || !key) return [];

  const res = await fetch(`${url}/rest/v1/products?select=*&order=created_at.desc`, {
    headers: headers(),
    cache: "no-store",
  });

  return res.ok ? res.json() : [];
}

function listText(value?: string[] | string | null) {
  if (Array.isArray(value)) return value.join("\n");
  return value || "";
}

function notice(params: Record<string, string | string[] | undefined>) {
  if (params.created === "1") return <div className="notice">Product created.</div>;
  if (params.saved === "1") return <div className="notice">Product saved.</div>;
  if (params.error === "missing_required") return <div className="notice error">Name and slug are required.</div>;
  if (params.error === "upload_failed") return <div className="notice error">Image upload failed. Please try another image.</div>;
  if (params.error) return <div className="notice error">Save failed. Please check the product fields.</div>;
  return null;
}

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

export default async function AdminProductsPage({ searchParams }: Props) {
  if (!(await cookies()).get("funel_admin_token")) redirect("/admin/login");

  const [params, products] = await Promise.all([searchParams, getProducts()]);

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <div className="admin-head">
          <div>
            <h1>Products</h1>
            <p className="muted">Create products, upload images, edit specifications and SEO fields.</p>
          </div>
          <div className="actions">
            <a className="btn ghost" href="/admin/media">Media Library</a>
            <a className="btn ghost" href="/products">View product page</a>
          </div>
        </div>

        {notice(params)}

        <form className="card pad product-editor" action="/api/admin/products/create" method="post" encType="multipart/form-data">
          <div className="editor-title">
            <h2>Add new product</h2>
            <span className="badge">New</span>
          </div>
          <div className="form-row">
            <label>Name<input className="input" name="name" required placeholder="Online Dissolved Oxygen Analyzer" /></label>
            <label>Slug<input className="input" name="slug" required placeholder="online-dissolved-oxygen-analyzer" /></label>
          </div>
          <div className="form-row">
            <label>Model<input className="input" name="model" placeholder="PFDO-800" /></label>
            <label>Category<input className="input" name="category" placeholder="Dissolved Oxygen" /></label>
          </div>
          <label>Summary<textarea name="summary" rows={3} placeholder="Short product introduction for product cards and SEO." /></label>
          <div className="form-row">
            <label>Upload image<input className="input" type="file" name="image_file" accept="image/*" /></label>
            <label>Image URL<input className="input" name="image_url" placeholder="/images/project-case.png or https://..." /></label>
          </div>
          <label>Specifications<textarea name="specs" rows={5} placeholder="One specification per line" /></label>
          <button className="btn primary" type="submit">Create product</button>
        </form>

        <div className="editor-grid">
          {products.length === 0 && <div className="card pad">No products yet.</div>}
          {products.map((product) => (
            <form
              className="card pad product-editor"
              action="/api/admin/products/update"
              method="post"
              encType="multipart/form-data"
              key={product.id}
            >
              <input type="hidden" name="id" value={product.id} />
              <div className="editor-title">
                <h2>{product.name}</h2>
                <label><input type="checkbox" name="published" defaultChecked={product.published !== false} /> Published</label>
              </div>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8, border: "1px solid #d9e5df" }}
                />
              )}
              <div className="form-row">
                <label>Name<input className="input" name="name" defaultValue={product.name} required /></label>
                <label>Slug<input className="input" name="slug" defaultValue={product.slug} required /></label>
              </div>
              <div className="form-row">
                <label>Model<input className="input" name="model" defaultValue={product.model || ""} /></label>
                <label>Category<input className="input" name="category" defaultValue={product.category || ""} /></label>
              </div>
              <label>Summary<textarea name="summary" rows={3} defaultValue={product.summary || ""} /></label>
              <div className="form-row">
                <label>Replace image<input className="input" type="file" name="image_file" accept="image/*" /></label>
                <label>Image URL<input className="input" name="image_url" defaultValue={product.image_url || ""} /></label>
              </div>
              <label>Specifications<textarea name="specs" rows={5} defaultValue={listText(product.specs)} /></label>
              <label>Applications<textarea name="applications" rows={4} defaultValue={listText(product.applications)} /></label>
              <label>Benefits<textarea name="benefits" rows={4} defaultValue={listText(product.benefits)} /></label>
              <label>SEO title<input className="input" name="seo_title" defaultValue={product.seo_title || ""} /></label>
              <label>SEO description<textarea name="seo_description" rows={3} defaultValue={product.seo_description || ""} /></label>
              <label>SEO keywords<textarea name="seo_keywords" rows={3} defaultValue={listText(product.seo_keywords)} /></label>
              <div className="actions">
                <button className="btn primary" type="submit">Save product</button>
                <a className="btn ghost" href={`/products/${product.slug}`}>Preview</a>
              </div>
            </form>
          ))}
        </div>
      </main>
    </div>
  );
}
