type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  return <main className="section soft"><div className="container" style={{maxWidth:520}}><form className="card pad form" action="/api/admin/login" method="post"><h1>Admin Login</h1><p className="muted">Use the Supabase admin email and password.</p>{sp.error ? <div className="notice" style={{background:"#fff2f2",color:"#9b1c1c"}}>Login failed. Check email and password.</div> : null}<input className="input" name="email" type="email" placeholder="Admin email" defaultValue="claire23803@gmail.com" required/><input className="input" name="password" type="password" placeholder="Password" required/><button className="btn primary" type="submit">Login</button></form></div></main>;
}
