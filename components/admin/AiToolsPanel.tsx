"use client";
import { useState } from "react";

type Task = "product_seo" | "product_description" | "blog_outline" | "inquiry_reply";

const TASK_LABELS: Record<Task, { en: string; zh: string; desc: string }> = {
  product_seo: {
    en: "Generate SEO Content",
    zh: "生成 SEO 内容",
    desc: "Auto-generate SEO title, meta description and keywords for a product page.",
  },
  product_description: {
    en: "Generate Product Description",
    zh: "生成产品描述",
    desc: "Auto-generate summary, specs, applications and benefits for a product.",
  },
  blog_outline: {
    en: "Generate Blog Outline",
    zh: "生成博客大纲",
    desc: "Create an SEO-optimized blog article outline for content marketing.",
  },
  inquiry_reply: {
    en: "Draft Inquiry Reply",
    zh: "起草询盘回复",
    desc: "Write a professional reply to a customer inquiry.",
  },
};

const TASK_FIELDS: Record<Task, Array<{ name: string; label: string; placeholder: string; multiline?: boolean }>> = {
  product_seo: [
    { name: "product_name", label: "Product Name 产品名称", placeholder: "e.g. Online DO Analyzer" },
    { name: "model", label: "Model 型号", placeholder: "e.g. FDO-200" },
    { name: "category", label: "Category 类别", placeholder: "e.g. Dissolved Oxygen" },
    { name: "key_features", label: "Key Features 主要特点", placeholder: "e.g. 4-20mA output, RS485, IP68", multiline: true },
  ],
  product_description: [
    { name: "product_name", label: "Product Name 产品名称", placeholder: "e.g. Online Turbidity Sensor" },
    { name: "model", label: "Model 型号", placeholder: "e.g. FTU-100" },
    { name: "measuring_range", label: "Measuring Range 量程", placeholder: "e.g. 0-4000 NTU" },
    { name: "output_signal", label: "Output Signal 输出信号", placeholder: "e.g. 4-20mA, RS485 Modbus" },
    { name: "applications", label: "Applications 应用场景", placeholder: "e.g. wastewater, drinking water", multiline: true },
  ],
  blog_outline: [
    { name: "topic", label: "Topic 主题", placeholder: "e.g. How to choose a COD analyzer for wastewater" },
    { name: "target_audience", label: "Target Audience 目标读者", placeholder: "e.g. water treatment engineers" },
    { name: "keywords", label: "Target Keywords 目标关键词", placeholder: "e.g. COD analyzer, online COD sensor" },
  ],
  inquiry_reply: [
    { name: "customer_name", label: "Customer Name 客户姓名", placeholder: "e.g. John Smith" },
    { name: "inquiry_content", label: "Inquiry Content 询盘内容", placeholder: "Paste the customer's inquiry here", multiline: true },
    { name: "product_mentioned", label: "Product Mentioned 涉及产品", placeholder: "e.g. pH controller, DO sensor" },
  ],
};

export default function AiToolsPanel() {
  const [activeTask, setActiveTask] = useState<Task>("product_seo");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function handleFieldChange(name: string, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  async function handleGenerate() {
    setLoading(true);
    setResult(null);
    setError("");
    setCopied(false);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: activeTask, context: fields }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Generation failed. Please try again.");
      } else {
        setResult(data.result);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function renderResult(obj: Record<string, unknown>, depth = 0): React.ReactNode {
    return Object.entries(obj).map(([key, value]) => (
      <div key={key} style={{ marginBottom: 12, paddingLeft: depth * 12 }}>
        <strong style={{ color: "#083820", textTransform: "capitalize" }}>
          {key.replace(/_/g, " ")}
        </strong>
        {Array.isArray(value) ? (
          <ul style={{ margin: "6px 0 0 16px", padding: 0 }}>
            {(value as unknown[]).map((item, i) =>
              typeof item === "object" && item !== null ? (
                <li key={i} style={{ marginBottom: 8 }}>
                  {renderResult(item as Record<string, unknown>, depth + 1)}
                </li>
              ) : (
                <li key={i} style={{ color: "#29384b" }}>{String(item)}</li>
              )
            )}
          </ul>
        ) : typeof value === "object" && value !== null ? (
          <div style={{ marginTop: 6 }}>
            {renderResult(value as Record<string, unknown>, depth + 1)}
          </div>
        ) : (
          <p style={{ margin: "4px 0 0", color: "#29384b" }}>{String(value)}</p>
        )}
      </div>
    ));
  }

  return (
    <div className="admin-stack">
      {/* Task selector */}
      <section className="admin-panel green-panel">
        <h2>Select AI task 选择 AI 任务</h2>
        <div className="import-mode-grid" style={{ marginTop: 16 }}>
          {(Object.keys(TASK_LABELS) as Task[]).map((task) => (
            <label
              key={task}
              className="import-mode-card"
              style={{ cursor: "pointer", border: activeTask === task ? "2px solid #0a7a55" : undefined }}
            >
              <input
                type="radio"
                name="ai_task"
                value={task}
                checked={activeTask === task}
                onChange={() => {
                  setActiveTask(task);
                  setFields({});
                  setResult(null);
                  setError("");
                }}
              />
              <span>
                <strong>{TASK_LABELS[task].en}</strong>
                <small>{TASK_LABELS[task].zh}</small>
                <small style={{ fontWeight: 400, color: "#5d7085" }}>{TASK_LABELS[task].desc}</small>
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Input fields */}
      <section className="admin-panel">
        <h2>Input 输入信息</h2>
        <div className="product-editor" style={{ marginTop: 16 }}>
          {TASK_FIELDS[activeTask].map((field) => (
            <label key={field.name} className="product-editor">
              {field.label}
              {field.multiline ? (
                <textarea
                  className="input"
                  rows={3}
                  placeholder={field.placeholder}
                  value={fields[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              ) : (
                <input
                  className="input"
                  type="text"
                  placeholder={field.placeholder}
                  value={fields[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>
        <div className="upload-actions" style={{ marginTop: 20 }}>
          <button
            className="btn primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating... 生成中..." : `Generate with AI · AI 生成`}
          </button>
          {error && <span className="upload-status error">{error}</span>}
        </div>
      </section>

      {/* Result */}
      {result && (
        <section className="admin-panel green-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>Generated Result 生成结果</h2>
            <button className="btn ghost" onClick={handleCopy}>
              {copied ? "Copied! 已复制" : "Copy JSON 复制"}
            </button>
          </div>
          <div style={{ background: "#fff", borderRadius: 8, padding: "18px 20px", border: "1px solid #d8e5ec" }}>
            {renderResult(result)}
          </div>
        </section>
      )}
    </div>
  );
}
