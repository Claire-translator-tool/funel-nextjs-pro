const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

function headers() {
  const h: Record<string, string> = { apikey: key };
  if (key && !key.startsWith("sb_")) h.Authorization = `Bearer ${key}`;
  return h;
}

export async function supabaseRest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Supabase error: ${error}`);
  }
  if (options.headers && (options.headers as any).Prefer === "return=minimal") return [] as any;
  return res.json();
                             }
