import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

type Inquiry = { id: string; name: string; email: string; company?: string; country?: string; phone?: string; whatsapp?: string; product_interest?: string; quantity?: string; message?: string; source_page?: string; status?: string; created_at?: string };
function headers() { const h: Record<string,string> = { apikey: key }; if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) h.Authorization = `Bearer ${key}`; return h; }
async function getInquiries(): Promise<Inquiry[]> { const res = await fetch(`${url}/rest/v1/inquiries?select=*&order=created_at.desc&limit=200`, { headers: headers(), cache: "no-store" }); return res.ok ? res.json() : []; }

export default async function InquiriesPage() {
  if (!(await cookies()).get("funel_admin_token")) redirect("/admin/login");
  const inquiries = await getInquiries();
  return <div className="admin-layout"><aside className="sidebar"><h2>Funel Admin</h2><a href="/admin">Dashboard</a><a href="/admin/inquiries">Inquiries</a><a href="/products">Products</a><form action="/api/admin/logout" method="post"><button className="btn ghost" style={{width:"100%"}}>Logout</button></form></aside><main className="admin-main"><h1>Inquiries</h1><p><a className="btn primary" href="/api/admin/export/inquiries">Export CSV</a></p><table className="table"><thead><tr><th>Contact</th><th>Interest</th><th>Message</th><th>Status</th></tr></thead><tbody>{inquiries.map(i=><tr key={i.id}><td><b>{i.name}</b><br/>{i.email}<br/>{i.company}<br/>{i.country}<br/>{i.whatsapp || i.phone}</td><td>{i.product_interest}<br/>{i.quantity}</td><td>{i.message}<br/><small>{i.source_page} · {i.created_at ? new Date(i.created_at).toLocaleString() : ""}</small></td><td><span className="badge">{i.status || "new"}</span></td></tr>)}</tbody></table></main></div>;
}
