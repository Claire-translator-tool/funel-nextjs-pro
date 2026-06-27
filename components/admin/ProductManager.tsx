"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CmsProduct } from "@/lib/types";

type ProductManagerProps = { products: CmsProduct[] };

export default function ProductManager({ products }: ProductManagerProps) {
  const router = useRouter();
  const [saving, setSaving] = useState("");

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dataset.id;
    setSaving(id || "new");
    const formData = new FormData(form);
    const payload: Record<string, FormDataEntryValue | string[]> = Object.fromEntries(formData.entries());
    
    // Convert textareas to arrays for specific fields
    const arrayFields = ['specs', 'applications', 'benefits', 'seo_keywords'];
    arrayFields.forEach(f => {
      if (payload[f]) payload[f] = String(payload[f]).split(/\n/).map(s => s.trim()).filter(Boolean);
    });

    await fetch(id ? `/api/admin/products/${id}` : "/api/admin/products", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving("");
    router.refresh();
  }

  return (
    <div className="grid gap-6 text-left">
      <section className="card pad bg-green-50 border-green-200">
        <h2 className="text-xl font-bold">Add new product</h2>
        <ProductForm onSubmit={saveProduct} saving={saving === "new"} />
      </section>
      {products.map((p) => (
        <section key={p.id} className="card pad bg-white border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{p.name}</h2>
            <Link href={`/products/${p.slug}`} className="btn ghost">Preview</Link>
          </div>
          <ProductForm product={p} onSubmit={saveProduct} saving={saving === p.id} />
        </section>
      ))}
    </div>
  );
}

function ProductForm({ product, onSubmit, saving }: any) {
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [uploading, setUploading] = useState(false);

  async function uploadImage(e: any) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("slug", product?.slug || "upload");
    const res = await fetch("/api/admin/media", { method: "POST", body: data });
    const json = await res.json();
    if (json.url) setImageUrl(json.url);
    setUploading(false);
  }

  return (
    <form data-id={product?.id} onSubmit={onSubmit} className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <label>Name<input name="name" className="input" defaultValue={product?.name} required /></label>
        <label>Slug<input name="slug" className="input" defaultValue={product?.slug} required /></label>
      </div>
      <label>Summary<textarea name="summary" className="input" defaultValue={product?.summary} rows={3} /></label>
      <div className="grid md:grid-cols-2 gap-4">
        <label>Upload Image<input type="file" onChange={uploadImage} disabled={uploading} /></label>
        <label>Image URL<input name="image_url" className="input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} /></label>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <label>Specs<textarea name="specs" className="input" defaultValue={product?.specs?.join("\n")} rows={5} /></label>
        <label>Apps<textarea name="applications" className="input" defaultValue={product?.applications?.join("\n")} rows={5} /></label>
        <label>Benefits<textarea name="benefits" className="input" defaultValue={product?.benefits?.join("\n")} rows={5} /></label>
      </div>
      <div className="flex justify-between items-center mt-4">
        <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={product?.published !== false} /> Published</label>
        <button type="submit" disabled={saving} className="btn primary">{saving ? "Saving..." : "Save Product"}</button>
      </div>
    </form>
  );
  }
