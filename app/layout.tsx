import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings, whatsappLink } from "./site-settings";

const defaultDescription =
  "Funel Sensor supplies online water quality analyzers, sensors, transmitters and multi-parameter controllers for wastewater, drinking water and industrial process monitoring.";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();

  return {
    metadataBase: new URL(site.site_domain),
    title: {
      default: `${site.site_name} | Online Water Quality Analyzer Manufacturer`,
      template: `%s | ${site.site_name}`,
    },
    description: site.company_tagline || defaultDescription,
    keywords: [
      "online water quality analyzer",
      "dissolved oxygen analyzer",
      "pH ORP analyzer",
      "conductivity meter",
      "turbidity analyzer",
      "COD analyzer",
      "ammonia nitrogen analyzer",
    ],
    openGraph: {
      title: site.site_name,
      description: site.company_tagline || defaultDescription,
      url: site.site_domain,
      siteName: site.site_name,
      type: "website",
    },
    verification: {
      google:
        process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
        "VMyAmPGnBrPR92tHmY9kmK2WFE3ybvZWKYloLDGz9tQ",
    },
  };
}

function Header({ site }: { site: Awaited<ReturnType<typeof getSiteSettings>> }) {
  return (
    <>
      <div className="top">
        <div className="container">
          <span>FUNEL® Industrial Water Monitoring & Automation</span>
          <span>
            WhatsApp: {site.contact_whatsapp} · Email: {site.contact_email}
          </span>
        </div>
      </div>
      <nav className="nav">
        <div className="container">
          <a className="brand" href="/">
            <span className="brand-mark">F</span>
            <span>FUNEL®</span>
          </a>
          <div className="menu">
            <a href="/#products">Products</a>
            <a href="/#solutions">Solutions</a>
            <a href="/#automation">Automation</a>
            <a href="/#projects">Projects</a>
            <a href="/#about">About</a>
            <a href="/contact">Contact</a>
          </div>
          <div className="actions">
            <div className="lang-links" aria-label="Language">
              <a href="/">English</a>
              <a href="/zh">中文</a>
            </div>
            <a className="btn ghost" href="/admin/login">
              Admin
            </a>
            <a
              className="btn darkghost"
              href="https://sxfne1688.en.alibaba.com"
              target="_blank"
              rel="noreferrer"
            >
              Alibaba Store
            </a>
            <a className="btn primary" href="/contact">
              Request Quote
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}

function Footer({ site }: { site: Awaited<ReturnType<typeof getSiteSettings>> }) {
  return (
    <footer className="footer">
      <div className="container">
        <div>
          <b>FUNEL®</b>
          <br />
          Industrial Water Monitoring & Automation Solutions
        </div>
        <div>
          Email: {site.contact_email}
          <br />
          WhatsApp: {site.contact_whatsapp}
        </div>
      </div>
    </footer>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteSettings();

  return (
    <html lang="en">
      <body>
        <Header site={site} />
        {children}
        <Footer site={site} />
        <div className="float">
          <a href={whatsappLink(site.contact_whatsapp)}>WhatsApp</a>
          <a href={`mailto:${site.contact_email}`}>Email</a>
        </div>
      </body>
    </html>
  );
}
