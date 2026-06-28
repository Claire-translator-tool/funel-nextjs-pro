import { notFound } from "next/navigation";
import { getSiteSettings } from "../../site-settings";
import { getProductBySlug, productImage } from "../product-data";
import { getAdminSession } from "@/lib/admin-auth";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
};
export const dynamic = "force-dynamic";
export const revalidate = 0;

const fallbackSpecs = ["4-20mA / RS485 Modbus", "Continuous online monitoring", "Project configuration support"];
const fallbackApps = ["Wastewater treatment", "Drinking water", "Industrial process water"];
const fallbackBenefits = ["Fast quotation support", "Datasheet and sample help", "OEM and system integration support"];

function clean(items?: string[] | null) {
  return Array.isArray(items) ? items.filter(Boolean) : [];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [product, site] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) return { title: { absolute: `Product | ${site.site_name}` }, description: `${site.site_name} product` };

  const description = product.seo_description || product.summary || `${site.site_name} online water quality analyzer product.`;
  const title = product.seo_title || product.name;
  const canonical = `${site.site_domain}/products/${product.slug}`;

  return {
    title: { absolute: title },
    description,
    keywords: product.seo_keywords || undefined,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, images: [productImage(product)] },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const preview = (await searchParams)?.preview === "1";
  const admin = preview ? await getAdminSession() : null;
  const product = await getProductBySlug(slug, { includeDraft: Boolean(preview && admin) });
  if (!product) notFound();
  const specs = clean(product.specs).length ? clean(product.specs) : fallbackSpecs;
  const applications = clean(product.applications).length ? clean(product.applications) : fallbackApps;
  const benefits = clean(product.benefits).length ? clean(product.benefits) : fallbackBenefits;

  return (
    <main>
      {preview && admin ? <div className="notice">Admin preview 管理员预览：可查看未发布产品。</div> : null}
      <section className="section soft"><div className="container split"><div><span className="pill">{product.category || "Water Quality"}</span><h1>{product.name}</h1>{product.model && <p><b>Model:</b> {product.model}</p>}<p className="muted">{product.summary}</p><div className="actions"><a className="btn primary" href={`/contact?product=${encodeURIComponent(product.name)}`}>Request Quote</a><a className="btn ghost" href={`/contact?product=${encodeURIComponent(product.name)}&request=datasheet`}>Get Datasheet</a></div></div><div className="card"><img src={productImage(product)} alt={product.name} /></div></div></section>
      <section className="section"><div className="container grid three"><div className="card pad"><h2>Specifications</h2><ul>{specs.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="card pad"><h2>Applications</h2><ul>{applications.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="card pad"><h2>Benefits</h2><ul>{benefits.map((item) => <li key={item}>{item}</li>)}</ul></div></div></section>
      <section className="section soft"><div className="container split"><div className="section-title"><small>Configuration help</small><h2>Tell us your water type and signal requirements</h2><p>We will help select the right analyzer, sensor, controller, output signal and installation plan for your project.</p></div><div className="card pad"><h3>Get a project quote</h3><p>Send parameter, measuring range, quantity, output signal and application. We will prepare a quotation and datasheet.</p><a className="btn primary" href={`/contact?product=${encodeURIComponent(product.name)}&request=quote`}>Request quote</a></div></div></section>
    </main>
  );
}
