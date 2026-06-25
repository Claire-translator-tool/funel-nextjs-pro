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
