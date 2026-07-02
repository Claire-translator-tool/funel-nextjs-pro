import { NextResponse } from "next/server";
import {
  cleanSupabaseUrl,
  configuredSupabaseUrl,
  expectedSupabaseRef,
  supabaseApiHeaders,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "@/lib/supabase";
import { getMediaBucket } from "@/lib/supabase-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProbeResult = {
  ok: boolean;
  status?: number;
  message: string;
};

function projectRef(value: string) {
  if (!value) return "missing";

  try {
    const host = new URL(cleanSupabaseUrl(value)).hostname;
    return host.endsWith(".supabase.co") ? host.split(".")[0] : host;
  } catch {
    return "invalid-url";
  }
}

function keyType(value: string) {
  if (!value) return "missing";
  if (value.startsWith("sb_secret_")) return "sb_secret";
  if (value.startsWith("sb_publishable_")) return "sb_publishable";
  if (value.split(".").length === 3) return "legacy JWT";
  return "custom";
}

function safeDetail(text: string) {
  return text
    .replaceAll(supabaseServiceRoleKey, "[server-key]")
    .replaceAll(supabaseAnonKey, "[publishable-key]")
    .slice(0, 500);
}

async function probeSupabase(path: string, init: RequestInit = {}): Promise<ProbeResult> {
  if (!supabaseUrl) {
    return { ok: false, message: "Supabase URL missing" };
  }

  if (!supabaseServiceRoleKey) {
    return { ok: false, message: "SUPABASE_SECRET_KEY missing" };
  }

  try {
    const response = await fetch(`${cleanSupabaseUrl(supabaseUrl)}${path}`, {
      ...init,
      headers: {
        ...supabaseApiHeaders(supabaseServiceRoleKey, { Accept: "application/json" }),
        ...((init.headers as Record<string, string> | undefined) || {}),
      },
      cache: "no-store",
    });
    const text = await response.text().catch(() => "");

    return {
      ok: response.ok,
      status: response.status,
      message: response.ok ? "OK" : safeDetail(text || response.statusText),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Probe failed",
    };
  }
}

export async function GET() {
  const bucket = getMediaBucket();
  const [bucketRead, bucketList, productRead] = await Promise.all([
    probeSupabase(`/storage/v1/bucket/${bucket}`),
    probeSupabase(`/storage/v1/object/list/${bucket}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "media", limit: 1, offset: 0 }),
    }),
    probeSupabase("/rest/v1/products?select=id,slug,published&limit=1"),
  ]);

  const activeRef = projectRef(supabaseUrl);
  const configuredRef = projectRef(configuredSupabaseUrl);
  const serverReady = bucketRead.ok && bucketList.ok && productRead.ok;

  return NextResponse.json(
    {
      ok: serverReady && activeRef === expectedSupabaseRef,
      checkedAt: new Date().toISOString(),
      deployment: {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "unknown",
        branch: process.env.VERCEL_GIT_COMMIT_REF || "unknown",
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "unknown",
        message: process.env.VERCEL_GIT_COMMIT_MESSAGE || "unknown",
      },
      supabase: {
        configuredRef,
        activeRef,
        expectedRef: expectedSupabaseRef,
        usingUrlFallback: configuredSupabaseUrl !== supabaseUrl,
        publishableKeyType: keyType(supabaseAnonKey),
        serverKeyType: keyType(supabaseServiceRoleKey),
        storageBucket: bucket,
      },
      probes: {
        bucketRead,
        bucketList,
        productRead,
      },
      note: "This endpoint is read-only. Use /admin/system after login for the real write/upload probe. 此接口只读；登录后台后打开 /admin/system 可做真实写入和图片上传测试。",
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}