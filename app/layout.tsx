import type { Metadata } from "next";
import "./globals.css";
import "./admin.css";
import SiteChrome from "@/components/SiteChrome";
import { getSiteSettings } from "./site-settings";
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
      "water quality sensor manufacturer",
      "industrial water instrumentation",
      "wastewater monitoring system",
      "COD analyzer supplier",
      "pH ORP controller",
    ],
    alternates: {
      canonical: "/",
      languages: {
        "en-US": "/",
        "zh-CN": "/zh",
      },
    },
    openGraph: {
      title: site.site_name,
      description: site.company_tagline || defaultDescription,
      url: site.site_domain,
      siteName: site.site_name,
      type: "website",
      images: [{ url: "/images/project-case.png" }],
    },
    verification: {
      google: "VMyAmPGnBrPR92tHmY9kmK2WFE3ybvZWKYloLDGz9tQ",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteSettings();

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FUNEL®",
    "url": "https://funelsensor.com",
    "logo": "https://funelsensor.com/images/logo.png",
    "description": "Professional supplier of industrial water monitoring and automation solutions specializing in online analyzers and sensors.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Hangzhou",
      "addressCountry": "CN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "telephone": "+86-156-0652-3212",
      "email": "Claire@funel-sensor.com",
      "availableLanguage": ["English", "Chinese", "Spanish"]
    },
    "sameAs": [
      "https://sxfne1688.en.alibaba.com",
      "https://linkedin.com/in/claire-chen-1a6629399",
    ],
  };

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

            (function() {
              function syncLang() {
                const select = document.getElementById('lang-select');
                if (!select) return setTimeout(syncLang, 100);
                
                const cookies = document.cookie.split(';');
                const gtrans_val = cookies.find(c => c.trim().startsWith('googtrans='));
                if (gtrans_val) {
                  const val = gtrans_val.split('=')[1].split('/').pop();
                  select.value = val || 'en';
                }

                select.onchange = function() {
                  const lang = this.value;
                  const domains = [window.location.hostname, '.' + window.location.hostname.split('.').slice(-2).join('.')];
                  const paths = ['/', '/zh'];
                  
                  // Clear ALL possible googtrans cookies
                  domains.forEach(d => {
                    paths.forEach(p => {
                      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + d + '; path=' + p;
                      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + p;
                    });
                  });

                  if (lang !== 'en') {
                    document.cookie = 'googtrans=/en/' + lang + '; path=/; domain=' + window.location.hostname;
                    document.cookie = 'googtrans=/en/' + lang + '; path=/; domain=.' + window.location.hostname.split('.').slice(-2).join('.');
                  }
                  window.location.reload();
                };
              }
              syncLang();
            })();
          `}
        </Script>
        <Script 
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" 
          strategy="afterInteractive" 
        />
      </head>
      <body>
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <SiteChrome site={site}>{children}</SiteChrome>
      </body>
    </html>
  );
}
