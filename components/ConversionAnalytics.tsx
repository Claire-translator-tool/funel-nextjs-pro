"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

function safePath(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    return `${url.pathname}${url.search}`.slice(0, 240);
  } catch {
    return href.slice(0, 240);
  }
}

export default function ConversionAnalytics() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      const href = target?.getAttribute("href") || "";
      if (!href) return;

      let eventName = "";
      if (href.includes("wa.me")) eventName = "whatsapp_click";
      else if (href.startsWith("mailto:")) eventName = "email_click";
      else if (href.startsWith("tel:")) eventName = "phone_click";
      else if (safePath(href).startsWith("/contact")) eventName = "quote_cta_click";
      else if (safePath(href).startsWith("/products/")) eventName = "product_detail_click";

      if (eventName) {
        track(eventName, {
          destination: safePath(href),
          page: window.location.pathname,
        });
      }
    };

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (form?.action.includes("/api/contact")) {
        track("inquiry_form_submit", { page: window.location.pathname });
      }
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  return null;
}
