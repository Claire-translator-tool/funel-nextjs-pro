import { blockText, getPageContent } from "./page-content";
import { getProducts, productImage } from "./products/product-data";
import { getSiteSettings, whatsappLink } from "./site-settings";

const defaultHero = "Industrial Water Monitoring & Process Automation Solutions";
const defaultSummary =
  "FUNEL supplies online water quality analyzers, digital sensors, controllers, automation cabinets and integrated monitoring systems for municipal water, wastewater and industrial process water projects.";

const applications = [
  [
    "Municipal Water",
    "Intake water, sedimentation, filtration, disinfection and clear water monitoring.",
  ],
  [
    "Wastewater Treatment",
    "Inlet, aeration tank, sludge concentration, final effluent and discharge compliance.",
  ],
  [
    "Industrial Process Water",
    "Cooling water, boiler water, chemical dosing, recycling water and discharge monitoring.",
  ],
  [
    "Surface Water & Environment",
    "River, lake, groundwater and environmental station applications.",
  ],
  [
    "Aquaculture",
    "DO, pH, temperature, ammonia and water safety monitoring for farms.",
  ],
  [
    "System Integrators",
    "Online analyzers, sensors, controllers, cabinet and data integration support.",
  ],
];

const support = [
  [
    "Configuration first",
    "Confirm parameter, water type, output signal, measuring range, quantity and installation before model selection.",
  ],
  [
    "Datasheet ready",
    "Get datasheets, wiring notes, communication options and quotation details for engineering comparison.",
  ],
  [
    "Sample support",
    "Discuss sample needs, OEM labels, spare parts and distributor project requirements.",
  ],
  [
    "System integration",
    "Support analyzers, sensors, controllers, PLC cabinets, Modbus, 4-20 mA and SCADA-connected projects.",
  ],
];

const process = [
  ["1", "Sampling", "Sampling point, pretreatment and site condition review."],
  ["2", "Analysis", "Analyzer, sensor, controller and range configuration."],
  ["3", "Cabinet", "Power, wiring, PLC cabinet and field installation support."],
  ["4", "Data", "RS485 Modbus, 4-20 mA, alarms, gateway and SCADA layer."],
  ["5", "Service", "Quotation, documents, OEM support and follow-up guidance."],
];

const projects = [
  [
    "Water Treatment Plant Monitoring",
    "Multi-parameter online monitoring for inlet, process and outlet water quality.",
  ],
  [
    "Wastewater Automation Control",
    "PLC cabinet, field instruments and process data acquisition for stable operation.",
  ],
  [
    "Industrial Discharge Monitoring",
    "Integrated station for COD, ammonia, pH, flow and compliance monitoring.",
  ],
];

const faqs = [
  [
    "What should I send for a quotation?",
    "Water type, parameter, measuring range, quantity, output signal, installation site and target application.",
  ],
  [
    "Can FUNEL support OEM or system integrator projects?",
    "Yes. We support product selection, controller configuration, private label discussion and project-based quotation.",
  ],
  [
    "Which communication outputs are available?",
    "Common project configurations include 4-20 mA, relay alarm and RS485 Modbus. Final options depend on the selected analyzer and controller.",
  ],
  [
    "Can I request datasheets before ordering?",
    "Yes. Datasheets, configuration suggestions and wiring information can be provided after confirming the target product and application.",
  ],
];

export async function generateMetadata() {
  const home = await getPageContent("home");

  return {
    title: {
      absolute:
        home?.seo_title ||
        "Funel Sensor | Online Water Quality Analyzer Manufacturer in China",
    },
    description:
      home?.seo_description ||
      "Online water quality analyzers, sensors, controllers, automation cabinets and monitoring systems for wastewater treatment, drinking water and industrial process monitoring.",
  };
}

