const site = { email: "claire23803@gmail.com", whatsapp: "+8615606523212", phoneLabel: "+86 156 0652 3212" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata = {
  title: "Contact Funel Sensor",
  description: "Request quotation, datasheet, sample or configuration help for Funel Sensor online water quality analyzers.",
};

export default async function ContactPage({ searchParams }: Props) {
  const sp = await searchParams;
  const product = typeof sp.product === "string" ? sp.product : "";
  const sent = sp.sent === "1";
  return <main className="section"><div className="container split"><div><div className="section-title"><small>Contact</small><h1>Request quote, datasheet or sample help</h1><p>Send your project requirement. We will follow up by email or WhatsApp.</p></div><p><b>Email:</b> <a href={`mailto:${site.email}`}>{site.email}</a></p><p><b>WhatsApp:</b> <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}>{site.phoneLabel}</a></p>{sent ? <div className="notice">Inquiry submitted. We will reply soon.</div> : null}</div><form className="form card pad" action="/api/contact" method="post"><input className="input" name="name" placeholder="Name *" required/><input className="input" name="email" type="email" placeholder="Email *" required/><input className="input" name="company" placeholder="Company"/><input className="input" name="country" placeholder="Country"/><input className="input" name="whatsapp" placeholder="WhatsApp / Phone"/><input className="input" name="product_interest" placeholder="Product interest" defaultValue={product}/><input className="input" name="quantity" placeholder="Quantity / project size"/><input type="hidden" name="source_page" value="/contact"/><textarea name="message" rows={7} placeholder="Water type, parameters, range, output signal, installation site... *" required></textarea><button className="btn primary" type="submit">Send Inquiry</button></form></div></main>;
}
