import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, productImage } from "../product-data";

type Props = { params: Promise<{ slug: string }> };
const fallbackSpecs = ["4-20mA / RS485 Modbus", "Continuous online monitoring", "Project configuration support"];
const fallbackApps = ["Wastewater treatment", "Drinking water", "Industrial process water"];
const fallbackBenefits = ["Fast quotation support", "Datasheet and sample help", "OEM and system integration support"];

function clean(items?: string[] | null) {
  return Array.isArray(items) ? items.filter(Boolean) : [];
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product | Funel Sensor", description: "Funel Sensor product" };
  const description = product.seo_description || product.summary || "Funel Sensor online water quality analyzer product.";
  return {
    title: product.seo_title || product.name,
    description,
    keywords: product.seo_keywords || undefined,
    alternates: { canonical: `https://www.funelsensor.com/products/${product.slug}` },
    openGraph: { title: product.seo_title || product.name, description, url: `https://www.funelsensor.com/products/${product.slug}`, images: [productImage(product)] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const specs = clean(product.specs).length ? clean(product.specs) : fallbackSpecs;
  const applications = clean(product.applications).length ? clean(product.applications) : fallbackApps;
  const benefits = clean(product.benefits).length ? clean(product.benefits) : fallbackBenefits;

  return (
    <main>
      <section className="section soft"><div className="container split"><div><span className="pill">{product.category || "Water Quality"}</span><h1>{product.name}</h1>{product.model && <p><b>Model:</b> {product.model}</p>}<p className="muted">{product.summary}</p><div className="actions"><a className="btn primary" href={`/contact?product=${encodeURIComponent(product.name)}`}>Request Quote</a><a className="btn ghost" href={`/contact?product=${encodeURIComponent(product.name)}&request=datasheet`}>Get Datasheet</a></div></div><div className="card"><img src={productImage(product)} alt={product.name} /></div></div></section>
      <section className="section"><div className="container grid three"><div className="card pad"><h2>Specifications</h2><ul>{specs.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="card pad"><h2>Applications</h2><ul>{applications.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="card pad"><h2>Benefits</h2><ul>{benefits.map((item) => <li key={item}>{item}</li>)}</ul></div></div></section>
      <section className="section soft"><div className="container split"><div className="section-title"><small>Configuration help</small><h2>Tell us your water type and signal requirements</h2><p>We will help select the right analyzer, sensor, controller, output signal and installation plan for your project.</p></div><div className="card pad"><h3>Get a project quote</h3><p>Send parameter, measuring range, quantity, output signal and application. We will prepare a quotation and datasheet.</p><a className="btn primary" href={`/contact?product=${encodeURIComponent(product.name)}&request=quote`}>Request quote</a></div></div></section>
    </main>
  );
}
