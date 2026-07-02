function readEnv(name: string) {
  return (process.env[name] || "").trim();
}

function cleanKey(value: string) {
  return value.trim();
}

export const expectedSupabaseRef = readEnv("FUNEL_EXPECTED_SUPABASE_REF") || "givzkjmmxmrxcxtlwlys";
export const expectedSupabaseUrl =
  readEnv("FUNEL_SUPABASE_URL") || `https://${expectedSupabaseRef}.supabase.co`;
export const configuredSupabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
export const fallbackSupabasePublishableKey = "sb_publishable_BnjPNRICrqXBvo1stdGDJQ_bVJaQ8Jt";
export const supabaseAnonKey =
  readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
  readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  fallbackSupabasePublishableKey;
export const supabaseServiceRoleKey = readEnv("SUPABASE_SECRET_KEY") || readEnv("SUPABASE_SERVICE_ROLE_KEY");

export function getSupabaseAuthKeys() {
  return Array.from(
    new Set(
      [
        supabaseAnonKey,
        readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
        readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
        fallbackSupabasePublishableKey,
        supabaseServiceRoleKey,
      ].map(cleanKey).filter(Boolean)
    )
  );
}

function getSupabaseUserRestKeys() {
  return Array.from(
    new Set(
      [
        supabaseAnonKey,
        readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
        readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
        fallbackSupabasePublishableKey,
      ].map(cleanKey).filter(Boolean)
    )
  );
}

function getSupabaseRestKeys(useService: boolean) {
  return Array.from(
    new Set(
      [
        useService ? supabaseServiceRoleKey : "",
        supabaseAnonKey,
        readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
        readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
        fallbackSupabasePublishableKey,
      ].map(cleanKey).filter(Boolean)
    )
  );
}

function isMutationMethod(method = "GET") {
  return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

function getSupabaseRestVariants(useService: boolean, token?: string, mutation = false) {
  const variants: Array<{ key: string; token?: string }> = [];
  const seen = new Set<string>();
  const push = (key: string, authToken?: string) => {
    const nextKey = cleanKey(key);
    const nextToken = authToken ? cleanKey(authToken) : undefined;
    if (!nextKey) return;
    const id = `${nextKey}:${nextToken || "service"}`;
    if (seen.has(id)) return;
    seen.add(id);
    variants.push({ key: nextKey, token: nextToken });
  };

  if (useService && supabaseServiceRoleKey) {
    push(supabaseServiceRoleKey);

    // Admin writes must either succeed with the server key or fail loudly.
    // Falling back to a browser session token hides the real problem and
    // produces confusing RLS errors such as 42501.
    if (mutation) {
      return variants;
    }
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
  if (readEnv("FUNEL_DISABLE_SUPABASE_URL_FALLBACK") === "true") return false;
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
  return value.trim().replace(/\/+$/, "");
}

export function isSupabasePlatformKey(key: string) {
  const value = cleanKey(key);
  return value.startsWith("sb_secret_") || value.startsWith("sb_publishable_");
}

function shouldSendBearerForServerKey(key: string) {
  const value = cleanKey(key);
  // Supabase's new sb_publishable_ / sb_secret_ keys are API keys, not JWTs.
  // Sending them as Bearer tokens makes Storage/PostgREST reject the request
  // with "Invalid Compact JWS". Only legacy JWT service_role keys belong in
  // the Authorization header.
  return Boolean(value && !isSupabasePlatformKey(value) && value.split(".").length === 3);
}

function keyKind(key: string) {
  const value = cleanKey(key);
  if (!value) return "missing";
  if (value.startsWith("sb_secret_")) return "sb_secret";
  if (value.startsWith("sb_publishable_")) return "sb_publishable";
  if (value.split(".").length === 3) return "legacy JWT";
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
  const value = cleanKey(key);
  const headers: Record<string, string> = { apikey: value };

  if (shouldSendBearerForServerKey(value)) {
    headers.Authorization = `Bearer ${value}`;
  }

  return { ...headers, ...extra };
}

function supabaseUserApiHeaders(key: string, token: string, extra: Record<string, string> = {}) {
  return {
    apikey: cleanKey(key),
    Authorization: `Bearer ${cleanKey(token)}`,
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

function writeAuthHelp(status: number, key: string, text: string) {
  const context = supabaseRuntimeContext(key);
  const raw = text ? ` Response: ${text}` : "";

  return [
    `Supabase write failed (${status}, ${JSON.stringify(context)}).`,
    "Admin writes must succeed with SUPABASE_SECRET_KEY on the server.",
    "If this shows 401/403/RLS, update the Vercel SUPABASE_SECRET_KEY for project givzkjmmxmrxcxtlwlys and redeploy, or run /admin/system policy SQL if the key is correct.",
    "后台写入必须通过服务端 SUPABASE_SECRET_KEY。若仍然显示 401/403/RLS，请检查 Vercel 里的 SUPABASE_SECRET_KEY 是否属于 givzkjmmxmrxcxtlwlys 项目，或在 /admin/system 运行权限 SQL。",
    raw,
  ].join(" ");
}

export async function supabaseRest<T = any>(path: string, options: any = {}): Promise<T> {
  const { prefer, headers: customHeaders, body, token, service, ...fetchOptions } = options;
  const method = String(fetchOptions.method || "GET");
  const mutation = isMutationMethod(method);
  const useService = service !== false;
  const variants = getSupabaseRestVariants(useService, token, mutation);
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

    if (mutation && useService && supabaseServiceRoleKey) {
      throw new Error(writeAuthHelp(res.status, variant.key, text));
    }

    if (isLikelyAuthKeyFailure(res.status, text)) {
      continue;
    }

    throw new Error(`Supabase error (${res.status}, ${JSON.stringify(supabaseRuntimeContext(variant.key))}): ${text}`);
  }

  if (lastFailure) {
    const message = mutation && useService
      ? writeAuthHelp(lastFailure.status, lastFailure.key, lastFailure.text)
      : `Supabase error (${lastFailure.status}, ${JSON.stringify(
          supabaseRuntimeContext(lastFailure.key)
        )}): ${lastFailure.text}`;

    throw new Error(message);
  }

  throw new Error("Supabase error: no API key configured.");
}

export async function getSupabaseUser(token: string) {
  for (const key of getSupabaseAuthKeys()) {
    const res = await fetch(`${cleanSupabaseUrl()}/auth/v1/user`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${cleanKey(token)}`,
      },
    });

    if (res.ok) {
      return res.json();
    }
  }

  return null;
}
