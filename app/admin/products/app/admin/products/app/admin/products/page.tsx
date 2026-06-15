import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

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
  if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) {
    h.Authorization = `Bearer ${key}`;
  }
  return h;
}

async function getProducts(): Promise<Product[]> {
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/products?select=*&order=created_at.asc`, {
    headers: headers(),
    cache: "no-store",
  });
  return res.ok ? res.json() : [];
}

function lines(items?: string[] | null) {
  return Array.isArray(items) ? items.join("\n") : "";
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

function ProductFields({ product }: { product?: Product }) {
  return (
    <>
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="editor-title">
        <h2>{product ? product.name : "Add new product"}</h2>
        <label>
          <input
            type="checkbox"
            name="published"
            defaultChecked={product?.published !== false}
          />{" "}
          Published
        </label>
      </div>
      <label>
        Name
        <input
          className="input"
          name="name"
          defaultValue={product?.name || ""}
          required
        />
      </label>
      <label>
        Slug
        <input
          className="input"
          name="slug"
          defaultValue={product?.slug || ""}
          placeholder="online-ph-orp-analyzer"
          required
        />
      </label>
      <div className="form-row">
        <label>
          Model
          <input className="input" name="model" defaultValue={product?.model || ""} />
        </label>
        <label>
          Category
          <input
            className="input"
            name="category"
            defaultValue={product?.category || ""}
          />
        </label>
      </div>
      <label>
        Summary
        <textarea name="summary" rows={3} defaultValue={product?.summary || ""} />
      </label>
      <label>
        Image URL
        <input
          className="input"
          name="image_url"
          defaultValue={product?.image_url || ""}
          placeholder="Upload an image below or paste an image URL"
        />
      </label>
      <label
        style={{
          display: "grid",
          gap: 8,
          border: "1px dashed #c9dcd3",
          borderRadius: 10,
          background: "#f4fbf7",
          padding: 14,
        }}
      >
        Upload image
        <input type="file" name="image_file" accept="image/*" />
        <small style={{ color: "#667085", lineHeight: 1.5 }}>
          Choose JPG, PNG, WebP or GIF. When you save, the image will upload to
          the online media library and update Image URL automatically.
        </small>
      </label>
      {product?.image_url ? (
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
          src={product.image_url}
          alt={product.name}
        />
      ) : null}
      <div className="form-row three-cols">
        <label>
          Specs
          <textarea name="specs" rows={5} defaultValue={lines(product?.specs)} />
        </label>
        <label>
          Applications
          <textarea
            name="applications"
            rows={5}
            defaultValue={lines(product?.applications)}
          />
        </label>
        <label>
          Benefits
          <textarea
            name="benefits"
            rows={5}
            defaultValue={lines(product?.benefits)}
          />
        </label>
      </div>
      <label>
        SEO title
        <input
          className="input"
          name="seo_title"
          defaultValue={product?.seo_title || ""}
        />
      </label>
      <label>
        SEO description
        <textarea
          name="seo_description"
          rows={3}
          defaultValue={product?.seo_description || ""}
        />
      </label>
      <label>
        SEO keywords
        <textarea
          name="seo_keywords"
          rows={2}
          defaultValue={lines(product?.seo_keywords)}
        />
      </label>
    </>
  );
}

export default async function AdminProductsPage() {
  if (!(await cookies()).get("funel_admin_token")) redirect("/admin/login");
  const products = await getProducts();

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <div className="admin-head">
          <div>
            <h1>Products</h1>
            <p className="muted">
              Add products, upload images, edit specification lists, SEO fields
              and publish status.
            </p>
          </div>
          <a className="btn ghost" href="/products">
            View product page
          </a>
        </div>

        <details className="card pad product-editor" open={products.length === 0}>
          <summary style={{ cursor: "pointer", fontSize: 22, fontWeight: 900 }}>
            Add new product
          </summary>
          <form
            action="/api/admin/products/create"
            method="post"
            encType="multipart/form-data"
          >
            <ProductFields />
            <div className="actions">
              <button className="btn primary" type="submit">
                Create product
              </button>
            </div>
          </form>
        </details>

        <div className="editor-grid">
          {products.map((product) => (
            <form
              className="card pad product-editor"
              action="/api/admin/products/update"
              method="post"
              encType="multipart/form-data"
              key={product.id}
            >
              <ProductFields product={product} />
              <div className="actions">
                <button className="btn primary" type="submit">
                  Save product
                </button>
                <a className="btn ghost" href={`/products/${product.slug}`}>
                  Preview
                </a>
              </div>
            </form>
          ))}
        </div>
      </main>
    </div>
  );
