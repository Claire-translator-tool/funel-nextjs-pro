import * as XLSX from "xlsx";
import type {
  FaqImportRow,
  ProductImportRow,
  SpecificationImportRow,
} from "@/lib/funelImport/types";
import { cleanText, pickField, safeSlug } from "@/lib/funelImport/text";

function getSheet(workbook: XLSX.WorkBook, names: string[]) {
  const sheetName = workbook.SheetNames.find((name) =>
    names.some((expected) => name.trim().toLowerCase() === expected.toLowerCase())
  );

  return sheetName ? workbook.Sheets[sheetName] : undefined;
}

function sheetToRows(sheet?: XLSX.WorkSheet) {
  if (!sheet) {
    return [] as Record<string, unknown>[];
  }

  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
}

function normalizeProductRow(row: Record<string, unknown>, rowNumber: number): ProductImportRow {
  const productName = pickField(row, ["productName", "product name", "name", "title"]);
  const model = pickField(row, ["model", "model number", "sku"]);
  const rawSlug = pickField(row, ["slug", "url slug", "path"]);
  const slug = rawSlug || safeSlug(`${productName}-${model}`);

  if (!productName) {
    throw new Error(`Products sheet row ${rowNumber}: productName/name is required.`);
  }

  if (!slug) {
    throw new Error(`Products sheet row ${rowNumber}: slug is required or must be generated from name/model.`);
  }

  return {
    slug,
    productName,
    model,
    category: pickField(row, ["category", "product category"]) || "Water Quality Analyzer",
    parameter: pickField(row, ["parameter", "parameter type"]),
    shortDescription: pickField(row, ["shortDescription", "short description", "summary", "description"]),
    features: pickField(row, ["features", "benefits", "selling points"]),
    specifications: pickField(row, ["specifications", "specs", "technical specifications"]),
    applications: pickField(row, ["applications", "application"]),
    industries: pickField(row, ["industries", "industry"]),
    relatedProducts: pickField(row, ["relatedProducts", "related products"]),
    relatedProjects: pickField(row, ["relatedProjects", "related projects"]),
    seoTitle: pickField(row, ["seoTitle", "SEO title", "meta title"]),
    seoDescription: pickField(row, ["seoDescription", "SEO description", "meta description"]),
    seoKeywords: pickField(row, ["seoKeywords", "SEO keywords", "keywords"]),
    faq: pickField(row, ["faq", "FAQs"]),
  };
}

function normalizeSpecRow(row: Record<string, unknown>): SpecificationImportRow | null {
  const slug = pickField(row, ["slug", "product slug"]);
  const model = pickField(row, ["model", "model number", "sku"]);
  const item = pickField(row, ["item", "name", "parameter", "specification"]);
  const value = pickField(row, ["value", "spec value", "description"]);

  if (!item || !value || (!slug && !model)) {
    return null;
  }

  return { slug, model, item, value };
}

function normalizeFaqRow(row: Record<string, unknown>): FaqImportRow | null {
  const slug = pickField(row, ["slug", "product slug"]);
  const model = pickField(row, ["model", "model number", "sku"]);
  const question = pickField(row, ["question", "q"]);
  const answer = pickField(row, ["answer", "a"]);

  if (!question || !answer || (!slug && !model)) {
    return null;
  }

  return { slug, model, question, answer };
}

export function parseFunelProductWorkbook(xlsxPath: string) {
  const workbook = XLSX.readFile(xlsxPath);
  const productRows = sheetToRows(getSheet(workbook, ["Products", "Product"]));

  if (!productRows.length) {
    throw new Error("No Products sheet or product rows found in the Excel file.");
  }

  const products = productRows.map((row, index) => normalizeProductRow(row, index + 2));
  const specifications = sheetToRows(getSheet(workbook, ["Specifications", "Specs"]))
    .map(normalizeSpecRow)
    .filter((row): row is SpecificationImportRow => Boolean(row));
  const faqs = sheetToRows(getSheet(workbook, ["FAQ", "FAQs"]))
    .map(normalizeFaqRow)
    .filter((row): row is FaqImportRow => Boolean(row));

  return { products, specifications, faqs };
}

export function findRelatedSpecs(
  product: ProductImportRow,
  specs: SpecificationImportRow[]
) {
  return specs.filter(
    (spec) =>
      cleanText(spec.slug) === product.slug ||
      cleanText(spec.model).toLowerCase() === product.model.toLowerCase()
  );
}

export function findRelatedFaqs(product: ProductImportRow, faqs: FaqImportRow[]) {
  return faqs.filter(
    (faq) =>
      cleanText(faq.slug) === product.slug ||
      cleanText(faq.model).toLowerCase() === product.model.toLowerCase()
  );
    }
