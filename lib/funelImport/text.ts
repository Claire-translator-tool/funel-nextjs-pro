export function cleanText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function splitLines(value: unknown): string[] {
  const text = cleanText(value);

  if (!text) {
    return [];
  }

  return text
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function safeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 120);
}

export function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_\-]+/g, "");
}

export function pickField(row: Record<string, unknown>, aliases: string[]) {
  const normalized = new Map<string, unknown>();

  for (const [key, value] of Object.entries(row)) {
    normalized.set(normalizeKey(key), value);
  }

  for (const alias of aliases) {
    const value = normalized.get(normalizeKey(alias));

    if (value !== undefined && value !== null && String(value).trim()) {
      return cleanText(value);
    }
  }

  return "";
}
