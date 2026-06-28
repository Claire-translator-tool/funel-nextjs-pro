import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/admin-page";
import {
  cleanSupabaseUrl,
  configuredSupabaseUrl,
  expectedSupabaseRef,
  supabaseApiHeaders,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "System Check | Funel Sensor Admin",
};

type CheckResult<T = unknown> = {
  ok: boolean;
  status?: number;
  message: string;
  data?: T;
};

type ProductProbe = {
  id?: string;
  slug: string;
  name: string;
  published?: boolean | null;
  updated_at?: string | null;
};

const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";
const defaultProbeSlug = "online-dissolved-oxygen-analyzer-pfdo-800";

function supabaseProjectRef(value: string) {
  if (!value) return "Missing";

  try {
    const host = new URL(cleanSupabaseUrl(value)).hostname;
    return host.endsWith(".supabase.co") ? host.split(".")[0] : host;
  } catch {
    return "Invalid URL";
  }
}

function mask(value: string) {
  if (!value) return "Missing";
  if (value.length <= 14) return "Configured";
  return `${value.slice(0, 10)}...${value.slice(-4)}`;
}

function envRows() {
  const configuredProjectRef = supabaseProjectRef(configuredSupabaseUrl);
  const activeProjectRef = supabaseProjectRef(supabaseUrl);

  return [
    { key: "Vercel NEXT_PUBLIC_SUPABASE_URL", value: mask(configuredSupabaseUrl) },
    { key: "Vercel configured project ref", value: configuredProjectRef },
    { key: "Active Supabase URL used by site", value: mask(supabaseUrl) },
    { key: "Active Supabase project ref", value: activeProjectRef },
    { key: "Expected project ref", value: expectedSupabaseRef },
    { key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", value: mask(supabaseAnonKey) },
    { key: "SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY", value: mask(supabaseServiceRoleKey) },
    { key: "SUPABASE_STORAGE_BUCKET", value: storageBucket },
  ];
}

async function readJson<T>(path: string): Promise<CheckResult<T>> {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return {
      ok: false,
      message: "Supabase URL or server key is missing in Vercel environment variables.",
    };
  }

  try {
    const response = await fetch(`${cleanSupabaseUrl(supabaseUrl)}${path}`, {
      headers: supabaseApiHeaders(supabaseServiceRoleKey, { Accept: "application/json" }),
      cache: "no-store",
    });
    const text = await response.text();
    let data: T | undefined;

    try {
      data = text ? (JSON.parse(text) as T) : undefined;
    } catch {
      return {
        ok: false,
        status: response.status,
        message: text || "Response was not JSON.",
      };
    }

    return {
      ok: response.ok,
      status: response.status,
      message: response.ok ? "Connected" : JSON.stringify(data),
      data,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Request failed.",
    };
  }
}

async function getProductChecks(probeSlug: string) {
  const published = await readJson<ProductProbe[]>(
    `/rest/v1/products?select=id,slug,name,published,updated_at&published=eq.true&order=updated_at.desc&limit=12`
  );
  const probe = await readJson<ProductProbe[]>(
    `/rest/v1/products?select=id,slug,name,published,updated_at&slug=eq.${encodeURIComponent(probeSlug)}&limit=1`
  );

  return { published, probe };
}

async function getStorageCheck() {
  return readJson<{ id: string; name: string; public: boolean; file_size_limit?: number }>(
    `/storage/v1/bucket/${storageBucket}`
  );
}

function StatusPill({ ok }: { ok: boolean }) {
  return <span className={`system-pill ${ok ? "ok" : "bad"}`}>{ok ? "OK 正常" : "Issue 异常"}</span>;
}

