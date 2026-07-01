export const expectedSupabaseRef = process.env.FUNEL_EXPECTED_SUPABASE_REF || "givzkjmmxmrxcxtlwlys";
export const expectedSupabaseUrl =
  process.env.FUNEL_SUPABASE_URL || `https://${expectedSupabaseRef}.supabase.co`;
export const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const fallbackSupabasePublishableKey = "sb_publishable_Tjl0nfHNjM1C7TvCxbY1aw_-3aGCOBr";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  fallbackSupabasePublishableKey;
export const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function projectRefFromUrl(value: string): string {
  try {
    const host = new URL(cleanSupabaseUrl(value)).hostname;
    return host.endsWith(".supabase.co") ? host.split(".")[0] : host;
  } catch {
    return value ? "invalid-url" : "";
  }
}

function shouldUseExpectedSupabaseUrl() {
  if (process.env.FUNEL_DISABLE_SUPABASE_URL_FALLBACK === "true") return false;
  if (!expectedSupabaseRef) return false;
  if (!configuredSupabaseUrl) return true;

  const configuredRef = projectRefFromUrl(configuredSupabaseUrl);
  return configuredRef && configuredRef !== expectedSupabaseRef;
}

export const supabaseUrl = shouldUseExpectedSupabaseUrl()
  ? expectedSupabaseUrl
  : configuredSupabaseUrl;

export function hasSupabaseAdminConfig() {
  return !!(supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey));
}

export function cleanSupabaseUrl(value = supabaseUrl) {
  return value.replace(/\/+$/, "");
}

export function isSupabasePlatformKey(key: string) {
  return key.startsWith("sb_secret_") || key.startsWith("sb_publishable_");
}

function keyKind(key: string) {
  if (!key) return "missing";
  if (key.startsWith("sb_secret_")) return "sb_secret";
  if (key.startsWith("sb_publishable_")) return "sb_publishable";
  if (key.split(".").length === 3) return "jwt";
  return "custom";
}

export function supabaseRuntimeContext(key: string) {
  return {
    url_ref: projectRefFromUrl(supabaseUrl) || "missing-url",
    configured_url_ref: projectRefFromUrl(configuredSupabaseUrl) || "missing-url",
    expected_url_ref: expectedSupabaseRef,
    using_url_fallback: supabaseUrl !== configuredSupabaseUrl,
    key_type: keyKind(key),
    has_publishable_key: Boolean(supabaseAnonKey),
    has_secret_key: Boolean(supabaseServiceRoleKey),
  };
}

export function supabaseApiHeaders(key: string, extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { apikey: key, ...extra };

  if (key && !isSupabasePlatformKey(key)) {
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
    throw new Error(`Supabase error (${res.status}, ${JSON.stringify(supabaseRuntimeContext(key))}): ${err}`);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function getSupabaseUser(token: string) {
  const authKeys = Array.from(new Set([supabaseAnonKey, supabaseServiceRoleKey].filter(Boolean)));

  for (const key of authKeys) {
    const res = await fetch(`${cleanSupabaseUrl()}/auth/v1/user`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      return res.json();
    }
  }

  return null;
}
