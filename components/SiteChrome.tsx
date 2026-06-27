"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/app/site-settings";
import { whatsappLink } from "@/app/site-settings";

type SiteChromeProps = {
  site: SiteSettings;
  children: ReactNode;
};

function PublicHeader({ site, showTop = true }: { site: SiteSettings; showTop?: boolean }) {
  return (
    <>
      {showTop ? (
        <div className="top">
          <div className="container">
            <span>FUNEL® Industrial Water Monitoring & Automation</span>
            <span>
              WhatsApp: {site.contact_whatsapp} · Email: {site.contact_email}
            </span>
          </div>
        </div>
      ) : null}
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
            <div className="lang skiptranslate">
              <select
                id="lang-select"
                className="bg-transparent border-none outline-none cursor-pointer font-bold text-sm"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="pt">Português</option>
                <option value="ru">Русский</option>
                <option value="ar">العربية</option>
                <option value="vi">Tiếng Việt</option>
                <option value="th">ไทย</option>
                <option value="zh-CN">中文</option>
              </select>
            </div>
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

function PublicFooter({ site }: { site: SiteSettings }) {
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

export default function SiteChrome({ site, children }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        <PublicHeader site={site} showTop={false} />
        {children}
      </>
    );
  }

  return (
    <>
      <PublicHeader site={site} />
      {children}
      <PublicFooter site={site} />
      <div className="float">
        <a href={whatsappLink(site.contact_whatsapp)}>WhatsApp</a>
        <a href={`mailto:${site.contact_email}`}>Email</a>
      </div>
    </>
  );
}
