import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default:
      "Funel Sensor | Online Water Quality Analyzer Manufacturer in China",
    template: "%s | Funel Sensor",
  },
  description: site.description,
  keywords: [
    "water quality analyzer manufacturer",
    "online water quality analyzer",
    "dissolved oxygen analyzer",
    "pH ORP analyzer",
    "conductivity meter",
    "turbidity analyzer",
    "COD analyzer",
    "ammonia nitrogen analyzer",
    "wastewater monitoring instruments",
    "online effluent monitoring system",
    "RS485 Modbus water quality sensor",
    "industrial wastewater online monitoring system",
    "OCEMS water quality monitoring",
    "automatic wastewater monitoring station",
    "water quality monitoring buoy",
    "OEM water quality analyzer",
    "ODM water monitoring system",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "zh-CN": "/zh",
    },
  },
  openGraph: {
    title: "Funel Sensor - Online Water Quality Analyzer Manufacturer",
    description: site.description,
    url: site.domain,
    siteName: site.name,
    images: [
      {
        url: "/images/industrial-water-quality-analyzers.png",
        width: 1600,
        height: 900,
        alt: "Online water quality analyzers for industrial monitoring",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Funel Sensor - Online Water Quality Analyzer Manufacturer",
    description: site.description,
    images: ["/images/industrial-water-quality-analyzers.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "VMyAmPGnBrPR92tHmY9kmK2WFE3ybvZWKYloLDGz9tQ",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.domain,
    email: site.contact.email,
    telephone: site.contact.phoneLabel,
    description: site.description,
    sameAs: ["https://sxfne1688.en.alibaba.com"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: site.contact.email,
        telephone: site.contact.phoneLabel,
        areaServed: "Worldwide",
        availableLanguage: ["English", "Chinese"],
      },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.domain,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.domain}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
        }
