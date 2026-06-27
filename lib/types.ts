export type AdminUser = {
  email: string;
};

export type CmsProduct = {
  id?: string;
  name: string;
  slug: string;
  model?: string | null;
  category?: string | null;
  summary?: string | null;
  image_url?: string | null;
  specs?: string[] | null;
  applications?: string[] | null;
  benefits?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  published?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type CmsCaseStudy = {
  id?: string;
  title: string;
  industry: string;
  product_slug?: string | null;
  summary?: string | null;
  result: string;
  image_url?: string | null;
  published?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type LeadStatus = "new" | "in_progress" | "won";

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  country?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  product_interest?: string | null;
  quantity?: string | null;
  message?: string | null;
  source_page?: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at?: string | null;
};

export type InquiryNote = {
  id: string;
  inquiry_id: string;
  note: string;
  created_by?: string | null;
  created_at: string;
};

export type CmsPage = {
  id?: string;
  slug: string;
  title: string;
  blocks?: Record<string, unknown> | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type SiteSetting = {
  key: string;
  value: string;
};
