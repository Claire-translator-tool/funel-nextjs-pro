import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  product_interest?: string;
  status?: string;
  created_at?: string;
};

function headers() {
  const h: Record<string, string> = { apikey: key };
  if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) h.Authorization = `Bearer ${key}`;
  return h;
}

async function getInquiries(): Promise<Inquiry[]> {
  const res = await fetch(`${url}/rest/v1/inquiries?select=*&order=created_at.desc&limit=50`, { headers: headers(), cache: "no-store" });
  return res.ok ? res.json() : [];
}

export default async function AdminPage() {
  if (!(await cookies()).get("funel_admin_token")) redirect("/admin/login");
  const inquiries = await getInquiries();
  const total = inquiries.length;
  const fresh = inquiries.filter((i) => !i.status || i.status === "new").length;

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2>Funel Admin</h2>
        <a href="/admin">Dashboard</a>
        <a href="/admin/inquiries">Inquiries</a>
        <a href="/admin/products">Products</a>
        <a href="/admin/media">Media Library</a>
        <a href="/admin/pages">Pages</a>
        <a href="/admin/settings">Settings</a>
        <form action="/api/admin/logout" method="post"><button className="btn ghost" style={{ width: "100%" }}>Logout</button></form>
      </aside>
      <main className="admin-main">
        <div className="admin-head">
          <h1>Dashboard</h1>
        </div>
        <div className="grid three">
          <div className="card pad"><b>Total Inquiries</b><div className="text-4xl font-bold mt-2">{total}</div></div>
          <div className="card pad"><b>New</b><div className="text-4xl font-bold mt-2 text-green-600">{fresh}</div></div>
        </div>
        <div className="card mt-8">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Product</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {inquiries.slice(0, 10).map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>{i.email}</td>
                  <td>{i.product_interest}</td>
                  <td><span className="badge">{i.status || "new"}</span></td>
                  <td>{i.created_at ? new Date(i.created_at).toLocaleDateString() : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
