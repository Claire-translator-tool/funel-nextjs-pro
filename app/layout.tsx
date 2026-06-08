import type { Metadata } from "next";
import "./globals.css";

const site = {
  name: "Funel Sensor",
  domain: "https://www.funelsensor.com",
  email: "claire23803@gmail.com",
  whatsapp: "+8615606523212",
  phoneLabel: "+86 156 0652 3212",
  description:
    "Funel Sensor supplies online water quality analyzers, sensors, transmitters and multi-parameter controllers for wastewater, drinking water and industrial process monitoring.",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: "Funel Sensor | Online Water Quality Analyzer Manufacturer",
    template: "%s | Funel Sensor",
  },
  description: site.description,
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
    title: "Funel Sensor",
    description: site.description,
    url: site.domain,
    siteName: site.name,
    type: "website",
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "VMyAmPGnBrPR92tHmY9kmK2WFE3ybvZWKYloLDGz9tQ",
  },
};

function Header() {
  return (
    <>
      <div className="top">
        <div className="container">
          <span>FUNEL Industrial Water Monitoring</span>
          <span>
            WhatsApp: {site.phoneLabel} · Email: {site.email}
          </span>
        </div>
      </div>
      <nav className="nav">
        <div className="container">
          <a className="brand" href="/">
            FUNEL
          </a>
          <div className="menu">
            <a href="/products">Products</a>
            <a href="/#applications">Applications</a>
            <a href="/#factory">Factory</a>
            <a href="/contact">Contact</a>
          </div>
          <div className="actions">
            <a className="btn ghost" href="/admin">
              Admin
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

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div>
          <b>FUNEL Sensor</b>
          <br />
          Online water quality analyzers and process monitoring systems.
        </div>
        <div>
          Email: {site.email}
          <br />
          WhatsApp: {site.phoneLabel}
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
        <div className="float">
          <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}>
            WhatsApp
          </a>
          <a href={`mailto:${site.email}`}>Email</a>
        </div>
      </body>
    </html>
  );
}
