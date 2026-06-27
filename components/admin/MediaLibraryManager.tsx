"use client";

import { useState } from "react";

export default function MediaLibraryManager({ images }: any) {
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");

  async function uploadImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    setSelected(file.name);
    setMessage("");
    const data = new FormData();
    data.append("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body: data });
    setUploading(false);
    if (response.ok) {
      setMessage("Image uploaded. Refreshing library...");
      window.location.reload();
    } else {
      setMessage("Upload failed. Please try another image.");
    }
  }

  return (
    <div className="admin-stack">
      <section className="admin-panel upload-panel">
        <div>
          <span className="admin-kicker">Image upload</span>
          <h2>Upload product image</h2>
          <p>Upload once, then reuse the generated image URL in product pages.</p>
        </div>
        <label className="upload-dropzone">
          <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} />
          <span>{uploading ? "Uploading..." : selected || "Choose image"}</span>
          <small>PNG, JPG, WEBP and other browser image formats</small>
        </label>
        {message ? <span className={message.includes("failed") ? "upload-status error" : "upload-status"}>{message}</span> : null}
      </section>
      <div className="media-grid">
        {images.length === 0 ? (
          <div className="admin-empty">No images yet. Upload the first product image above.</div>
        ) : null}
        {images.map((img: any) => (
          <div key={img.url} className="media-card">
            <img src={img.url} alt={img.name || "Uploaded media"} />
            <strong>{img.name || "Product image"}</strong>
            <p>{img.url}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
