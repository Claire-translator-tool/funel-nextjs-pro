export type SeoFaq = { question: string; answer: string };

export type ProductSeoPage = {
  slug: string;
  productSlug: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  keywords: string[];
  buyerAnswer: string;
  bestFor: string[];
  selectionTips: string[];
  faq: SeoFaq[];
};

export const productSeoPages: ProductSeoPage[] = [
  {
    slug: "online-dissolved-oxygen-analyzer",
    productSlug: "pfdo-800-dissolved-oxygen-analyzer",
    title: "Online Dissolved Oxygen Analyzer for Wastewater and Aquaculture",
    description: "Online dissolved oxygen analyzer for aeration tanks, wastewater treatment, aquaculture and industrial water monitoring.",
    h1: "Online Dissolved Oxygen Analyzer for Continuous Water Monitoring",
    eyebrow: "Dissolved Oxygen Analyzer",
    keywords: ["online dissolved oxygen analyzer", "DO sensor for wastewater"],
    buyerAnswer: "An online dissolved oxygen analyzer continuously measures DO in water.",
    bestFor: ["Municipal wastewater aeration tanks"],
    selectionTips: ["Confirm water type"],
    faq: [{ question: "What is an online dissolved oxygen analyzer?", answer: "It measures DO continuously." }]
  }
];
