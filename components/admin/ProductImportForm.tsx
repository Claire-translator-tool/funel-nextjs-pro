"use client";
import { useState } from "react";
export default function ProductImportForm() {
  const [file, setFile] = useState<File|null>(null);
  const [loading, setLoading] = useState(false);
  async function handleImport() {
    if (!file) return;
    setLoading(true);
    const data = new FormData(); data.append("file", file);
    await fetch("/api/admin/import-products", { method: "POST", body: data });
    setLoading(false); alert("Import done.");
  }
  return (
    <div className="card pad bg-green-50">
      <input type="file" accept=".zip" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleImport} disabled={loading || !file} className="btn primary mt-4">Start Import</button>
    </div>
  );
}
