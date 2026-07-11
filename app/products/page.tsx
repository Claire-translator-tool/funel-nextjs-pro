import { getProducts, productImage } from "./product-data";
import ProductMedia from "@/components/ProductMedia";

export const revalidate = 60;

export const metadata = {
  title: "Laboratory Water Quality Analyzers and Portable Meters | FUNEL",
  description: "Browse FUNEL VX, VN and VI laboratory water quality analyzers for chlorine, nutrients, turbidity, color, metals, wastewater and multiparameter testing.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Laboratory Water Quality Analyzers and Portable Meters | FUNEL",
    description: "FUNEL VX, VN and VI laboratory instruments for portable, field and bench water quality testing.",
    url: "/products",
    type: "website",
  },
};

const productFamilies = [
  {
    id: "vx-series",
    prefix: "VX",
    label: "VX Series",
    title: "Portable laboratory analyzers",
    description: "Single-parameter and application-focused photometers for chlorine, nutrients, turbidity, color, metals, pool water and aquaculture testing.",
  },
  {
    id: "vn-series",
    prefix: "VN",
    label: "VN Series",
    title: "Multiparameter analyzers and test kits",
    description: "Portable multiparameter systems and drinking-water test kits for routine field inspection, laboratory screening and project sampling.",
  },
  {
    id: "vi-series",
    prefix: "VI",
    label: "VI Series",
    title: "Wastewater and nutrient laboratory analyzers",
    description: "Portable laboratory instruments for COD, ammonia nitrogen, total phosphorus, total nitrogen, suspended solids, color and turbidity testing.",
  },
];

export default async function ProductsPage() {
  const products = await getProducts();
  const groups = productFamilies.map((family) => ({
    ...family,
    products: products.filter((product) => product.model?.toUpperCase().startsWith(family.prefix)),
  })).filter((family) => family.products.length > 0);

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">
          <small>Laboratory instruments</small>
          <h1>Laboratory water quality analyzers</h1>
          <p>{products.length} portable and laboratory products organized by VX, VN and VI instrument families.</p>
        </div>
        <nav className="family-tabs" aria-label="Laboratory product families">
          {groups.map((family) => (
            <a href={`#${family.id}`} key={family.id}>
              <b>{family.label}</b>
              <span>{family.products.length} products</span>
            </a>
          ))}
        </nav>

        {groups.map((family) => (
          <section className="product-family" id={family.id} key={family.id}>
            <div className="product-family-heading">
              <small>{family.label}</small>
              <h2>{family.title}</h2>
              <p>{family.description}</p>
            </div>
            <div className="grid three">
              {family.products.map((product) => (
                <article className="card product-card" key={product.slug}>
                  <ProductMedia src={productImage(product)} alt={product.name} model={product.model} />
                  <div className="product-card-copy">
                    <span className="pill">{product.category || "Laboratory Water Quality"}</span>
                    <h3>{product.name}</h3>
                    <p>{product.summary}</p>
                    <a className="btn ghost" href={`/products/${product.slug}`}>Details / Datasheet</a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
