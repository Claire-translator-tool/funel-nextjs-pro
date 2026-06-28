export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
export const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function hasSupabaseAdminConfig() {
  return !!(supabaseUrl && supabaseServiceRoleKey);
}

export function cleanSupabaseUrl(value = supabaseUrl) {
  return value.replace(/\/+$/, "");
}

export function isSupabasePlatformKey(key: string) {
  return key.startsWith("sb_secret_") || key.startsWith("sb_publishable_");
}

export function supabaseApiHeaders(key: string, extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { apikey: key, ...extra };

  if (key) {
    headers.Authorization = `Bearer ${key}`;
  }

  return headers;
}

function prepareBody(body: unknown) {
  if (!body || typeof body === "string" || body instanceof Blob || body instanceof FormData) {
    return body as BodyInit | null | undefined;
  }

  return JSON.stringify(body);
}

function prepareHeaders(headers: Record<string, string>, body: unknown) {
  if (body && typeof body !== "string" && !(body instanceof Blob) && !(body instanceof FormData)) {
    return { "Content-Type": "application/json", ...headers };
  }

  return headers;
}

export async function supabaseRest<T = any>(path: string, options: any = {}): Promise<T> {
  const key = options.service !== false ? supabaseServiceRoleKey : supabaseAnonKey;
  const { prefer, headers: customHeaders, body, ...fetchOptions } = options;
  const headers = supabaseApiHeaders(key, {
    ...(prefer ? { Prefer: prefer } : {}),
    ...(customHeaders || {}),
  });
  const res = await fetch(`${cleanSupabaseUrl()}/rest/v1/${path}`, {
    ...fetchOptions,
    body: prepareBody(body),
    headers: prepareHeaders(headers, body),
  });
  if (res.status === 204) return undefined as any;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error: ${err}`);
  }
  return res.json();
}

export async function getSupabaseUser(token: string) {
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  return res.ok ? res.json() : null;
}
