"use client";

import { useState } from "react";

export default function MediaLibraryManager({ images }: any) {
  const [uploading, setUploading] = useState(false);

  async function uploadImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    await fetch("/api/admin/media", { method: "POST", body: data });
    setUploading(false);
    window.location.reload();
  }

  return (
    <div className="grid gap-6">
      <div className="card pad bg-green-50">
        <h2 className="text-xl font-bold">Upload image</h2>
        <input type="file" onChange={uploadImage} disabled={uploading} className="mt-4" />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {images.map((img: any) => (
          <div key={img.url} className="card pad bg-white border-slate-200">
            <img src={img.url} alt={img.name} className="h-40 w-full object-cover rounded-md" />
            <p className="mt-2 truncate font-mono text-xs">{img.url}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
