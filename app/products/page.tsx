const products = [
  {
    slug: "pfdo-800-dissolved-oxygen-analyzer",
    name: "Online Dissolved Oxygen Analyzer",
    category: "Dissolved Oxygen",
    summary: "Online DO monitoring for aeration tanks, wastewater treatment, aquaculture and process water.",
    image: "https://sc01.alicdn.com/kf/A7a9e8ba9d0ee48089a75084483e264beq.png",
  },
  {
    slug: "ph-orp-online-analyzer",
    name: "Online pH ORP Analyzer",
    category: "pH / ORP",
    summary: "Online pH and ORP measurement for dosing, neutralization, wastewater and industrial water.",
    image: "https://sc01.alicdn.com/kf/A7a9e8ba9d0ee48089a75084483e264beq.png",
  },
  {
    slug: "conductivity-tds-salinity-analyzer",
    name: "Conductivity TDS Salinity Analyzer",
    category: "Conductivity",
    summary: "Online conductivity, TDS and salinity monitoring for RO, boiler, cooling and process water.",
    image: "https://sc01.alicdn.com/kf/A720309b651ed4be6b3a7d972061cbea2Z.png",
  },
  {
    slug: "muc-200-multi-parameter-controller",
    name: "Multi-Parameter Water Quality Controller",
    category: "Controller",
    summary: "Multi-parameter controller for pH, ORP, conductivity, turbidity, DO and integrated stations.",
    image: "https://sc01.alicdn.com/kf/A720309b651ed4be6b3a7d972061cbea2Z.png",
  },
];

export const metadata = {
  title: "Online Water Quality Analyzer Products",
  description: "Funel Sensor online water quality analyzers and controllers for wastewater and industrial monitoring.",
};

export default function ProductsPage() {
  return <main className="section"><div className="container"><div className="section-title"><small>Products</small><h1>Online water quality analyzers and controllers</h1><p>SEO product pages for DO, pH/ORP, conductivity, turbidity, COD, ammonia nitrogen and multi-parameter controllers.</p></div><div className="grid three">{products.map((p)=><article className="card" key={p.slug}><img src={p.image} alt={p.name}/><div className="card pad"><span className="pill">{p.category}</span><h2>{p.name}</h2><p>{p.summary}</p><a className="btn ghost" href={`/products/${p.slug}`}>Details / Datasheet</a></div></article>)}</div></div></main>;
}
