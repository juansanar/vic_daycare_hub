export const CRD_ISLAND_HEALTH_MUNICIPALITIES = [
  "Central Saanich (District)",
  "Colwood (City)",
  "Esquimalt (Township)",
  "Highlands",
  "Highlands (District)",
  "Juan de Fuca",
  "Langford (City)",
  "Metchosin (District)",
  "North Saanich (District)",
  "Oak Bay (District)",
  "Saanich (District)",
  "Sidney (Town)",
  "Sooke (District)",
  "Unincorporated Highlands",
  "Victoria (City)",
  "View Royal (Town)",
  "No Municipality",
] as const;

export function cleanIslandHealthUnicode(s: string): string {
  return String(s || "")
    .replace(/â€™/g, "'")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[Ƚƚ]/g, "l")
    .replace(/[Ŧŧ]/g, "t")
    .replace(/[Ⱥ]/g, "a")
    .replace(/[ǝ]/g, "e")
    .replace(/[ʷ]/g, "w");
}

export function normalizeIslandHealthName(s: string): string {
  return cleanIslandHealthUnicode(s)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\boosc\b/g, "outofschoolcare")
    .replace(/\bosc\b/g, "outofschoolcare")
    .replace(/\bcentre\b/g, "center")
    .replace(/\bchild care\b/g, "childcare")
    .replace(/\bday care\b/g, "daycare")
    .replace(/\bincorportated\b/g, "incorporated")
    .replace(/[^a-z0-9]/g, "");
}

export function extractStreetNumber(address: string): string {
  const s = String(address || "")
    .trim()
    .replace(/^\d+\s*&\s*\d+\s*-\s*/, "")
    .replace(/^[a-z0-9]+\s*-\s*/i, "")
    .replace(/^\d+\s+(?=\d{3,}\s)/, "")
    .replace(/^#\s*[a-z0-9]+\s+/i, "")
    .replace(/^(unit|suite|ste|apt)\s*[a-z0-9]+\s*,?\s*/i, "");
  const m = s.match(/^(\d+)/);
  return m ? m[1] : "";
}

export function normalizeStreetAddress(address: string, stripSuffix = false): string {
  let s = String(address || "")
    .toLowerCase()
    .trim()
    .replace(/^\d+\s*&\s*\d+\s*-\s*/, "")
    .replace(/^[a-z0-9]+\s*-\s*/i, "")
    .replace(/^\d+\s+(?=\d{3,}\s)/, "")
    .replace(/^#\s*[a-z0-9]+\s+/i, "")
    .replace(/\b(unit|suite|ste|apt)\s*[a-z0-9-]+\b/g, "")
    .replace(/\bstreet\b/g, "st")
    .replace(/\broad\b/g, "rd")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bdrive\b/g, "dr")
    .replace(/\bplace\b/g, "pl")
    .replace(/\bcrescent\b/g, "cres")
    .replace(/\bterrace\b/g, "terr")
    .replace(/\bparkway\b/g, "pkwy")
    .replace(/\bpky\b/g, "pkwy")
    .replace(/\bboulevard\b/g, "blvd")
    .replace(/\blane\b/g, "ln")
    .replace(/\bcourt\b/g, "ct")
    .replace(/\bcircle\b/g, "cir")
    .replace(/\bhighway\b/g, "hwy");

  if (stripSuffix) {
    s = s.replace(/\b(st|rd|ave|dr|pl|cres|terr|pkwy|blvd|ln|ct|cir|hwy|way)\.?$/i, "");
  }

  return s.replace(/[^a-z0-9]/g, "");
}

export function isChildCarePermit(record: {
  permitType?: unknown;
  ServiceType?: unknown;
  inspectionType?: unknown;
}): boolean {
  const pt = JSON.stringify(record.permitType || "");
  const st = String(record.ServiceType || "");
  const it = String(record.inspectionType || "");
  if (/Residential Care/i.test(pt) || /Residential Care/i.test(it)) {
    return false;
  }
  if (
    /100 Hospital Act|Long Term Care|Mental Health|Substance Use|Hospice|Acquired Injury|Community Living/i.test(
      st,
    )
  ) {
    return false;
  }
  return true;
}

/**
 * Compare facility names between the BC registry and Island Health, which often
 * differ in punctuation, spacing, and suffixes (e.g. "Elementary" vs "Elementary School").
 */
export function islandHealthNamesMatch(a: string, b: string): boolean {
  const na = normalizeIslandHealthName(a);
  const nb = normalizeIslandHealthName(b);
  if (na === nb) return true;
  if (na.length < 10 || nb.length < 10) return false;

  const [shorter, longer] = na.length <= nb.length ? [na, nb] : [nb, na];
  return longer.startsWith(shorter);
}
