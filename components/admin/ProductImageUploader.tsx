"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";

type ProductImageUploaderProps = {
  defaultUrl?: string | null;
  slug?: string | null;
};

function uploadMessage(payload: any) {
  return payload?.error || payload?.message || "Image upload failed. Please try again.";
}

export default function ProductImageUploader({ defaultUrl = "", slug = "" }: ProductImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(defaultUrl || "");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    const form = input.form;
    const slugInput = form?.elements.namedItem("slug") as HTMLInputElement | null;
    const currentSlug = slugInput?.value?.trim() || slug || "product";
    const data = new FormData();
    data.append("file", file);
    data.append("folder", "products");
    data.append("slug", currentSlug);

    setFileName(file.name);
    setStatus("uploading");
    setMessage("Uploading image... 正在上传图片");

    try {
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.url) {
        throw new Error(uploadMessage(payload));
      }

      setImageUrl(payload.url);
      setStatus("success");
      setMessage("Image uploaded and URL filled. 图片已上传，链接已自动填入。点击保存产品后前台会使用这张图。");
      input.value = "";
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Image upload failed. Please try again.");
    }
  }

  async function copyUrl() {
    if (!imageUrl) return;

    await navigator.clipboard?.writeText(imageUrl).catch(() => undefined);
    setStatus("success");
    setMessage("Image URL copied. 图片链接已复制。");
  }

  return (
    <div className="product-image-uploader">
      <label className="product-image-file">
        <span>Upload Image 上传图片</span>
        <input
          name="image_file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={status === "uploading"}
        />
        <small>
          {fileName || "Select an image to upload and auto-fill the URL. 选择图片后会自动上传并填入链接。"}
        </small>
      </label>
      <label>
        Image URL 图片链接
        <input
          name="image_url"
          className="input"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="Upload an image or paste an image URL"
        />
      </label>
      {message ? (
        <div className={status === "error" ? "upload-status error image-upload-status" : "upload-status image-upload-status"}>
          {message}
        </div>
      ) : null}
      {imageUrl ? (
        <div className="image-url-preview">
          <img src={imageUrl} alt="Uploaded product preview" />
          <code>{imageUrl}</code>
          <button type="button" className="btn ghost" onClick={copyUrl}>
            Copy URL 复制链接
          </button>
        </div>
      ) : null}
    </div>
  );
}
