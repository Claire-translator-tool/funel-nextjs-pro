import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

type Product = {
  id: string;
  slug: string;
  model?: string | null;
  name: string;
  category?: string | null;
  summary?: string | null;
  specs?: string[] | null;
  applications?: string[] | null;
  benefits?: string[] | null;
  image_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  published?: boolean | null;
};

function headers() {
  const h: Record<string, string> = { apikey: key };
  if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) h.Authorization = `Bearer ${key}`;
  return h;
}

async function getProducts(): Promise<Product[]> {
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/products?select=*&order=created_at.asc`, { headers: headers(), cache: "no-store" });
  return res.ok ? res.json() : [];
}

function lines(items?: string[] | null) {
  return Array.isArray(items) ? items.join("\n") : "";
}

export default async function AdminProductsPage() {
  if (!(await cookies()).get("funel_admin_token")) redirect("/admin/login");
  const products = await getProducts();

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2>Funel Admin</h2>
        <a href="/admin">Dashboard</a>
        <a href="/admin/inquiries">Inquiries</a>
        <a href="/admin/products">Products</a>
        <a href="/admin/pages">Pages</a>
        <a href="/admin/settings">Settings</a>
        <form action="/api/admin/logout" method="post"><button className="btn ghost" style={{ width: "100%" }}>Logout</button></form>
      </aside>
      <main className="admin-main">
        <div className="admin-head">
          <div>
            <h1>Products</h1>
            <p className="muted">Edit product content, specification lists, SEO fields and publish status.</p>
          </div>
          <a className="btn ghost" href="/products">View product page</a>
        </div>
        <div className="editor-grid">
          {products.map((product) => (
            <form className="card pad product-editor" action="/api/admin/products/update" method="post" key={product.id}>
              <input type="hidden" name="id" value={product.id} />
              <div className="editor-title"><h2>{product.name}</h2><label><input type="checkbox" name="published" defaultChecked={product.published !== false} /> Published</label></div>
              <label>Name<input className="input" name="name" defaultValue={product.name} required /></label>
              <label>Slug<input className="input" name="slug" defaultValue={product.slug} required /></label>
              <div className="form-row">
                <label>Model<input className="input" name="model" defaultValue={product.model || ""} /></label>
                <label>Category<input className="input" name="category" defaultValue={product.category || ""} /></label>
              </div>
              <label>Summary<textarea name="summary" rows={3} defaultValue={product.summary || ""} /></label>
              <label>Image URL<input className="input" name="image_url" defaultValue={product.image_url || ""} /></label>
              <div className="form-row three-cols">
                <label>Specs<textarea name="specs" rows={5} defaultValue={lines(product.specs)} /></label>
                <label>Applications<textarea name="applications" rows={5} defaultValue={lines(product.applications)} /></label>
                <label>Benefits<textarea name="benefits" rows={5} defaultValue={lines(product.benefits)} /></label>
              </div>
              <label>SEO title<input className="input" name="seo_title" defaultValue={product.seo_title || ""} /></label>
              <label>SEO description<textarea name="seo_description" rows={3} defaultValue={product.seo_description || ""} /></label>
              <label>SEO keywords<textarea name="seo_keywords" rows={2} defaultValue={lines(product.seo_keywords)} /></label>
              <div className="actions"><button className="btn primary" type="submit">Save product</button><a className="btn ghost" href={`/products/${product.slug}`}>Preview</a></div>
            </form>
          ))}
        </div>
      </main>
    </div>
  );
}