function DiagnosticCard({
  title,
  ok,
  children,
}: {
  title: string;
  ok: boolean;
  children: ReactNode;
}) {
  return (
    <section className="admin-panel system-card">
      <div className="system-card-head">
        <h2>{title}</h2>
        <StatusPill ok={ok} />
      </div>
      {children}
    </section>
  );
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSystemPage({ searchParams }: PageProps) {
  const admin = await requireAdminPage();
  const currentProjectRef = supabaseProjectRef(supabaseUrl);
  const configuredProjectRef = supabaseProjectRef(configuredSupabaseUrl);
  const activeTargetsExpectedProject = currentProjectRef === expectedSupabaseRef;
  const configuredTargetsExpectedProject = configuredProjectRef === expectedSupabaseRef;
  const params = (await searchParams) || {};
  const rawProbeSlug = params.slug;
  const probeSlug = Array.isArray(rawProbeSlug)
    ? rawProbeSlug[0] || defaultProbeSlug
    : rawProbeSlug || defaultProbeSlug;
  const [{ published, probe }, storage] = await Promise.all([
    getProductChecks(probeSlug),
    getStorageCheck(),
  ]);
  const publishedProducts = Array.isArray(published.data) ? published.data : [];
  const probeProduct = Array.isArray(probe.data) ? probe.data[0] : null;

  return (
    <AdminShell admin={admin}>
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">Operations</span>
          <h1>System Check 系统检查</h1>
          <p>检查后台、Supabase、图片库和前台产品同步的关键状态。</p>
        </div>
        <a className="btn ghost" href={`/products/${probeSlug}`} target="_blank" rel="noreferrer">
          Open probe product 打开测试产品
        </a>
      </div>

      <div className="system-grid">
        <DiagnosticCard
          title="Vercel environment variables 环境变量"
          ok={Boolean(supabaseUrl && supabaseServiceRoleKey && activeTargetsExpectedProject)}
        >
          <div className="system-table">
            {envRows().map((row) => (
              <div key={row.key}>
                <strong>{row.key}</strong>
                <code>{row.value}</code>
              </div>
            ))}
          </div>
          {!configuredTargetsExpectedProject ? (
            <p className="system-error">
              Vercel still has a Supabase URL for another project. This site is using the
              protected FUNEL fallback URL now, but you should still set NEXT_PUBLIC_SUPABASE_URL,
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY to the
              <code>{expectedSupabaseRef}</code> project, then redeploy.
              <br />
              Vercel 里仍然填着其他 Supabase 项目的 URL。网站现在会自动使用 FUNEL
              的正确项目 URL，但仍建议把三个 Supabase 环境变量改为
              <code>{expectedSupabaseRef}</code> 项目的值后重新部署。
            </p>
          ) : null}
        </DiagnosticCard>

        <DiagnosticCard title="Supabase products 产品数据" ok={published.ok && publishedProducts.length > 0}>
          <p>
            Published products 已发布产品：<strong>{publishedProducts.length}</strong>
          </p>
          <p>
            Request status 请求状态：<strong>{published.status || "n/a"}</strong>
          </p>
          {!published.ok ? <p className="system-error">{published.message}</p> : null}
          <div className="system-list">
            {publishedProducts.slice(0, 6).map((product) => (
              <a key={product.slug} href={`/products/${product.slug}`} target="_blank" rel="noreferrer">
                <strong>{product.name}</strong>
                <span>{product.slug}</span>
              </a>
            ))}
          </div>
        </DiagnosticCard>

        <DiagnosticCard title="Product sync probe 产品同步探针" ok={probe.ok && Boolean(probeProduct)}>
          <p>
            Probe slug 测试 slug：<code>{probeSlug}</code>
          </p>
          {probeProduct ? (
            <div className="system-table">
              <div>
                <strong>Name 名称</strong>
                <span>{probeProduct.name}</span>
              </div>
              <div>
                <strong>Published 发布</strong>
                <span>{String(probeProduct.published)}</span>
              </div>
              <div>
                <strong>Updated 更新</strong>
                <span>{probeProduct.updated_at || "n/a"}</span>
              </div>
            </div>
          ) : (
            <p className="system-error">{probe.message}</p>
          )}
        </DiagnosticCard>

        <DiagnosticCard title="Supabase Storage 图片库" ok={storage.ok && Boolean(storage.data)}>
          <p>
            Bucket：<code>{storageBucket}</code>
          </p>
          <p>
            Request status 请求状态：<strong>{storage.status || "n/a"}</strong>
          </p>
          {storage.ok && storage.data ? (
            <div className="system-table">
              <div>
                <strong>Public 公开访问</strong>
                <span>{String(storage.data.public)}</span>
              </div>
              <div>
                <strong>File limit 文件限制</strong>
                <span>{storage.data.file_size_limit ? `${Math.round(storage.data.file_size_limit / 1024 / 1024)} MB` : "n/a"}</span>
              </div>
            </div>
          ) : (
            <p className="system-error">{storage.message}</p>
          )}
        </DiagnosticCard>
      </div>
    </AdminShell>
  );
}
