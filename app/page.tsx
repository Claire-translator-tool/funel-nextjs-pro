import { blockText, getPageContent } from "./page-content";
import { getProducts, productImage } from "./products/product-data";

const defaultHero = "Industrial Water Monitoring & Process Automation Solutions";
const defaultSummary =
  "Funel Sensor supplies online analyzers, digital sensors, controllers and integrated monitoring systems for municipal water, wastewater and industrial process water projects.";

export async function generateMetadata() {
  const home = await getPageContent("home");

  return {
    title: { absolute: home?.seo_title || "Funel Sensor | Online Water Quality Analyzer Manufacturer in China" },
    description:
      home?.seo_description ||
      "Online water quality analyzers, sensors, and controllers for wastewater treatment, drinking water, and industrial process monitoring.",
  };
}

export default async function HomePage() {
  const [home, products] = await Promise.all([getPageContent("home"), getProducts()]);
  const heroTitle = blockText(home?.blocks, "hero", defaultHero);
  const heroSummary = blockText(home?.blocks, "summary", defaultSummary);
  const primaryCta = blockText(home?.blocks, "primary_cta", "Explore Products");
  const primaryHref = primaryCta.toLowerCase().includes("quote") ? "/contact" : "/products";
  const secondaryHref = primaryHref === "/contact" ? "/products" : "/contact";
  const secondaryText = primaryHref === "/contact" ? "Explore Products" : "Request Quote";
  const featuredProducts = products.slice(0, 3);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div>
            <div className="eyebrow">Engineered for water treatment projects</div>
            <h1>{heroTitle}</h1>
            <p>{heroSummary}</p>
            <div className="actions">
              <a className="btn primary" href={primaryHref}>
                {primaryCta}
              </a>
              <a className="btn ghost" href={secondaryHref}>
                {secondaryText}
              </a>
            </div>
            <div className="hero-grid">
              <div className="metric">
                <b>DO / pH / ORP</b>
                <br />
                Core analyzers
              </div>
              <div className="metric">
                <b>COD / NH3-N</b>
                <br />
                Compliance monitoring
              </div>
              <div className="metric">
                <b>PLC / SCADA</b>
                <br />
                Integration support
              </div>
            </div>
          </div>
          <div className="hero-media">
            <img
              src="https://sc01.alicdn.com/kf/A7a9e8ba9d0ee48089a75084483e264beq.png"
              alt="Online water quality analyzers"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <small>Product center</small>
            <h2>Popular online water quality instruments</h2>
            <p>
              Product pages are prepared for dissolved oxygen, pH/ORP,
              conductivity, turbidity, COD, ammonia nitrogen and multi-parameter
              controllers.
            </p>
          </div>
          <div className="grid three">
            {featuredProducts.map((product) => (
              <article className="card" key={product.slug}>
                <img src={productImage(product)} alt={product.name} />
                <div className="card pad">
                  <span className="pill">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.summary}</p>
                  <a className="btn ghost" href={`/products/${product.slug}`}>
                    View details
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="applications" className="section soft">
        <div className="container">
          <div className="section-title">
            <small>Applications</small>
            <h2>Built around real monitoring scenarios</h2>
          </div>
          <div className="grid three">
            {[
              "Municipal water treatment",
              "Wastewater discharge compliance",
              "Industrial process water",
              "Aquaculture water monitoring",
              "Surface water stations",
              "OEM system integration",
            ].map((item) => (
              <div className="card pad" key={item}>
                <h3>{item}</h3>
                <p>
                  Parameter selection, output signal, installation and
                  maintenance support for project buyers.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="factory" className="section dark">
        <div className="container split">
          <div>
            <div className="section-title">
              <small>Factory and service</small>
              <h2>From instrument selection to complete configuration</h2>
              <p>
                We support distributors, EPC contractors and system integrators
                with product selection, datasheets, sample requests and quotation
                follow-up.
              </p>
            </div>
            <a className="btn primary" href="/contact">
              Get datasheet / sample help
            </a>
          </div>
          <div className="card pad">
            <h3>Inquiry follow-up backend</h3>
            <p>
              Quote requests are saved into Supabase. The admin dashboard can
              view inquiries, change status, add notes and export CSV.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <div className="section-title">
              <small>FAQ</small>
              <h2>Before requesting a quote</h2>
            </div>
            <p>
              <b>What should I send?</b>
              <br />
              Water type, parameter, measuring range, quantity, output signal,
              installation site and target application.
            </p>
            <p>
              <b>Can you support OEM?</b>
              <br />
              Yes, we can support OEM / ODM and system integrator project needs.
            </p>
          </div>
          <div className="card pad">
            <h3>Ready for quotation?</h3>
            <p>
              Send your project information and we will prepare product
              configuration and datasheet support.
            </p>
            <a className="btn primary" href="/contact">
              Request Quote
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
