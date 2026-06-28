import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { uploadPublicImage } from "@/lib/supabase-storage";
import type { ImportedMedia, ProductImportRow } from "@/lib/funelImport/types";
import { safeSlug } from "@/lib/funelImport/text";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

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

async function listDirsRecursive(dir: string): Promise<string[]> {
  if (!(await exists(dir))) {
    return [];
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const dirs: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      dirs.push(fullPath);
      dirs.push(...(await listDirsRecursive(fullPath)));
    }
  }

  return dirs;
}

function scoreImage(filePath: string) {
  const lower = filePath.toLowerCase();
  let score = 0;

  if (lower.includes(`${path.sep}images${path.sep}`)) score += 30;
  if (lower.includes("main")) score += 30;
  if (lower.includes("white-background")) score += 25;
  if (lower.includes("hero")) score += 20;
  if (lower.includes("45-degree") || lower.includes("angle")) score += 10;
  if (lower.includes("installation")) score -= 5;
  if (lower.includes("datasheet") || lower.includes(`${path.sep}docs${path.sep}`)) score -= 100;

  return score;
}

function detectImageType(filePath: string): "main" | "gallery" | "datasheet" | "document" {
  const lower = filePath.toLowerCase();

  if (lower.includes("datasheet") || lower.includes(`${path.sep}docs${path.sep}`)) {
    return "datasheet";
  }

  if (lower.includes("main") || lower.includes("white-background") || lower.includes("hero")) {
    return "main";
  }

  return "gallery";
}

async function findProductDir(extractRoot: string, product: ProductImportRow) {
  const directCandidates = [
    path.join(extractRoot, "products", product.model.toLowerCase()),
    path.join(extractRoot, "products", product.slug.toLowerCase()),
    path.join(extractRoot, "products", safeSlug(product.model)),
  ];

  for (const candidate of directCandidates) {
    if (await exists(candidate)) {
      return candidate;
    }
  }

  const dirs = await listDirsRecursive(extractRoot);
  const needles = [product.model, product.slug, safeSlug(product.model)]
    .map((item) => item.toLowerCase())
    .filter(Boolean);

  return (
    dirs.find((dir) => needles.includes(path.basename(dir).toLowerCase())) ||
    dirs.find((dir) => needles.some((needle) => path.basename(dir).toLowerCase().includes(needle))) ||
    null
  );
}

async function toWebpBuffer(filePath: string) {
  return sharp(filePath)
    .rotate()
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

export async function processAndUploadProductImages(params: {
  extractRoot: string;
  product: ProductImportRow;
}): Promise<ImportedMedia> {
  const { extractRoot, product } = params;
  const productDir = await findProductDir(extractRoot, product);
  if (!productDir) {
    return { mainImageUrl: "/images/industrial-water-quality-analyzers.png", uploadedImages: [] };
  }

  const allFiles = await listFilesRecursive(productDir);
  const imageFiles = allFiles.filter((filePath) => IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()));

  if (!imageFiles.length) {
    return { mainImageUrl: "/images/industrial-water-quality-analyzers.png", uploadedImages: [] };
  }

  const sorted = imageFiles.sort((a, b) => scoreImage(b) - scoreImage(a));
  const selected = sorted.slice(0, 6);
  const uploadedImages: ImportedMedia["uploadedImages"] = [];

  for (let index = 0; index < selected.length; index += 1) {
    const filePath = selected[index];
    const type = detectImageType(filePath);

    if (type === "datasheet") {
      continue;
    }

    try {
      const outputName = `${product.slug}-${index + 1}.webp`;
      const storagePath = `products/${product.slug}/${outputName}`;
      const webpBuffer = await toWebpBuffer(filePath);
      const uploadFile = new File([webpBuffer as unknown as BlobPart], outputName, {
        type: "image/webp",
      });
      const url = await uploadPublicImage({ file: uploadFile, path: storagePath });

      uploadedImages.push({
        type: index === 0 ? "main" : type,
        url,
        path: storagePath,
        alt: `${product.productName} ${product.model}`.trim(),
      });
    } catch (error) {
      console.error(`Product image import failed for ${product.slug}`, error);
    }
  }

  return {
    mainImageUrl: uploadedImages[0]?.url || "/images/industrial-water-quality-analyzers.png",
    uploadedImages,
  };
                        }
