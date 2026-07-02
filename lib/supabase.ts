export const expectedSupabaseRef = process.env.FUNEL_EXPECTED_SUPABASE_REF || "givzkjmmxmrxcxtlwlys";
export const expectedSupabaseUrl =
  process.env.FUNEL_SUPABASE_URL || `https://${expectedSupabaseRef}.supabase.co`;
export const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const fallbackSupabasePublishableKey = "sb_publishable_BnjPNRICrqXBvo1stdGDJQ_bVJaQ8Jt";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  fallbackSupabasePublishableKey;
export const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function getSupabaseAuthKeys() {
  return Array.from(
    new Set(
      [
        supabaseAnonKey,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        fallbackSupabasePublishableKey,
        supabaseServiceRoleKey,
      ].filter(Boolean)
    )
  );
}

function getSupabaseUserRestKeys() {
  return Array.from(
    new Set(
      [
        supabaseAnonKey,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        fallbackSupabasePublishableKey,
      ].filter(Boolean)
    )
  );
}

function getSupabaseRestKeys(useService: boolean) {
  return Array.from(
    new Set(
      [
        useService ? supabaseServiceRoleKey : "",
        supabaseAnonKey,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        fallbackSupabasePublishableKey,
      ].filter(Boolean)
    )
  );
}

function getSupabaseRestVariants(useService: boolean, token?: string) {
  const variants: Array<{ key: string; token?: string }> = [];
  const seen = new Set<string>();
  const push = (key: string, authToken?: string) => {
    if (!key) return;
    const id = `${key}:${authToken || "service"}`;
    if (seen.has(id)) return;
    seen.add(id);
    variants.push({ key, token: authToken });
  };

  if (useService && supabaseServiceRoleKey) {
    push(supabaseServiceRoleKey);
  }

  if (token) {
    for (const key of getSupabaseUserRestKeys()) {
      push(key, token);
    }
  }

  for (const key of getSupabaseRestKeys(useService)) {
    push(key);
  }

  return variants;
}

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
  return !!(supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey || fallbackSupabasePublishableKey));
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
    has_fallback_publishable_key: Boolean(fallbackSupabasePublishableKey),
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

function supabaseUserApiHeaders(key: string, token: string, extra: Record<string, string> = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${token}`,
    ...extra,
  };
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

function isLikelyAuthKeyFailure(status: number, bodyText: string) {
  if (![400, 401, 403].includes(status)) return false;

  const text = bodyText.toLowerCase();
  return (
    text.includes("invalid compact jws") ||
    text.includes("invalid api key") ||
    text.includes("unauthorized") ||
    text.includes("jwt") ||
    text.includes("authorization") ||
    text.includes("api key") ||
    text.includes("row-level security") ||
    text.includes("rls") ||
    text.includes("42501")
  );
}

export async function supabaseRest<T = any>(path: string, options: any = {}): Promise<T> {
  const { prefer, headers: customHeaders, body, token, service, ...fetchOptions } = options;
  const useService = service !== false;
  const variants = getSupabaseRestVariants(useService, token);
  const preparedBody = prepareBody(body);
  let lastFailure: { status: number; key: string; text: string } | null = null;

  for (const variant of variants) {
    const headers = variant.token
      ? supabaseUserApiHeaders(variant.key, variant.token, {
          ...(prefer ? { Prefer: prefer } : {}),
          ...(customHeaders || {}),
        })
      : supabaseApiHeaders(variant.key, {
          ...(prefer ? { Prefer: prefer } : {}),
          ...(customHeaders || {}),
        });
    const res = await fetch(`${cleanSupabaseUrl()}/rest/v1/${path}`, {
      ...fetchOptions,
      body: preparedBody,
      headers: prepareHeaders(headers, body),
    });

    if (res.status === 204) return undefined as any;

    const text = await res.text();
    if (res.ok) {
      if (!text) return undefined as T;
      return JSON.parse(text) as T;
    }

    lastFailure = { status: res.status, key: variant.key, text };

    if (isLikelyAuthKeyFailure(res.status, text)) {
      continue;
    }

    throw new Error(`Supabase error (${res.status}, ${JSON.stringify(supabaseRuntimeContext(variant.key))}): ${text}`);
  }

  if (lastFailure) {
    throw new Error(
      `Supabase error (${lastFailure.status}, ${JSON.stringify(
        supabaseRuntimeContext(lastFailure.key)
      )}): ${lastFailure.text}`
    );
  }

  throw new Error("Supabase error: no API key configured.");
}

export async function getSupabaseUser(token: string) {
  for (const key of getSupabaseAuthKeys()) {
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
