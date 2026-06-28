import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  cleanSupabaseUrl,
  supabaseApiHeaders,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "@/lib/supabase";

const key = supabaseServiceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

type PageRow = {
  id: string;
  slug: string;
  title: string;
  blocks?: Record<string, unknown> | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published?: boolean | null;
};

function headers() {
  return supabaseApiHeaders(key);
}

async function getPages(): Promise<PageRow[]> {
  if (!supabaseUrl || !key) return [];
  const res = await fetch(`${cleanSupabaseUrl()}/rest/v1/pages?select=*&order=created_at.asc`, {
    headers: headers(),
    cache: "no-store",
  });
  return res.ok ? res.json() : [];
}

function jsonText(value?: Record<string, unknown> | null) {
  return JSON.stringify(value || {}, null, 2);
}

function notice(params: Record<string, string | string[] | undefined>) {
  if (params.saved === "1") return <div className="notice">Saved.</div>;
  if (params.error === "invalid_json") return <div className="notice error">Blocks must be valid JSON.</div>;
  if (params.error) return <div className="notice error">Save failed. Please check required fields.</div>;
  return null;
}

export default async function AdminPagesPage({ searchParams }: Props) {
  if (!(await cookies()).get("funel_admin_token")) redirect("/admin/login");
  const [params, pages] = await Promise.all([searchParams, getPages()]);

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
            <h1>Pages</h1>
            <p className="muted">Edit page titles, content blocks, SEO descriptions and publish status.</p>
          </div>
          <a className="btn ghost" href="/">View site</a>
        </div>
        {notice(params)}
        <div className="editor-grid">
          {pages.map((page) => (
            <form className="card pad product-editor" action="/api/admin/pages/update" method="post" key={page.id}>
              <input type="hidden" name="id" value={page.id} />
              <div className="editor-title">
                <h2>{page.title}</h2>
                <label><input type="checkbox" name="published" defaultChecked={page.published !== false} /> Published</label>
              </div>
              <div className="form-row">
                <label>Title<input className="input" name="title" defaultValue={page.title} required /></label>
                <label>Slug<input className="input" name="slug" defaultValue={page.slug} required /></label>
              </div>
              <label>Content blocks JSON<textarea name="blocks" rows={8} defaultValue={jsonText(page.blocks)} /></label>
              <label>SEO title<input className="input" name="seo_title" defaultValue={page.seo_title || ""} /></label>
              <label>SEO description<textarea name="seo_description" rows={3} defaultValue={page.seo_description || ""} /></label>
              <div className="actions">
                <button className="btn primary" type="submit">Save page</button>
                <a className="btn ghost" href={page.slug === "home" ? "/" : `/${page.slug}`}>Preview</a>
              </div>
            </form>
          ))}
        </div>
      </main>
    </div>
  );
}
