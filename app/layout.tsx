import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings, whatsappLink } from "./site-settings";
import Script from "next/script";

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
      google: "VMyAmPGnBrPR92tHmY9kmK2WFE3ybvZWKYloLDGz9tQ",
    },
  };
}

function Header({ site }: { site: Awaited<ReturnType<typeof getSiteSettings>> }) {
  return (
    <>
      <div className="top">
        <div className="container">
          <span>FUNELÂ® Industrial Water Monitoring & Automation</span>
          <span>
            WhatsApp: {site.contact_whatsapp} Â· Email: {site.contact_email}
          </span>
        </div>
      </div>
      <nav className="nav">
        <div className="container">
          <a className="brand" href="/">
            <span className="brand-mark">F</span>
            <span>FUNELÂ®</span>
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
            <div className="lang">
              <select 
                id="lang-select"
                className="bg-transparent border-none outline-none cursor-pointer font-bold text-sm"
              >
                <option value="en">English</option>
                <option value="es">EspaÃ±ol</option>
                <option value="pt">PortuguÃªs</option>
                <option value="ru">Ð ÑÑÑÐºÐ¸Ð¹</option>
                <option value="ar">Ø§ÙØ¹Ø±Ø¨ÙØ©</option>
                <option value="zh-CN">ä¸­æ</option>
              </select>
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
              Lequest Quote
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
          <b>FUNELÂ®</b>
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
      <head>
        <Script id="google-translate-config" strategy="afterInteractive">
          {`
            window.googleTranslateElementInit = function() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
            };

            document.addEventListener('DOMContentLoaded', function() {
              const select = document.getElementById('lang-select');
              if (select) {
                select.addEventListener('change', function() {
                  const lang = this.value;
                  if (lang === 'en') {
                    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.funelsensor.com; path=/;';
                  } else {
                    document.cookie = 'googtrans=/en/' + lang + '; path=/';
                    document.cookie = 'googtrans=/en/' + lang + '; domain=.funelsensor.com; path=/';
                  }
                  window.location.reload();
                });
              }
            });
          `}
        </Script>
        <Script 
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" 
          strategy="afterInteractive" 
        />
      </head>
      <body>
        <div id="google_translate_element" style={{ display: 'none' }}></div>
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
