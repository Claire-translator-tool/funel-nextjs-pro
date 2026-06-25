export type ProductImportRow = {
  slug: string;
  productName: string;
  model: string;
  category: string;
  parameter: string;
  shortDescription: string;
  features: string;
  specifications: string;
  applications: string;
  industries: string;
  relatedProducts: string;
  relatedProjects: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  faq: string;
};

export type SpecificationImportRow = {
  model: string;
  slug: string;
  item: string;
  value: string;
};

export type FaqImportRow = {
  model: string;
  slug: string;
  question: string;
  answer: string;
};

export type ImportedMedia = {
  mainImageUrl: string;
  uploadedImages: Array<{
    type: "main" | "gallery" | "datasheet" | "document";
    url: string;
    path: string;
    alt: string;
  }>;
};

export type ProductImportLog = {
  slug: string;
  model: string;
  productName: string;
  status: "created" | "updated" | "failed" | "skipped";
  message: string;
  imageUrl?: string;
};

export type ProductImportSummary = {
  total: number;
  created: number;
  updated: number;
  failed: number;
  skipped: number;
  logs: ProductImportLog[];
};
