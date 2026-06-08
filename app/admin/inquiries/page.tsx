import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  company?: string;
  country?: string;
  phone?: string;
  whatsapp?: string;
  product_interest?: string;
  quantity?: string;
  message?: string;
  source_page?: string;
  status?: string;
  created_at?: string;
};

type InquiryNote = {
  id: string;
  inquiry_id: string;
  note: string;
  created_by?: string;
  created_at?: string;
};

function headers() {
  const h: Record<string, string> = { apikey: key };
  if (key && !key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) h.Authorization = `Bearer ${key}`;
  return h;
}

async function getInquiries(): Promise<Inquiry[]> {
  const res = await fetch(`${url}/rest/v1/inquiries?select=*&order=created_at.desc&limit=200`, { headers: headers(), cache: "no-store" });
  return res.ok ? res.json() : [];
}

async function getNotes(): Promise<InquiryNote[]> {
  const res = await fetch(`${url}/rest/v1/inquiry_notes?select=*&order=created_at.desc&limit=500`, { headers: headers(), cache: "no-store" });
  return res.ok ? res.json() : [];
}

function groupNotes(notes: InquiryNote[]) {
  return notes.reduce((map, note) => {
    const list = map.get(note.inquiry_id) || [];
    list.push(note);
    map.set(note.inquiry_id, list);
    return map;
  }, new Map<string, InquiryNote[]>());
}

function statusLabel(status?: string) {
  if (status === "in_progress") return "in progress";
  return status || "new";
}

export default async function InquiriesPage() {
  if (!(await cookies()).get("funel_admin_token")) redirect("/admin/login");
  const [inquiries, notes] = await Promise.all([getInquiries(), getNotes()]);
  const noteMap = groupNotes(notes);

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
          <div><h1>Inquiries</h1><p className="muted">View quotation requests, update follow-up status and save internal notes.</p></div>
          <a className="btn primary" href="/api/admin/export/inquiries">Export CSV</a>
        </div>
        <table className="table inquiry-table">
          <thead><tr><th>Contact</th><th>Interest</th><th>Message</th><th>Follow-up</th></tr></thead>
          <tbody>
            {inquiries.length === 0 && <tr><td colSpan={4}>No inquiries yet.</td></tr>}
            {inquiries.map((i) => {
              const rowNotes = noteMap.get(i.id) || [];
              return (
                <tr key={i.id}>
                  <td><b>{i.name}</b><br /><a href={`mailto:${i.email}`}>{i.email}</a><br />{i.company}<br />{i.country}<br />{i.whatsapp || i.phone}</td>
                  <td>{i.product_interest}<br />{i.quantity}</td>
                  <td>{i.message}<br /><small>{i.source_page} - {i.created_at ? new Date(i.created_at).toLocaleString() : ""}</small>{rowNotes.length > 0 && <div className="note-list">{rowNotes.slice(0, 3).map((note) => <p key={note.id}><b>Note:</b> {note.note}<br /><small>{note.created_at ? new Date(note.created_at).toLocaleString() : ""}</small></p>)}</div>}</td>
                  <td><span className="badge">{statusLabel(i.status)}</span><form className="status-form" action="/api/admin/inquiries/update" method="post"><input type="hidden" name="id" value={i.id} /><select name="status" defaultValue={i.status || "new"}><option value="new">New</option><option value="in_progress">In progress</option><option value="won">Won</option></select><textarea name="note" rows={3} placeholder="Add internal note" /><button className="btn primary" type="submit">Save</button></form></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>
    </div>
  );
}
