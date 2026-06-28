import Link from "next/link";
import type { CmsProduct } from "@/lib/types";
import ProductImageUploader from "@/components/admin/ProductImageUploader";

type ProductManagerProps = { products: CmsProduct[] };

export default function ProductManager({ products }: ProductManagerProps) {
  return (
    <div className="admin-stack">
      <section className="admin-panel green-panel product-editor-panel">
        <h2>Add new product 添加新产品</h2>
        <ProductForm action="/api/admin/products/create" />
      </section>
      {products.length === 0 ? (
        <div className="admin-empty">
          No products loaded from Supabase yet. Add a product above, or check Supabase/Vercel environment settings if existing products should appear.
          <br />
          暂未从 Supabase 读取到产品。你可以先在上方新增产品；如果已有产品却没显示，请检查 Supabase/Vercel 环境变量。
        </div>
      ) : null}
      {products.map((p) => (
        <section key={p.id || p.slug} className="admin-panel product-editor-panel">
          <div className="admin-panel-head">
            <div>
              <h2>{p.name}</h2>
              <p>{p.model || p.category || p.slug}</p>
            </div>
            <Link href={`/products/${p.slug}`} className="btn ghost">
              Preview 预览
            </Link>
          </div>
          <ProductForm product={p} action="/api/admin/products/update" />
        </section>
      ))}
    </div>
  );
}

function listValue(value?: string[] | null) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function ProductForm({ product, action }: { product?: CmsProduct; action: string }) {
  return (
    <form action={action} method="post" encType="multipart/form-data" className="product-editor">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="form-row three-cols">
        <label>
          Slug 蛞蝓
          <input name="slug" className="input" defaultValue={product?.slug || ""} required />
        </label>
        <label>
          Model 型号
          <input name="model" className="input" defaultValue={product?.model || ""} />
        </label>
        <label>
          Category 类别/种类
          <input name="category" className="input" defaultValue={product?.category || ""} />
        </label>
      </div>
      <label>
        Name 名称
        <input name="name" className="input" defaultValue={product?.name || ""} required />
      </label>
      <label>
        Summary 摘要/总结
        <textarea name="summary" className="input" defaultValue={product?.summary || ""} rows={4} />
      </label>
      <ProductImageUploader defaultUrl={product?.image_url || ""} slug={product?.slug || ""} />
      <div className="form-row three-cols">
        <label>
          Specs 规格
          <textarea name="specs" className="input" defaultValue={listValue(product?.specs)} rows={6} />
        </label>
        <label>
          Applications 应用
          <textarea name="applications" className="input" defaultValue={listValue(product?.applications)} rows={6} />
        </label>
        <label>
          Benefits 优势
          <textarea name="benefits" className="input" defaultValue={listValue(product?.benefits)} rows={6} />
        </label>
      </div>
      <div className="form-row">
        <label>
          SEO title SEO 标题
          <input name="seo_title" className="input" defaultValue={product?.seo_title || ""} />
        </label>
        <label>
          SEO keywords SEO 关键词
          <textarea name="seo_keywords" className="input" defaultValue={listValue(product?.seo_keywords)} rows={3} />
        </label>
      </div>
      <label>
        SEO description SEO 描述
        <textarea name="seo_description" className="input" defaultValue={product?.seo_description || ""} rows={3} />
      </label>
      <div className="editor-actions">
        <label className="checkbox-line">
          <input type="checkbox" name="published" defaultChecked={product?.published !== false} />
          Published 已发布
        </label>
        <button type="submit" className="btn primary">
          Save product 保存产品
        </button>
      </div>
    </form>
  );
}
