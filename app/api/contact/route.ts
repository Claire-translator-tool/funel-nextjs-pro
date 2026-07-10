import { NextRequest, NextResponse } from "next/server";
import {
  cleanSupabaseUrl,
  supabaseApiHeaders,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "@/lib/supabase";

const supabaseKey = supabaseServiceRoleKey;

type InquiryInput = {
  name: string;
  email: string;
  company: string;
  country: string;
  phone: string;
  whatsapp: string;
  product_interest: string;
  quantity: string;
  message: string;
  source_page: string;
  status: "new";
};

type NotificationResult = {
  sent: boolean;
  reason?: "missing_key" | "provider_error" | "network_error";
};

function text(value: unknown) {
  return String(value || "").trim().slice(0, 5000);
}

function headers() {
  return supabaseApiHeaders(supabaseKey, { "Content-Type": "application/json", Prefer: "return=representation" });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailTable(inquiry: InquiryInput) {
  const rows = Object.entries(inquiry)
    .filter(([key]) => key !== "status")
    .map(
      ([key, value]) =>
        `<tr><th style="padding:8px 12px;text-align:left;border:1px solid #dbe3ea;background:#f8fafc">${escapeHtml(
          key.replaceAll("_", " ")
        )}</th><td style="padding:8px 12px;border:1px solid #dbe3ea">${escapeHtml(value || "-")}</td></tr>`
    )
    .join("");

  return `<div style="font-family:Arial,sans-serif;color:#0f172a"><h2>New Funel Sensor website inquiry</h2><table style="border-collapse:collapse;width:100%;max-width:760px">${rows}</table></div>`;
}

async function notify(
  inquiry: InquiryInput,
  requestId: string
): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[contact:${requestId}] Email notification skipped: RESEND_API_KEY is missing.`);
    return { sent: false, reason: "missing_key" };
  }

  const to = process.env.CONTACT_TO_EMAIL || "claire23803@gmail.com";
  const from = process.env.CONTACT_FROM_EMAIL || "Funel Sensor <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: inquiry.email,
        subject: `New Funel inquiry - ${inquiry.product_interest || inquiry.name}`,
        html: emailTable(inquiry),
      }),
    });

    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).slice(0, 500);
      console.error(
        `[contact:${requestId}] Resend rejected notification (${response.status}): ${detail}`
      );
      return { sent: false, reason: "provider_error" };
    }

    console.info(`[contact:${requestId}] Email notification accepted by Resend.`);
    return { sent: true };
  } catch (error) {
    console.error(`[contact:${requestId}] Email notification request failed.`, error);
    return { sent: false, reason: "network_error" };
  }
}

function responseUrl(request: NextRequest, params: Record<string, string>) {
  const url = new URL("/contact", request.url);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url;
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const type = req.headers.get("content-type") || "";
  const isForm = type.includes("form");
  let raw: Record<string, unknown>;

  try {
    raw = isForm
      ? Object.fromEntries((await req.formData()).entries())
      : ((await req.json()) as Record<string, unknown>);
  } catch (error) {
    console.warn(`[contact:${requestId}] Invalid request body.`, error);
    return isForm
      ? NextResponse.redirect(responseUrl(req, { error: "invalid" }), { status: 303 })
      : NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (text(raw.website)) {
    console.info(`[contact:${requestId}] Honeypot submission ignored.`);
    return isForm
      ? NextResponse.redirect(responseUrl(req, { sent: "1" }), { status: 303 })
      : NextResponse.json({ ok: true });
  }

  const inquiry: InquiryInput = {
    name: text(raw.name).slice(0, 160),
    email: text(raw.email).toLowerCase().slice(0, 254),
    company: text(raw.company).slice(0, 200),
    country: text(raw.country).slice(0, 120),
    phone: text(raw.phone).slice(0, 80),
    whatsapp: text(raw.whatsapp || raw.phone).slice(0, 80),
    product_interest: text(raw.product_interest || raw.product).slice(0, 240),
    quantity: text(raw.quantity).slice(0, 120),
    message: text(raw.message).slice(0, 5000),
    source_page: text(raw.source_page || raw.sourcePage || req.headers.get("referer") || "/contact").slice(0, 500),
    status: "new",
  };

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email);
  if (!inquiry.name || !validEmail || !inquiry.message) {
    console.warn(`[contact:${requestId}] Required-field validation failed.`);
    return isForm
      ? NextResponse.redirect(responseUrl(req, { error: "missing" }), { status: 303 })
      : NextResponse.json(
          { error: "Name, a valid email address, and message are required." },
          { status: 400 }
        );
  }

  let stored = false;
  let inquiryId = "";

  try {
    if (!supabaseUrl || !supabaseKey) throw new Error("Supabase server configuration is missing.");
    const response = await fetch(`${cleanSupabaseUrl()}/rest/v1/inquiries`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(inquiry),
      cache: "no-store",
    });
    const body = await response.text();
    if (!response.ok) throw new Error(body || `Supabase returned ${response.status}.`);
    const rows = body ? (JSON.parse(body) as Array<{ id?: string }>) : [];
    inquiryId = rows[0]?.id || "";
    stored = true;
    console.info(`[contact:${requestId}] Inquiry stored${inquiryId ? ` as ${inquiryId}` : ""}.`);
  } catch (error) {
    console.error(`[contact:${requestId}] Inquiry storage failed.`, error);
  }

  const notification = await notify(inquiry, requestId);

  if (stored || notification.sent) {
    if (isForm) {
      return NextResponse.redirect(
        responseUrl(req, {
          sent: "1",
          ...(notification.sent ? {} : { notification: "pending" }),
        }),
        { status: 303 }
      );
    }

    return NextResponse.json({
      ok: true,
      stored,
      emailed: notification.sent,
      inquiryId: inquiryId || undefined,
    });
  }

  console.error(`[contact:${requestId}] Lead capture failed at both storage and email boundaries.`);
  return isForm
    ? NextResponse.redirect(responseUrl(req, { error: "server" }), { status: 303 })
    : NextResponse.json(
        { error: "Submission failed. Please contact us by WhatsApp or email." },
        { status: 503 }
      );
}
