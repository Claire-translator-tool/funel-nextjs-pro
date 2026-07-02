import { supabaseRest } from "@/lib/supabase";
import type { CmsProduct } from "@/lib/types";
import type {
  FaqImportRow,
  ProductImportRow,
  SpecificationImportRow,
} from "@/lib/funelImport/types";
import { splitLines } from "@/lib/funelImport/text";

type UpsertParams = {
  product: ProductImportRow;
  specifications: SpecificationImportRow[];
  faqs: FaqImportRow[];
  imageUrl: string;
  published: boolean;
  adminToken?: string;
};

function buildSpecs(product: ProductImportRow, specifications: SpecificationImportRow[]) {
  const fromSheet = specifications.map((item) => `${item.item}: ${item.value}`);
  const fromProduct = splitLines(product.specifications);
  const result = fromSheet.length ? fromSheet : fromProduct;

  return result.length ? result : ["Technical configuration available on request"];
}

function buildApplications(product: ProductImportRow) {
  const applications = splitLines(product.applications);
  const industries = splitLines(product.industries);
  const result = [...applications, ...industries.map((item) => `${item} applications`)];

  return [...new Set(result)].slice(0, 16);
}

function buildBenefits(product: ProductImportRow) {
  const features = splitLines(product.features);

  if (features.length) {
    return features.slice(0, 16);
  }

  return [
    "Suitable for online water quality monitoring projects",
    "Supports engineering configuration and quotation support",
    "Available for OEM, system integrator and project supply",
  ];
}

function buildSeoTitle(product: ProductImportRow) {
  return product.seoTitle || `${product.productName} ${product.model} | FUNEL`;
}

function buildSeoDescription(product: ProductImportRow) {
  return (
    product.seoDescription ||
    product.shortDescription ||
    `${product.productName} ${product.model} for online water quality monitoring. Request datasheet, configuration and quotation from FUNEL.`
  ).slice(0, 300);
}

function buildKeywords(product: ProductImportRow) {
  const keywords = splitLines(product.seoKeywords);

  if (keywords.length) {
    return keywords;
  }

  return [
    product.productName,
    product.model,
    product.category,
    product.parameter,
    "online water quality analyzer",
    "FUNEL water quality sensor",
  ].filter(Boolean);
}

export async function upsertImportedProduct(params: UpsertParams): Promise<"created" | "updated"> {
  const { product, specifications, imageUrl, published, adminToken } = params;
  const payload: Partial<CmsProduct> = {
    slug: product.slug,
    model: product.model,
    name: product.productName,
    category: product.category,
    summary: product.shortDescription || buildSeoDescription(product),
    specs: buildSpecs(product, specifications),
    applications: buildApplications(product),
    benefits: buildBenefits(product),
    image_url: imageUrl || "/images/industrial-water-quality-analyzers.png",
    seo_title: buildSeoTitle(product),
    seo_description: buildSeoDescription(product),
    seo_keywords: buildKeywords(product),
    published,
  };

  const existing = await supabaseRest<Array<Pick<CmsProduct, "id" | "slug" | "published">>>(
    `products?slug=eq.${encodeURIComponent(product.slug)}&select=id,slug,published&limit=1`,
    { token: adminToken }
  );

  if (existing[0]?.id) {
    const updatePayload = {
      ...payload,
      // Importing as draft should not accidentally unpublish an existing public product.
      published: published ? true : existing[0].published ?? false,
    };

    await supabaseRest(`products?id=eq.${encodeURIComponent(existing[0].id)}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: updatePayload,
      token: adminToken,
    });
    return "updated";
  }

  await supabaseRest("products", {
    method: "POST",
    prefer: "return=representation",
    body: payload,
    token: adminToken,
  });

  return "created";
}
