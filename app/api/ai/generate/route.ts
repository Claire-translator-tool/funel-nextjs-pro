import { NextRequest, NextResponse } from "next/server";
import { requireAdminForApi } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

type GenerateRequest = {
  task: "product_seo" | "product_description" | "blog_outline" | "inquiry_reply";
  context: Record<string, string>;
};

const SYSTEM_PROMPTS: Record<string, string> = {
  product_seo: `You are an SEO expert for industrial water quality instruments targeting international B2B buyers.
Write concise, keyword-rich SEO content for product pages. Focus on technical specifications, applications, and buyer intent keywords.
Always output valid JSON with fields: seo_title (max 60 chars), seo_description (max 160 chars), seo_keywords (array of 8-12 strings).`,

  product_description: `You are a technical copywriter for FUNEL, a Chinese manufacturer of online water quality analyzers and sensors.
Write professional product summaries for international buyers (wastewater plants, water utilities, industrial facilities).
Output JSON with: summary (2-3 sentences, max 200 chars), specs (array of 5-8 key spec strings), applications (array of 4-6 use case strings), benefits (array of 3-5 buyer benefit strings).`,

  blog_outline: `You are a content strategist for FUNEL water quality instruments.
Create SEO-optimized blog article outlines targeting water treatment engineers and procurement managers globally.
Output JSON with: title (string), meta_description (string), sections (array of objects with heading and key_points array).`,

  inquiry_reply: `You are a professional sales representative for FUNEL water quality instruments.
Write a helpful, professional reply to a customer inquiry. Be specific about technical capabilities and next steps.
Output JSON with: subject (string), body (plain text string, professional tone).`,
};

export async function POST(request: NextRequest) {
  const auth = await requireAdminForApi();
  if (!auth.ok) return auth.response;

  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "AI service not configured. Please add OPENAI_API_KEY to Vercel environment variables." },
      { status: 503 }
    );
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { task, context } = body;

  if (!task || !SYSTEM_PROMPTS[task]) {
    return NextResponse.json({ error: "Invalid task type." }, { status: 400 });
  }

  const userPrompt = Object.entries(context || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[task] },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `AI API error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const result = JSON.parse(content);

    return NextResponse.json({ ok: true, result, task });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed." },
      { status: 500 }
    );
  }
}
