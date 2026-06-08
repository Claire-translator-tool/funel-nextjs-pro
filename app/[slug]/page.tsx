import { notFound } from "next/navigation";
import { blockText, getPageContent } from "../page-content";

type Props = { params: Promise<{ slug: string }> };

function titleFromKey(keyName: string) {
  return keyName.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderValue(value: unknown) {
  if (Array.isArray(value)) {
    return <ul>{value.map((item, index) => <li key={index}>{String(item)}</li>)}</ul>;
  }

  if (value && typeof value === "object") {
    return (
      <pre>{JSON.stringify(value, null, 2)}</pre>
    );
  }

  return <p>{String(value || "")}</p>;
}

function renderBlocks(blocks: Record<string, unknown> | null | undefined) {
  const entries = blocks && typeof blocks === "object" ? Object.entries(blocks) : [];
  if (!entries.length) return null;

  return (
    <div className="content-blocks">
      {entries.map(([keyName, value]) => (
        <section className="content-block" key={keyName}>
          <h2>{titleFromKey(keyName)}</h2>
          {renderValue(value)}
        </section>
      ))}
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = await getPageContent(slug);

  if (!page) return {};

  return {
    title: { absolute: page.seo_title || page.title },
    description: page.seo_description || blockText(page.blocks, "focus", page.title),
  };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageContent(slug);

  if (!page) notFound();

  const intro = page.seo_description || blockText(page.blocks, "focus", "Project-ready water quality monitoring support.");

  return (
    <main className="section">
      <div className="container narrow">
        <div className="section-title">
          <small>Funel Sensor</small>
          <h1>{page.title}</h1>
          <p>{intro}</p>
        </div>
        {renderBlocks(page.blocks)}
        <div className="cta-band">
          <div>
            <h2>Need product configuration?</h2>
            <p>Send your water type, parameter, range, signal output and quantity. We will help match the right analyzer.</p>
          </div>
          <a className="btn primary" href="/contact">Request Quote</a>
        </div>
      </div>
    </main>
  );
}
