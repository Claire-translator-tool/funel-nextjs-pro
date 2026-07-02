import {
  supabaseAnonKey,
  supabaseRuntimeContext,
  supabaseServiceRoleKey,
} from "@/lib/supabase";

function compactMessage(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function technicalDetail(raw: string) {
  const compact = compactMessage(raw);
  return compact.length > 900 ? `${compact.slice(0, 900)}...` : compact;
}

export function requireServerAdminKey(action: string) {
  if (supabaseServiceRoleKey.trim()) {
    return;
  }

  const context = JSON.stringify(supabaseRuntimeContext(supabaseAnonKey || ""));
  throw new Error(
    `${action} failed: SUPABASE_SECRET_KEY is missing from the current Vercel deployment. ` +
      `后台写入需要服务器端 SUPABASE_SECRET_KEY，当前线上部署没有读到它，所以不能新增产品、上传图片或批量导入。` +
      `请在 Vercel Environment Variables 编辑已有的 SUPABASE_SECRET_KEY，确认它属于 givzkjmmxmrxcxtlwlys 项目，然后重新部署。Runtime context: ${context}`
  );
}

export function formatAdminOperationError(error: unknown, action: string) {
  const raw = error instanceof Error ? error.message : String(error || "Unknown error");
  const lower = raw.toLowerCase();
  const detail = technicalDetail(raw);

  if (lower.includes("supabase_secret_key is missing")) {
    return `${action}失败：当前 Vercel 部署没有读取到服务器端 SUPABASE_SECRET_KEY。后台不能用 publishable key 新增产品或上传图片。请编辑 Vercel 里已有的 SUPABASE_SECRET_KEY，而不是新增重复变量，然后重新部署。技术信息：${detail}`;
  }

  if (lower.includes("invalid api key") || lower.includes("owned by another supabase project")) {
    return `${action}失败：线上 Supabase key 无效或不属于 givzkjmmxmrxcxtlwlys 项目。请在 Vercel 更新 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 和 SUPABASE_SECRET_KEY，并重新部署。技术信息：${detail}`;
  }

  if (lower.includes("invalid compact jws") || lower.includes("jwt")) {
    return `${action}失败：Supabase 新版 sb_secret/sb_publishable key 不能当 JWT 使用。请确认已部署最新代码，并确认 SUPABASE_SECRET_KEY 是当前项目的 secret key。技术信息：${detail}`;
  }

  if (lower.includes("row-level security") || lower.includes("rls") || lower.includes("42501")) {
    return `${action}失败：Supabase 行级安全策略阻止写入。如果 SUPABASE_SECRET_KEY 已正确配置，服务端写入应绕过 RLS；若仍看到这个错误，请运行后台系统检查页提供的 Supabase 权限 SQL，并确认 claire23803@gmail.com 是 admin。技术信息：${detail}`;
  }

  if (lower.includes("bucket not found")) {
    return `${action}失败：Supabase Storage 找不到 product-images 存储桶。请在 Supabase Storage 创建 product-images，或运行项目 schema。技术信息：${detail}`;
  }

  if (lower.includes("authorization") || lower.includes("unauthorized") || lower.includes("403")) {
    return `${action}失败：Supabase 授权失败。请确认 Vercel 的 SUPABASE_SECRET_KEY 和 SUPABASE_STORAGE_BUCKET=product-images 属于同一个 Supabase 项目，然后重新部署。技术信息：${detail}`;
  }

  return `${action}失败：${detail}`;
}

export function adminErrorQuery(error: unknown, action: string) {
  return encodeURIComponent(formatAdminOperationError(error, action));
}
