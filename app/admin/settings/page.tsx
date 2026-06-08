import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
type SettingRow = { key: string; value: string | null };

const defaultKeys = [
  "site_name",
  "site_domain",
  "company_tagline",
  "contact_email",
  "contact_phone",
  "contact_whatsapp",
  "contact_wechat",
];

function headers() {
  const h: Record<string, string> = { apikey: key };
  if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) h.Authorization = `Bearer ${key}`;
  return h;
}

async function getSettings(): Promise<SettingRow[]> {
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/site_settings?select=key,value&order=key.asc`, {
    headers: headers(),
    cache: "no-store",
  });
  return res.ok ? res.json() : [];
}

function orderedSettings(rows: SettingRow[]) {
  const map = new Map(rows.map((row) => [row.key, row.value || ""]));
  const defaults = defaultKeys.map((keyName) => ({ key: keyName, value: map.get(keyName) || "" }));
  const extras = rows.filter((row) => !defaultKeys.includes(row.key)).map((row) => ({ key: row.key, value: row.value || "" }));
  return [...defaults, ...extras];
}

function niceLabel(keyName: string) {
  return keyName.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function notice(params: Record<string, string | string[] | undefined>) {
  if (params.saved === "1") return <div className="notice">Saved.</div>;
  if (params.error) return <div className="notice error">Save failed. Please check the values.</div>;
  return null;
}

export default async function AdminSettingsPage({ searchParams }: Props) {
  if (!(await cookies()).get("funel_admin_token")) redirect("/admin/login");
  const [params, rows] = await Promise.all([searchParams, getSettings()]);
  const settings = orderedSettings(rows);

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
            <h1>Settings</h1>
            <p className="muted">Update company contact details, domain, brand name and default site text.</p>
          </div>
          <a className="btn ghost" href="/contact">View contact page</a>
        </div>
        {notice(params)}
        <form className="card pad product-editor" action="/api/admin/settings/update" method="post">
          <div className="settings-list">
            {settings.map((setting) => (
              <label key={setting.key}>
                {niceLabel(setting.key)}
                <input type="hidden" name="keys" value={setting.key} />
                <textarea name={`value:${setting.key}`} rows={setting.key === "company_tagline" ? 4 : 2} defaultValue={setting.value} />
              </label>
            ))}
          </div>
          <div className="card pad nested-tool">
            <h2>Add setting</h2>
            <div className="form-row">
              <label>Key<input className="input" name="new_key" placeholder="example_key" /></label>
              <label>Value<textarea name="new_value" rows={2} placeholder="Setting value" /></label>
            </div>
          </div>
          <button className="btn primary" type="submit">Save settings</button>
        </form>
      </main>
    </div>
  );
}
