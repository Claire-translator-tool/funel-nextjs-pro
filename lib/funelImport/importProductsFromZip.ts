import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import AdmZip from "adm-zip";
import {
  findRelatedFaqs,
  findRelatedSpecs,
  parseFunelProductWorkbook,
} from "@/lib/funelImport/excel";
import { processAndUploadProductImages } from "@/lib/funelImport/media";
import { upsertImportedProduct } from "@/lib/funelImport/productStore";
import type { ProductImportSummary } from "@/lib/funelImport/types";

async function exists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  if (!(await exists(dir))) {
    return [];
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function extractZip(zipPath: string, extractDir: string) {
  await fs.mkdir(extractDir, { recursive: true });
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractDir, true);
}

async function findPackageRoot(extractDir: string) {
  const files = await listFilesRecursive(extractDir);
  const xlsx = files.find((file) => file.toLowerCase().endsWith(".xlsx"));

  if (!xlsx) {
    return extractDir;
  }

  let current = path.dirname(xlsx);

  while (current !== extractDir && path.basename(current).toLowerCase() !== "database") {
    current = path.dirname(current);
  }

  return path.basename(current).toLowerCase() === "database" ? path.dirname(current) : extractDir;
}

async function findFirstXlsx(packageRoot: string) {
  const files = await listFilesRecursive(packageRoot);
  return files.find((file) => file.toLowerCase().endsWith(".xlsx")) || null;
}

export async function importProductsFromZip(params: {
  zipPath: string;
  publishMode: "draft" | "published";
}): Promise<ProductImportSummary> {
  const extractDir = path.join(os.tmpdir(), `funel-product-import-${Date.now()}`);
  const summary: ProductImportSummary = {
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
    skipped: 0,
    logs: [],
  };

  try {
    await extractZip(params.zipPath, extractDir);
    const packageRoot = await findPackageRoot(extractDir);
    const xlsxPath = await findFirstXlsx(packageRoot);

    if (!xlsxPath) {
      throw new Error("No .xlsx product database found in the ZIP package.");
    }

    const { products, specifications, faqs } = parseFunelProductWorkbook(xlsxPath);
    summary.total = products.length;

    for (const product of products) {
      try {
        const productSpecs = findRelatedSpecs(product, specifications);
        const productFaqs = findRelatedFaqs(product, faqs);
        const media = await processAndUploadProductImages({ extractRoot: packageRoot, product });
        const result = await upsertImportedProduct({
          product,
          specifications: productSpecs,
          faqs: productFaqs,
          imageUrl: media.mainImageUrl,
          published: params.publishMode === "published",
        });

        summary[result] += 1;
        summary.logs.push({
          slug: product.slug,
          model: product.model,
          productName: product.productName,
          status: result,
          message:
            result === "created"
              ? "Product created successfully. Sitemap will include it after publish."
              : "Existing product updated by slug.",
          imageUrl: media.mainImageUrl,
        });
      } catch (error) {
        summary.failed += 1;
        summary.logs.push({
          slug: product.slug,
          model: product.model,
          productName: product.productName,
          status: "failed",
          message: error instanceof Error ? error.message : "Unknown product import error.",
        });
      }
    }
  } finally {
    await fs.rm(extractDir, { recursive: true, force: true });
  }

  return summary;
    }
