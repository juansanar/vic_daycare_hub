export function normalizeIslandHealthName(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Compare facility names between the BC registry and Island Health, which often
 * differ in punctuation, spacing, and suffixes (e.g. "Elementary" vs "Elementary School").
 */
export function islandHealthNamesMatch(a: string, b: string): boolean {
  const na = normalizeIslandHealthName(a);
  const nb = normalizeIslandHealthName(b);
  if (na === nb) return true;
  if (na.length < 12 || nb.length < 12) return false;

  const [shorter, longer] = na.length <= nb.length ? [na, nb] : [nb, na];
  return longer.startsWith(shorter);
}
