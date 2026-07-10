import { notFound } from "next/navigation";
import { getSiteSettings } from "../../site-settings";
import { getProductBySlug, productImage } from "../product-data";
import { getAdminSession } from "@/lib/admin-auth";
import ProductMedia from "@/components/ProductMedia";

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

function buildFaq(product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>) {
  const model = product.model || product.name;
  const specs = clean(product.specs);
  const applications = clean(product.applications);

  return [
    {
      question: `What does the ${model} measure?`,
      answer: specs.length
        ? `${model} is configured for ${specs.slice(0, 4).join("; ")}.`
        : `${model} is designed for water quality measurement and project monitoring.`,
    },
    {
      question: `Where is the ${model} used?`,
      answer: applications.length
        ? `Typical applications include ${applications.slice(0, 4).join(", ")}.`
        : "Typical uses include drinking water, wastewater and industrial process water testing.",
    },
    {
      question: `How do I select or order the ${model}?`,
      answer:
        "Send FUNEL your target parameters, measuring range, water type, quantity and application. We will confirm the configuration and provide a quotation and datasheet.",
    },
  ];
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

function productJsonLd(product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>, siteDomain: string) {
  const canonical = `${siteDomain}/products/${product.slug}`;
  const image = productImage(product);
  const description =
    product.seo_description ||
    product.summary ||
    `${product.name} for online water quality monitoring projects.`;
  const faq = buildFaq(product);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${canonical}#product`,
        name: product.name,
        description,
        image,
        sku: product.model || product.slug,
        mpn: product.model || product.slug,
        brand: {
          "@type": "Brand",
          name: "FUNEL",
        },
        category: product.category || "Online Water Quality Analyzer",
        url: canonical,
        additionalProperty: clean(product.specs).slice(0, 12).map((item) => {
          const [name, ...rest] = item.split(":");

          return {
            "@type": "PropertyValue",
            name: rest.length ? name.trim() : "Specification",
            value: rest.length ? rest.join(":").trim() : item,
          };
        }),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteDomain,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Products",
            item: `${siteDomain}/products`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: canonical,
          },
        ],
      },
    ],
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const preview = (await searchParams)?.preview === "1";
  const admin = preview ? await getAdminSession() : null;
  const [product, site] = await Promise.all([
    getProductBySlug(slug, { includeDraft: Boolean(preview && admin) }),
    getSiteSettings(),
  ]);
  if (!product) notFound();
  const specs = clean(product.specs).length ? clean(product.specs) : fallbackSpecs;
  const applications = clean(product.applications).length ? clean(product.applications) : fallbackApps;
  const benefits = clean(product.benefits).length ? clean(product.benefits) : fallbackBenefits;
  const faq = buildFaq(product);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, site.site_domain)) }}
      />
      {preview && admin ? <div className="notice">Admin preview 管理员预览：可查看未发布产品。</div> : null}
      <section className="section soft"><div className="container split"><div><span className="pill">{product.category || "Water Quality"}</span><h1>{product.name}</h1>{product.model && <p><b>Model:</b> {product.model}</p>}<p className="muted">{product.summary}</p><div className="actions"><a className="btn primary" href={`/contact?product=${encodeURIComponent(product.name)}`}>Request Quote</a><a className="btn ghost" href={`/contact?product=${encodeURIComponent(product.name)}&request=datasheet`}>Get Datasheet</a></div></div><div className="card"><ProductMedia src={productImage(product)} alt={product.name} model={product.model} /></div></div></section>
      <section className="section"><div className="container answer-panel"><small>Quick answer</small><h2>{product.model || product.name}</h2><p>{product.summary || `${product.name} is a FUNEL water quality instrument for field and project testing.`}</p><p><b>Best for:</b> {applications.slice(0, 3).join(", ")}.</p></div></section>
      <section className="section"><div className="container grid three"><div className="card pad"><h2>Specifications</h2><ul>{specs.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="card pad"><h2>Applications</h2><ul>{applications.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="card pad"><h2>Benefits</h2><ul>{benefits.map((item) => <li key={item}>{item}</li>)}</ul></div></div></section>
      <section className="section soft"><div className="container"><div className="section-title"><small>Buyer questions</small><h2>Frequently asked questions</h2></div><div className="faq-list">{faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></div></section>
      <section className="section soft"><div className="container split"><div className="section-title"><small>Configuration help</small><h2>Tell us your water type and signal requirements</h2><p>We will help select the right analyzer, sensor, controller, output signal and installation plan for your project.</p></div><div className="card pad"><h3>Get a project quote</h3><p>Send parameter, measuring range, quantity, output signal and application. We will prepare a quotation and datasheet.</p><a className="btn primary" href={`/contact?product=${encodeURIComponent(product.name)}&request=quote`}>Request quote</a></div></div></section>
    </main>
  );
}
