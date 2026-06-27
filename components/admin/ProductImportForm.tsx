"use client";
import { useState } from "react";
export default function ProductImportForm() {
  const [file, setFile] = useState<File|null>(null);
  const [publishMode, setPublishMode] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setMessage("");
    const data = new FormData();
    data.append("file", file);
    data.append("publishMode", publishMode);
    const response = await fetch("/api/admin/import-products", { method: "POST", body: data });
    setLoading(false);
    setMessage(response.ok ? "Import completed. Products are ready to review. 导入完成，可以检查产品。" : "Import failed. Please check the ZIP package and try again. 导入失败，请检查 ZIP 文件。");
  }
  return (
    <section className="admin-panel green-panel import-panel">
      <div>
        <h2>Upload product database ZIP</h2>
        <h3>上传产品数据库 ZIP 文件</h3>
        <p>
          The ZIP should contain a database Excel file and product image folders. The importer will read product fields,
          upload images to Supabase Storage, and create or update product pages by slug.
        </p>
        <p>
          该 ZIP 文件应包含一个 Excel 格式的数据库文件以及产品图片文件夹。导入程序会读取产品相关信息，将图片上传到 Supabase
          存储空间，并根据产品编号创建或更新相应的产品页面。
        </p>
      </div>
      <label className="file-field">
        <span>Product library ZIP 产品库 ZIP 文件</span>
        <input
          type="file"
          accept=".zip"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        <small>{file ? `${file.name} · ${Math.round(file.size / 1024)} KB selected` : "Example: database/FUNEL_Products.xlsx + products/model/images/*.png"}</small>
        <small>示例：database/FUNEL_Products.xlsx + products/model/images/*.png</small>
      </label>
      <fieldset className="import-mode">
        <legend>Publish mode 发布模式</legend>
        <div className="import-mode-grid">
          <label className="import-mode-card">
            <input
              type="radio"
              name="publishMode"
              value="draft"
              checked={publishMode === "draft"}
              onChange={() => setPublishMode("draft")}
            />
            <span>
              <strong>Import as draft 作为草稿导入</strong>
              <small>Safer for first test. Products are saved in admin but not public until published.</small>
              <small>首次测试时更安全。产品会先保存在后台，正式发布后才对外公开。</small>
            </span>
          </label>
          <label className="import-mode-card">
            <input
              type="radio"
              name="publishMode"
              value="published"
              checked={publishMode === "published"}
              onChange={() => setPublishMode("published")}
            />
            <span>
              <strong>Publish directly 直接发布</strong>
              <small>Product pages become public and are included in the dynamic sitemap.</small>
              <small>产品页面会公开显示，并被包含在动态站点地图中。</small>
            </span>
          </label>
        </div>
      </fieldset>
      <div className="upload-actions">
        <button onClick={handleImport} disabled={loading || !file} className="btn primary">
          {loading ? "Importing... 正在导入" : "Import products 导入产品"}
        </button>
        {message ? <span className={message.includes("failed") ? "upload-status error" : "upload-status"}>{message}</span> : null}
      </div>
    </section>
  );
}
