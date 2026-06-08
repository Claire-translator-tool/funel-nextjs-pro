import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

type Inquiry = { id: string; name: string; email: string; product_interest?: string; status?: string; created_at?: string };

function headers() { const h: Record<string,string> = { apikey: key }; if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) h.Authorization = `Bearer ${key}`; return h; }
async function getInquiries(): Promise<Inquiry[]> { const res = await fetch(`${url}/rest/v1/inquiries?select=*&order=created_at.desc&limit=50`, { headers: headers(), cache: "no-store" }); return res.ok ? res.json() : []; }
function Shell({ children }: { children: React.ReactNode }) { return <div className="admin-layout"><aside className="sidebar"><h2>Funel Admin</h2><a href="/admin">Dashboard</a><a href="/admin/inquiries">Inquiries</a><a href="/products">Products</a><form action="/api/admin/logout" method="post"><button className="btn ghost" style={{width:"100%"}}>Logout</button></form></aside><main className="admin-main">{children}</main></div>; }

export default async function AdminPage() {
  if (!(await cookies()).get("funel_admin_token")) redirect("/admin/login");
  const inquiries = await getInquiries();
  const total = inquiries.length;
  const fresh = inquiries.filter(i=>!i.status || i.status === "new").length;
  const following = inquiries.filter(i=>i.status === "follow_up").length;
  const won = inquiries.filter(i=>i.status === "won").length;
  return <Shell><h1>Dashboard</h1><div className="grid four"><div className="card pad"><h3>Total</h3><b>{total}</b></div><div className="card pad"><h3>New</h3><b>{fresh}</b></div><div className="card pad"><h3>Follow-up</h3><b>{following}</b></div><div className="card pad"><h3>Won</h3><b>{won}</b></div></div><h2>Recent inquiries</h2><table className="table"><tbody>{inquiries.slice(0,8).map(i=><tr key={i.id}><td>{i.name}<br/><small>{i.email}</small></td><td>{i.product_interest}</td><td><span className="badge">{i.status || "new"}</span></td><td>{i.created_at ? new Date(i.created_at).toLocaleString() : ""}</td></tr>)}</tbody></table></Shell>;
}