export default async function HomePage() {
  const [home, products, site] = await Promise.all([
    getPageContent("home"),
    getProducts(),
    getSiteSettings(),
  ]);
  const heroTitle = blockText(home?.blocks, "hero", defaultHero);
  const heroSummary = blockText(home?.blocks, "summary", defaultSummary);
  const primaryCta = blockText(home?.blocks, "primary_cta", "Request Solution");
  const featured = products.slice(0, 6);
  const heroProduct = featured[0] || products[0];
  const projectProduct =
    products.find((product) => product.slug.includes("cod")) ||
    featured[5] ||
    heroProduct;

  return (
    <main>
      <section className="hero" id="home">
        <div className="container">
          <div>
            <div className="eyebrow">Engineered for water treatment projects</div>
            <h1>{heroTitle}</h1>
            <p>{heroSummary}</p>
            <div className="actions" style={{ marginTop: 28 }}>
              <a className="btn primary" href="/contact">
                {primaryCta}
              </a>
              <a className="btn ghost" href="#products">
                Explore Products
              </a>
            </div>
            <div className="hero-grid">
              <div className="metric">
                <b>Online</b>
                <br />
                Water Analyzers
              </div>
              <div className="metric">
                <b>PLC</b>
                <br />
                Automation Systems
              </div>
              <div className="metric">
                <b>OEM</b>
                <br />
                Project Support
              </div>
            </div>
          </div>
          <div className="hero-media" style={{ background: "#fff" }}>
            <img
              src={productImage(heroProduct)}
              alt="FUNEL online water quality analyzers"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                padding: 20,
              }}
            >
              <div className="card pad">
                <b>Water Quality</b>
                <br />
                <span className="muted">
                  pH, ORP, DO, turbidity, COD, ammonia, conductivity
                </span>
              </div>
              <div className="card pad">
                <b>System Integration</b>
                <br />
                <span className="muted">
                  Sampling, sensors, cabinet, data platform, remote monitoring
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft" style={{ padding: "28px 0" }}>
        <div className="container grid four">
          <div className="card pad">
            <b>Wastewater</b>
            <p>DO, pH/ORP, COD, ammonia nitrogen</p>
          </div>
          <div className="card pad">
            <b>Drinking Water</b>
            <p>Turbidity, pH, conductivity, ORP</p>
          </div>
          <div className="card pad">
            <b>Industrial Water</b>
            <p>RO, boiler, cooling and process water</p>
          </div>
          <div className="card pad">
            <b>Integrators</b>
            <p>Modbus, 4-20 mA, PLC and cabinet projects</p>
          </div>
        </div>
      </section>

      <section id="products" className="section">
        <div className="container">
          <div
            className="section-title"
            style={{ margin: "0 auto 34px", textAlign: "center" }}
          >
            <small>Product Center</small>
            <h2>Online analyzers, sensors and monitoring systems</h2>
            <p>
              Built for project-based water monitoring, system integration and
              industrial process control.
            </p>
          </div>
          <div className="grid three">
            {featured.map((product) => (
              <article className="card" key={product.slug}>
                <img src={productImage(product)} alt={product.name} />
                <div className="card pad">
                  <span className="pill">
                    {product.category || "Water Quality"}
                  </span>
                  <h3>{product.name}</h3>
                  <p>{product.summary}</p>
                  <div className="actions" style={{ marginTop: 18 }}>
                    <a className="btn primary" href={`/products/${product.slug}`}>
                      Details
                    </a>
                    <a
                      className="btn ghost"
                      href={`/contact?product=${encodeURIComponent(product.name)}`}
                    >
                      Quote
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-title">
            <small>Buying Support</small>
            <h2>
              Built for quotation, datasheet, sample and system configuration
            </h2>
          </div>
          <div className="grid four">
            {support.map(([title, text]) => (
              <article className="card pad" key={title}>
                <span className="pill">Support</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="section soft">
        <div className="container">
          <div
            className="section-title"
            style={{ margin: "0 auto 34px", textAlign: "center" }}
          >
            <small>Applications</small>
            <h2>Solutions by water treatment scenario</h2>
            <p>
              FUNEL presents products by process and application, so engineers
              can quickly match instruments to monitoring points.
            </p>
          </div>
          <div className="grid three">
            {applications.map(([title, text]) => (
              <article
                className="card pad"
                key={title}
                style={{ borderLeft: "5px solid var(--green2)" }}
              >
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="automation" className="section dark">
        <div className="container">
          <div
            className="section-title"
            style={{ margin: "0 auto 34px", textAlign: "center" }}
          >
            <small>Automation Integration</small>
            <h2>From instrument to complete control system</h2>
            <p>
              Support complete monitoring architecture from field sensor to PLC,
              cabinet, data acquisition and SCADA display.
            </p>
          </div>
          <div
            className="card"
            style={{ maxWidth: 980, margin: "0 auto 28px", background: "#fff" }}
          >
            <img
              src="/images/plc-scada-system-integration.png"
              alt="FUNEL PLC and SCADA system integration"
              style={{ height: 430, objectFit: "cover" }}
            />
            <div className="card pad">
              <span className="pill">PLC / SCADA</span>
              <h3>Remote Monitoring Architecture</h3>
              <p>
                System network, PLC/DCS control and SCADA screen display for
                water monitoring and automation projects.
              </p>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {process.map(([number, title, text]) => (
              <article className="metric" key={title}>
                <b>
                  {number}. {title}
                </b>
                <br />
                {text}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="section">
        <div className="container">
          <div
            className="section-title"
            style={{ margin: "0 auto 34px", textAlign: "center" }}
          >
            <small>Project Experience</small>
            <h2>Engineering-style project presentation</h2>
            <p>
              Show buyers how FUNEL products fit real water treatment plants,
              control cabinets, installation sites and commissioning projects.
            </p>
          </div>
          <div className="split">
            <div className="card">
              <img
                src={productImage(projectProduct)}
                alt="FUNEL water monitoring project"
                style={{ height: 480, objectFit: "contain", padding: 20 }}
              />
            </div>
            <div className="grid">
              {projects.map(([title, text]) => (
                <article className="card pad" key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section soft">
        <div className="container split">
          <div>
            <div className="section-title">
              <small>About FUNEL</small>
              <h2>Water analysis instruments with engineering capability</h2>
            </div>
            <p className="muted">
              FUNEL focuses on industrial online water quality analysis, sensors,
              automation control and integrated monitoring systems.
            </p>
            <p className="muted">
              The website is structured around product families, process
              applications and project solutions, helping overseas customers
              understand both product supply and system integration ability.
            </p>
          </div>
          <div className="grid four">
            <div className="card pad">
              <b>OEM / ODM</b>
            </div>
            <div className="card pad">
              <b>Technical Support</b>
            </div>
            <div className="card pad">
              <b>Project Integration</b>
            </div>
            <div className="card pad">
              <b>Global Inquiry</b>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="section-title">
            <small>FAQ</small>
            <h2>Common buyer questions</h2>
          </div>
          <div className="grid">
            {faqs.map(([question, answer]) => (
              <article className="card pad" key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section dark">
        <div className="container split">
          <div>
            <div className="section-title">
              <small>Contact</small>
              <h2>Send your project requirements</h2>
              <p>
                Tell us your water type, monitoring parameters, measuring range,
                installation site, output signal and communication requirements.
              </p>
            </div>
            <div
              className="card pad"
              style={{
                background: "rgba(255,255,255,.08)",
                borderColor: "rgba(255,255,255,.18)",
              }}
            >
              <p>
                <b>WhatsApp:</b>{" "}
                <a href={whatsappLink(site.contact_whatsapp)}>
                  {site.contact_whatsapp}
                </a>
              </p>
              <p>
                <b>Email:</b>{" "}
                <a href={`mailto:${site.contact_email}`}>
                  {site.contact_email}
                </a>
              </p>
              <p>
                <b>Alibaba:</b>{" "}
                <a href="https://sxfne1688.en.alibaba.com" target="_blank">
                  FUNEL Alibaba International Store
                </a>
              </p>
            </div>
          </div>
          <form className="form card pad" action="/api/contact" method="post">
            <input
              className="input"
              name="name"
              placeholder="Name / Company *"
              required
            />
            <input
              className="input"
              name="email"
              type="email"
              placeholder="Email *"
              required
            />
            <input className="input" name="country" placeholder="Country / market" />
            <input
              className="input"
              name="whatsapp"
              placeholder="WhatsApp / Phone"
            />
            <input
              className="input"
              name="product_interest"
              placeholder="Product interest"
            />
            <input
              className="input"
              name="quantity"
              placeholder="Quantity / project size"
            />
            <input type="hidden" name="source_page" value="/" />
            <textarea
              name="message"
              rows={7}
              placeholder="Project requirements: parameters, water type, range, output signal, application... *"
              required
            ></textarea>
            <button className="btn primary" type="submit">
              Send Inquiry
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
