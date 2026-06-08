import { getProducts, productImage } from "./product-data";

export const metadata = {
  title: "Online Water Quality Analyzer Products",
  description: "Funel Sensor online water quality analyzers and controllers for wastewater and industrial monitoring.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">
          <small>Products</small>
          <h1>Online water quality analyzers and controllers</h1>
          <p>SEO product pages for DO, pH/ORP, conductivity, turbidity, COD, ammonia nitrogen and multi-parameter controllers.</p>
        </div>
        <div className="grid three">
          {products.map((product) => (
            <article className="card" key={product.slug}>
              <img src={productImage(product)} alt={product.name} />
              <div className="card pad">
                <span className="pill">{product.category || "Water Quality"}</span>
                <h2>{product.name}</h2>
                <p>{product.summary}</p>
                <a className="btn ghost" href={`/products/${product.slug}`}>Details / Datasheet</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
