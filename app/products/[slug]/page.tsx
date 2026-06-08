const products = [
  { slug: "pfdo-800-dissolved-oxygen-analyzer", name: "Online Dissolved Oxygen Analyzer", category: "Dissolved Oxygen", summary: "Online DO monitoring for aeration tanks, wastewater treatment, aquaculture and process water.", specs: ["Range: 0-20 mg/L", "4-20mA / RS485 Modbus", "Continuous online monitoring"], image: "https://sc01.alicdn.com/kf/A7a9e8ba9d0ee48089a75084483e264beq.png" },
  { slug: "ph-orp-online-analyzer", name: "Online pH ORP Analyzer", category: "pH / ORP", summary: "Online pH and ORP measurement for dosing, neutralization, wastewater and industrial water.", specs: ["pH: 0-14", "ORP: -2000 to +2000 mV", "4-20mA / RS485 Modbus"], image: "https://sc01.alicdn.com/kf/A7a9e8ba9d0ee48089a75084483e264beq.png" },
  { slug: "conductivity-tds-salinity-analyzer", name: "Conductivity TDS Salinity Analyzer", category: "Conductivity", summary: "Online conductivity, TDS and salinity monitoring for RO, boiler, cooling and process water.", specs: ["Conductivity / TDS / salinity", "Temperature compensation", "RS485 Modbus"], image: "https://sc01.alicdn.com/kf/A720309b651ed4be6b3a7d972061cbea2Z.png" },
  { slug: "muc-200-multi-parameter-controller", name: "Multi-Parameter Water Quality Controller", category: "Controller", summary: "Multi-parameter controller for pH, ORP, conductivity, turbidity, DO and integrated stations.", specs: ["Multi-channel monitoring", "RS485 / 4-20mA", "Cabinet integration"], image: "https://sc01.alicdn.com/kf/A720309b651ed4be6b3a7d972061cbea2Z.png" },
];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  return { title: product?.name || "Product", description: product?.summary || "Funel Sensor product" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug) || products[0];
  return <main><section className="section soft"><div className="container split"><div><span className="pill">{product.category}</span><h1>{product.name}</h1><p className="muted">{product.summary}</p><div className="actions"><a className="btn primary" href={`/contact?product=${encodeURIComponent(product.name)}`}>Request Quote</a><a className="btn ghost" href={`/contact?product=${encodeURIComponent(product.name)}&request=datasheet`}>Get Datasheet</a></div></div><div className="card"><img src={product.image} alt={product.name}/></div></div></section><section className="section"><div className="container grid three"><div className="card pad"><h2>Specifications</h2><ul>{product.specs.map((item)=><li key={item}>{item}</li>)}</ul></div><div className="card pad"><h2>Applications</h2><p>Wastewater treatment, drinking water, industrial process water and monitoring station projects.</p></div><div className="card pad"><h2>Support</h2><p>Send water type, range, output signal, quantity and installation information for configuration help.</p></div></div></section></main>;
}
