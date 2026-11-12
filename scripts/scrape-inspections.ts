/**
 * Scrapes Island Health inspection data for child care facilities, and discovers
 * newly licensed CRD child care facilities not yet present in the BC ArcGIS feed.
 *
 * Strategy:
 * 1. Query the Island Health JSON API per CRD Municipality to discover all CCFL
 *    child care facilities with permitIDs (avoiding the 225-record unfiltered cap)
 * 2. Match discovered facilities to our facilities.json using multi-pass address + name matching
 * 3. Geocode and ingest any brand-new CRD child care facilities from Island Health
 *    into data/island-health-facilities.json and data/facilities.json
 * 4. For each matched facility with new/unfetched inspections, fetch its facility page
 *    and contravention details
 * 5. Write data/inspections.json and update data/meta.json if data changed
 *
 * Run with: npm run scrape-inspections
 */

import { parse } from "node-html-parser";
import { writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CRD_ISLAND_HEALTH_MUNICIPALITIES,
  cleanIslandHealthUnicode,
  extractStreetNumber,
  isChildCarePermit,
  islandHealthNamesMatch,
  normalizeIslandHealthName,
  normalizeStreetAddress,
} from "./lib/island-health-names.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../data");

const BASE_URL = "https://inspections.myhealthdepartment.com";
const FACILITY_PAGE_URL = (permitID: string) =>
  `${BASE_URL}/island-health/ccfl-facility/?permitID=${permitID}`;
const INSPECTION_PAGE_URL = (inspectionID: string) =>
  `${BASE_URL}/island-health/program-ccfl/inspection/?inspectionID=${inspectionID}`;

const PAGE_SIZE = 25;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function sleepJitter(minMs = 600, maxMs = 1200) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((r) => setTimeout(r, ms));
}

type CRDRegion = "core" | "westshore" | "peninsula" | "other";

interface OurFacility {
  id: string;
  name: string;
  address: string;
  locality: string;
  postalCode: string;
  municipality: string;
  region: CRDRegion;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  website: string;
  serviceType: string;
  ageGroups: string[];
  vacancyInd: string;
  vacancyForLicense: string;
  vacancyLastUpdated: string;
  isTenDollarDay: boolean;
  isCcfri: boolean;
  vacancyUnder36: boolean;
  vacancy30mos5yrs: boolean;
  vacancyLicpre: boolean;
  vacancyOosGr1Age12: boolean;
}

interface APIFacility {
  permitID: string;
  establishmentName: string;
  permitName: string;
  addressLine1: string;
  city: string;
  Municipality?: string;
  zip: string;
  WorkPhone?: string;
  inspectionID: string;
  inspectionDate: string;
  purpose: string;
  ServiceType?: string;
  permitType?: unknown;
  inspectionType?: string;
}

interface Contravention {
  code: string;
  description: string;
  observations: string;
  correctByDate: string;
  corrected: boolean;
  correctiveActions?: string;
}

interface InspectionDetail {
  id: string;
  date: string;
  type: string;
  contraventions: Contravention[];
}

interface InspectionRecord {
  facilityId: string;
  permitID: string;
  inspectionUrl: string;
  serviceType?: string;
  inspections: InspectionDetail[];
  allFetched?: boolean;
}

const MUNICIPALITY_TO_REGION: Record<string, CRDRegion> = {
  Victoria: "core",
  Saanich: "core",
  "Oak Bay": "core",
  Esquimalt: "core",
  "View Royal": "core",
  Langford: "westshore",
  Colwood: "westshore",
  Metchosin: "westshore",
  Highlands: "westshore",
  Sooke: "westshore",
  Sidney: "peninsula",
  "North Saanich": "peninsula",
  "Central Saanich": "peninsula",
};

function mapIslandHealthMunicipality(ihMuni: string, city: string): string {
  const m = (ihMuni || "").toLowerCase();
  if (m.includes("central saanich")) return "Central Saanich";
  if (m.includes("north saanich")) return "North Saanich";
  if (m.includes("saanich")) return "Saanich";
  if (m.includes("victoria")) return "Victoria";
  if (m.includes("oak bay")) return "Oak Bay";
  if (m.includes("esquimalt")) return "Esquimalt";
  if (m.includes("view royal")) return "View Royal";
  if (m.includes("langford")) return "Langford";
  if (m.includes("colwood")) return "Colwood";
  if (m.includes("metchosin")) return "Metchosin";
  if (m.includes("highlands")) return "Highlands";
  if (m.includes("sooke") || m.includes("juan de fuca")) return "Sooke";
  if (m.includes("sidney")) return "Sidney";

  const c = (city || "").toLowerCase();
  if (c.includes("saanichton") || c.includes("brentwood")) return "Central Saanich";
  if (c.includes("north saanich")) return "North Saanich";
  if (c.includes("saanich")) return "Saanich";
  if (c.includes("oak bay")) return "Oak Bay";
  if (c.includes("esquimalt")) return "Esquimalt";
  if (c.includes("view royal")) return "View Royal";
  if (c.includes("langford")) return "Langford";
  if (c.includes("colwood")) return "Colwood";
  if (c.includes("metchosin")) return "Metchosin";
  if (c.includes("highlands")) return "Highlands";
  if (c.includes("sooke")) return "Sooke";
  if (c.includes("sidney")) return "Sidney";
  return "Victoria";
}

function parseIslandHealthServiceTypes(rawServiceType: string): {
  serviceType: string;
  ageGroups: string[];
} {
  const s = (rawServiceType || "").toLowerCase();
  const ageGroups = new Set<string>();
  if (s.includes("301") || s.includes("under 36") || s.includes("multi")) {
    ageGroups.add("under36");
  }
  if (s.includes("302") || s.includes("30 months") || s.includes("multi")) {
    ageGroups.add("preschool30to5");
  }
  if (s.includes("303") || s.includes("preschool")) {
    ageGroups.add("licensedPreschool");
  }
  if (s.includes("305") || s.includes("312") || s.includes("school age")) {
    ageGroups.add("schoolAge");
  }

  let serviceType = "Licensed Group";
  if (s.includes("304") || s.includes("family child care")) {
    serviceType = "Licensed Family";
    if (ageGroups.size === 0) {
      ageGroups.add("under36");
      ageGroups.add("preschool30to5");
    }
  } else if (s.includes("310") || s.includes("311") || s.includes("multi")) {
    serviceType = "Licensed Multi-Age";
  } else if (s.includes("303") && !s.includes("301") && !s.includes("302")) {
    serviceType = "Licensed Preschool";
  }

  return {
    serviceType,
    ageGroups: Array.from(ageGroups),
  };
}

function formatPhone(rawPhone?: string): string {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return rawPhone || "";
}

async function geocodeBCAddress(
  address: string,
  city: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, ${city || "Victoria"}, BC`);
    const url = `https://geocoder.api.gov.bc.ca/addresses.json?addressString=${query}&maxResults=1&outputSRS=4326`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const coords = data?.features?.[0]?.geometry?.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      const [lng, lat] = coords;
      if (typeof lat === "number" && typeof lng === "number" && lat !== 0 && lng !== 0) {
        return { lat, lng };
      }
    }
  } catch (err) {
    console.warn(`  Geocoding failed for "${address}, ${city}":`, err);
  }
  return null;
}

async function fetchJson(body: object): Promise<unknown> {
  const maxRetries = 3;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const res = await fetch(`${BASE_URL}/`, {
        method: "POST",
        headers: {
          ...BROWSER_HEADERS,
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: BASE_URL,
          Referer: `${BASE_URL}/island-health/program-ccfl`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 403 || res.status >= 500 || res.status === 429) {
        attempt++;
        if (attempt >= maxRetries) {
          console.warn(`  API returned ${res.status} after ${maxRetries} attempts`);
          return null;
        }
        const waitMs = res.status === 403 ? attempt * 15000 : attempt * 3000;
        console.warn(
          `  API returned ${res.status}. Retrying in ${waitMs / 1000}s (attempt ${attempt}/${maxRetries})...`,
        );
        await sleep(waitMs);
        continue;
      }
      if (!res.ok) {
        console.warn(`  API returned ${res.status}`);
        return null;
      }
      const text = await res.text();
      if (text.trim().startsWith("<")) {
        attempt++;
        if (attempt >= maxRetries) {
          console.warn(`  API returned HTML instead of JSON after ${maxRetries} attempts`);
          return null;
        }
        await sleep(attempt * 15000);
        continue;
      }
      return JSON.parse(text);
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) {
        console.warn(`  fetchJson error:`, err);
        return null;
      }
      await sleep(attempt * 2000);
    }
  }
  return null;
}

async function fetchHtml(url: string): Promise<string | null> {
  const maxRetries = 3;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const res = await fetch(url, {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout(12000),
      });
      if (res.status === 403) {
        attempt++;
        if (attempt >= maxRetries) {
          console.warn(`  HTTP 403 (Forbidden) on ${url} - max retries reached.`);
          return null;
        }
        const waitTime = attempt * 30000;
        console.warn(
          `  HTTP 403 (Forbidden) on ${url}. Rate limit hit. Pausing for ${waitTime / 1000}s before retry (attempt ${attempt}/${maxRetries - 1})...`,
        );
        await sleep(waitTime);
        continue;
      }
      if (!res.ok) {
        console.warn(`  HTTP ${res.status} for ${url}`);
        return null;
      }
      return await res.text();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) {
        console.warn(`  Fetch error for ${url}:`, err);
        return null;
      }
      console.warn(
        `  Network error/timeout fetching ${url}. Retrying in 2s (attempt ${attempt}/${maxRetries - 1})...`,
      );
      await sleep(2000);
    }
  }
  return null;
}

async function discoverAllFacilities(): Promise<APIFacility[]> {
  console.log("Discovering CRD child care facilities via Island Health API (by municipality)...");
  const byPermit = new Map<string, APIFacility>();

  for (const muni of CRD_ISLAND_HEALTH_MUNICIPALITIES) {
    let start = 0;
    let muniCount = 0;
    while (start <= 200) {
      const result = await fetchJson({
        data: {
          path: "island-health",
          programName: "ccfl",
          filters: { Municipality: muni },
          start,
          count: PAGE_SIZE,
          searchQueryOverride: null,
          searchStr: "",
          lat: 0,
          lng: 0,
          sort: {},
        },
        task: "searchInspections",
      });

      if (!Array.isArray(result) || result.length === 0) {
        break;
      }

      for (const rec of result as APIFacility[]) {
        if (muni === "No Municipality") {
          const city = (rec.city || "").toLowerCase();
          const zip = (rec.zip || "").toUpperCase();
          if (
            !/victoria|saanich|oak bay|esquimalt|view royal|langford|colwood|metchosin|highlands|sooke|sidney|brentwood/i.test(
              city,
            ) &&
            !/^V8[LMNPRSTVWXYZ]|^V9[ABCEZ]/.test(zip)
          ) {
            continue;
          }
        }
        if (!isChildCarePermit(rec)) {
          continue;
        }
        if (!byPermit.has(rec.permitID)) {
          byPermit.set(rec.permitID, rec);
          muniCount++;
        }
      }

      if (result.length < PAGE_SIZE) {
        break;
      }
      start += PAGE_SIZE;
      await sleepJitter(250, 500);
    }
    if (muniCount > 0) {
      console.log(`  ${muni.padEnd(28)}: +${muniCount} child care permits`);
    }
    await sleepJitter(200, 400);
  }

  const unique = Array.from(byPermit.values());
  console.log(`  Discovered ${unique.length} unique CRD child care permits`);
  return unique;
}

function parseInspectionDate(dateStr: string): string {
  const months: Record<string, string> = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  };
  const match = dateStr.match(/(\d{1,2})-(\w{3})-(\d{4})/);
  if (match) {
    const m = months[match[2].toLowerCase()];
    if (m) return `${match[3]}-${m}-${match[1].padStart(2, "0")}`;
  }
  return dateStr;
}

async function fetchFacilityInspections(
  permitID: string,
): Promise<{ type: string; date: string; inspectionID: string }[] | null> {
  const html = await fetchHtml(FACILITY_PAGE_URL(permitID));
  if (!html) return null;

  const root = parse(html);
  const inspections: { type: string; date: string; inspectionID: string }[] = [];

  const rows = root.querySelectorAll(".section---establishment-list .w-row");
  for (const row of rows) {
    const link = row.querySelector('a[href*="inspectionID="]');
    if (!link) continue;

    const href = link.getAttribute("href") ?? "";
    const idMatch = href.match(/inspectionID=([A-F0-9-]+)/i);
    if (!idMatch) continue;

    const inspectionID = idMatch[1];
    const type = link.textContent.trim().replace(" Inspection", "");

    const cols = row.querySelectorAll(".w-col");
    const dateCol = cols[1];
    const dateText = dateCol?.querySelector("p")?.textContent.trim() ?? "";
    const date = parseInspectionDate(dateText);

    inspections.push({ type, date, inspectionID });
  }

  return inspections;
}

async function fetchContraventions(inspectionID: string): Promise<Contravention[] | null> {
  const html = await fetchHtml(INSPECTION_PAGE_URL(inspectionID));
  if (!html) return null;

  const root = parse(html);
  const contraventions: Contravention[] = [];

  const obsHeader = root.querySelector(".observations-header");
  if (!obsHeader) return [];

  const parentSection = obsHeader.closest("span") ?? obsHeader.parentNode;
  const noContraText = parentSection?.textContent ?? "";
  if (/no contraventions/i.test(noContraText)) {
    return [];
  }

  const items = root.querySelectorAll(".inspection-line-item-detail.w-row");
  for (const item of items) {
    const codeCol = item.querySelector(".w-col-2");
    const descCol = item.querySelector(".w-col-10");

    if (!codeCol || !descCol) continue;

    const code = codeCol.textContent.trim();
    if (code === "Code" || !code) continue;

    const divs = descCol.querySelectorAll("div");
    let description = "";
    let observations = "";
    let correctByDate = "";
    let actionsRequired = "";
    let correctiveActions = "";

    for (const div of divs) {
      const text = div.textContent.trim();
      if (text.startsWith("Description:")) {
        description = text.replace("Description:", "").trim();
      } else if (text.startsWith("Observations:")) {
        observations = text.replace("Observations:", "").trim();
      } else if (text.startsWith("To Be Corrected By:")) {
        correctByDate = text.replace("To Be Corrected By:", "").trim();
      } else if (text.startsWith("Actions Required By Licensing:")) {
        actionsRequired = text.replace("Actions Required By Licensing:", "").trim();
      } else if (text.startsWith("Corrective Actions Taken By Licensee:")) {
        correctiveActions = text.replace("Corrective Actions Taken By Licensee:", "").trim();
      }
    }

    const corrected =
      /contravention has been addressed/i.test(actionsRequired) ||
      /no further action/i.test(actionsRequired);

    if (code) {
      contraventions.push({
        code,
        description,
        observations,
        correctByDate,
        corrected,
        correctiveActions: correctiveActions || undefined,
      });
    }
  }

  return contraventions;
}

function slugify(s: string): string {
  return cleanIslandHealthUnicode(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateDeterministicId(
  name: string,
  address: string,
  usedIds: Set<string>,
): string {
  let base = slugify(name);
  if (!base) base = "facility";
  let candidate = base;
  if (usedIds.has(candidate)) {
    const addrSlug = slugify(address);
    if (addrSlug) {
      candidate = `${base}-${addrSlug}`;
    }
  }
  let index = 2;
  let finalId = candidate;
  while (usedIds.has(finalId)) {
    finalId = `${candidate}-${index}`;
    index++;
  }
  return finalId;
}

async function main() {
  const facilitiesPath = resolve(DATA_DIR, "facilities.json");
  const inspectionsPath = resolve(DATA_DIR, "inspections.json");
  const ihFacilitiesPath = resolve(DATA_DIR, "island-health-facilities.json");
  const metaPath = resolve(DATA_DIR, "meta.json");

  const prevFacilitiesRaw = readFileSync(facilitiesPath, "utf-8");
  const ourFacilities: OurFacility[] = JSON.parse(prevFacilitiesRaw);
  console.log(`Loaded ${ourFacilities.length} facilities from our data`);

  let prevInspectionsRaw = "";
  let existingInspections: InspectionRecord[] = [];
  try {
    prevInspectionsRaw = readFileSync(inspectionsPath, "utf-8");
    existingInspections = JSON.parse(prevInspectionsRaw);
  } catch {
    /* no existing data */
  }

  let existingIhFacilities: OurFacility[] = [];
  try {
    existingIhFacilities = JSON.parse(readFileSync(ihFacilitiesPath, "utf-8"));
  } catch {
    /* no existing island-health-facilities.json */
  }

  let tenDollarNames = new Set<string>();
  let tenDollarOverrides: Record<string, boolean> = {};
  try {
    const tenDollarRaw = JSON.parse(
      readFileSync(resolve(DATA_DIR, "ten-dollar-centres.json"), "utf-8"),
    );
    tenDollarNames = new Set(
      (tenDollarRaw.names || []).map((n: string) => normalizeIslandHealthName(n)),
    );
    tenDollarOverrides = tenDollarRaw.overrides ?? {};
  } catch {
    /* optional */
  }

  let websiteOverrides: Record<string, string> = {};
  try {
    websiteOverrides = JSON.parse(
      readFileSync(resolve(DATA_DIR, "website-overrides.json"), "utf-8"),
    );
  } catch {
    /* optional */
  }

  const cache = new Map<string, InspectionDetail>();
  const existingRecordsMap = new Map<string, InspectionRecord>();

  for (const rec of existingInspections) {
    existingRecordsMap.set(rec.facilityId, rec);
    if (rec.inspections && Array.isArray(rec.inspections)) {
      for (const insp of rec.inspections) {
        cache.set(insp.id, insp);
      }
    }
  }

  const targetFacilityId = process.argv
    .find((arg) => arg.startsWith("--facility="))
    ?.split("=")[1];
  const skipDiscovery =
    process.argv.includes("--skip-discovery") || targetFacilityId !== undefined;
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1];
  const limit = limitArg
    ? limitArg === "none" || limitArg === "0"
      ? Infinity
      : parseInt(limitArg, 10)
    : Infinity;

  const discovered = skipDiscovery ? [] : await discoverAllFacilities();

  if (!skipDiscovery && discovered.length === 0) {
    console.error(
      "[ERROR] Discovered 0 facilities from Island Health API (likely rate-limited or blocked with HTTP 403). Aborting to avoid marking stale data as fresh.",
    );
    process.exit(1);
  }

  const matched = new Map<
    string,
    {
      facilityId: string;
      permitID: string;
      apiData: APIFacility;
      fromDiscovery: boolean;
    }
  >();

  if (!skipDiscovery) {
    const usedFacIds = new Set<string>();
    const usedPermits = new Set<string>();

    // Count normalized name frequencies to detect unique names
    const facNameCounts = new Map<string, number>();
    for (const f of ourFacilities) {
      const n = normalizeIslandHealthName(f.name);
      facNameCounts.set(n, (facNameCounts.get(n) || 0) + 1);
    }
    const discNameCounts = new Map<string, number>();
    for (const d of discovered) {
      const n = normalizeIslandHealthName(d.permitName || d.establishmentName);
      discNameCounts.set(n, (discNameCounts.get(n) || 0) + 1);
    }

    // Pass 1: Exact normalized name + compatible street number (or unique name in both datasets)
    for (const disc of discovered) {
      const dName = normalizeIslandHealthName(disc.permitName || disc.establishmentName);
      const dNum = extractStreetNumber(disc.addressLine1);
      for (const f of ourFacilities) {
        if (usedFacIds.has(f.id)) continue;
        const fName = normalizeIslandHealthName(f.name);
        if (dName !== fName) continue;
        const fNum = extractStreetNumber(f.address);
        const uniqueInBoth =
          facNameCounts.get(fName) === 1 && discNameCounts.get(dName) === 1;
        if (!dNum || !fNum || dNum === fNum || uniqueInBoth) {
          matched.set(f.id, {
            facilityId: f.id,
            permitID: disc.permitID,
            apiData: disc,
            fromDiscovery: true,
          });
          usedFacIds.add(f.id);
          usedPermits.add(disc.permitID);
          break;
        }
      }
    }

    // Pass 2: Exact normalized street address when only 1 unmatched facility is at that address
    for (const disc of discovered) {
      if (usedPermits.has(disc.permitID)) continue;
      const dAddr = normalizeStreetAddress(disc.addressLine1, false);
      if (!dAddr) continue;
      const candidates = ourFacilities.filter(
        (f) => !usedFacIds.has(f.id) && normalizeStreetAddress(f.address, false) === dAddr,
      );
      if (candidates.length === 1) {
        const f = candidates[0];
        matched.set(f.id, {
          facilityId: f.id,
          permitID: disc.permitID,
          apiData: disc,
          fromDiscovery: true,
        });
        usedFacIds.add(f.id);
        usedPermits.add(disc.permitID);
      }
    }

    // Pass 2b: Normalized street address without suffix (e.g. "1701 Elgin Rd" vs "1701 Elgin St")
    for (const disc of discovered) {
      if (usedPermits.has(disc.permitID)) continue;
      const dAddrRoot = normalizeStreetAddress(disc.addressLine1, true);
      if (!dAddrRoot) continue;
      const candidates = ourFacilities.filter(
        (f) =>
          !usedFacIds.has(f.id) && normalizeStreetAddress(f.address, true) === dAddrRoot,
      );
      if (candidates.length === 1) {
        const f = candidates[0];
        matched.set(f.id, {
          facilityId: f.id,
          permitID: disc.permitID,
          apiData: disc,
          fromDiscovery: true,
        });
        usedFacIds.add(f.id);
        usedPermits.add(disc.permitID);
      }
    }

    // Pass 3: Prefix name match where street numbers do not conflict
    for (const disc of discovered) {
      if (usedPermits.has(disc.permitID)) continue;
      const dName = disc.permitName || disc.establishmentName;
      const dNum = extractStreetNumber(disc.addressLine1);
      for (const f of ourFacilities) {
        if (usedFacIds.has(f.id)) continue;
        const fNum = extractStreetNumber(f.address);
        if (dNum && fNum && dNum !== fNum) continue;
        if (islandHealthNamesMatch(f.name, dName)) {
          matched.set(f.id, {
            facilityId: f.id,
            permitID: disc.permitID,
            apiData: disc,
            fromDiscovery: true,
          });
          usedFacIds.add(f.id);
          usedPermits.add(disc.permitID);
          break;
        }
      }
    }

    // Pass 4: Same street number + shared distinctive name word
    const stopWords = new Set([
      "child",
      "care",
      "childcare",
      "daycare",
      "centre",
      "center",
      "school",
      "preschool",
      "early",
      "learning",
      "incorporated",
      "society",
      "victoria",
      "saanich",
      "island",
    ]);
    for (const disc of discovered) {
      if (usedPermits.has(disc.permitID)) continue;
      const dNum = extractStreetNumber(disc.addressLine1);
      if (!dNum) continue;
      const dWords = cleanIslandHealthUnicode(disc.permitName || disc.establishmentName)
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 4 && !stopWords.has(w));
      for (const f of ourFacilities) {
        if (usedFacIds.has(f.id)) continue;
        const fNum = extractStreetNumber(f.address);
        if (dNum !== fNum) continue;
        const fNameLower = cleanIslandHealthUnicode(f.name).toLowerCase();
        if (dWords.some((w) => fNameLower.includes(w))) {
          matched.set(f.id, {
            facilityId: f.id,
            permitID: disc.permitID,
            apiData: disc,
            fromDiscovery: true,
          });
          usedFacIds.add(f.id);
          usedPermits.add(disc.permitID);
          break;
        }
      }
    }

    console.log(
      `\nMatched ${matched.size} of ${ourFacilities.length} existing facilities via municipality discovery`,
    );

    // Phase 2: Ingest brand-new CRD child care facilities discovered on Island Health
    const newPermits = discovered.filter((d) => !usedPermits.has(d.permitID));
    if (newPermits.length > 0) {
      console.log(
        `\nFound ${newPermits.length} new CRD child care facilities on Island Health not in facilities.json. Geocoding & adding...`,
      );
      const usedIds = new Set(ourFacilities.map((f) => f.id));
      const existingCoordsByAddr = new Map<string, { lat: number; lng: number }>();
      for (const f of [...ourFacilities, ...existingIhFacilities]) {
        const na = normalizeStreetAddress(f.address, false);
        if (na && f.lat && f.lng) {
          existingCoordsByAddr.set(na, { lat: f.lat, lng: f.lng });
        }
      }

      const newlyAddedFacilities: OurFacility[] = [];
      for (const disc of newPermits) {
        const rawName = (disc.permitName || disc.establishmentName || "").trim();
        const address = (disc.addressLine1 || "").trim();
        const locality = (disc.city || "Victoria").trim();
        const postalCode = (disc.zip || "").trim();
        if (!rawName || !address) continue;

        const normAddrKey = normalizeStreetAddress(address, false);
        let coords = existingCoordsByAddr.get(normAddrKey) || null;
        if (!coords) {
          coords = await geocodeBCAddress(address, locality);
          await sleep(150);
        }
        if (!coords) {
          console.warn(
            `  [WARN] Could not geocode new facility "${rawName}" at "${address}, ${locality}". Skipping facility creation.`,
          );
          continue;
        }

        const municipality = mapIslandHealthMunicipality(
          disc.Municipality || "",
          locality,
        );
        const region = MUNICIPALITY_TO_REGION[municipality] ?? "other";
        const { serviceType, ageGroups } = parseIslandHealthServiceTypes(
          disc.ServiceType || "",
        );
        const id = generateDeterministicId(rawName, address, usedIds);
        usedIds.add(id);

        const isTenDollarDay =
          tenDollarOverrides[id] !== undefined
            ? tenDollarOverrides[id]
            : tenDollarNames.has(normalizeIslandHealthName(rawName));

        const newFac: OurFacility = {
          id,
          name: rawName,
          address,
          locality,
          postalCode,
          municipality,
          region,
          lat: coords.lat,
          lng: coords.lng,
          phone: formatPhone(disc.WorkPhone),
          email: "",
          website: websiteOverrides[id] || "",
          serviceType,
          ageGroups,
          vacancyInd: "N",
          vacancyForLicense: `N_${serviceType}`,
          vacancyLastUpdated: "Unknown",
          isTenDollarDay,
          isCcfri: false,
          vacancyUnder36: false,
          vacancy30mos5yrs: false,
          vacancyLicpre: false,
          vacancyOosGr1Age12: false,
        };

        ourFacilities.push(newFac);
        newlyAddedFacilities.push(newFac);
        matched.set(newFac.id, {
          facilityId: newFac.id,
          permitID: disc.permitID,
          apiData: disc,
          fromDiscovery: true,
        });
        console.log(
          `  + Added new facility [${newFac.id}] "${newFac.name}" (${newFac.address}, ${newFac.municipality})`,
        );
      }

      if (newlyAddedFacilities.length > 0) {
        // Merge with existing island-health-facilities.json and persist
        const ihMap = new Map<string, OurFacility>();
        for (const f of existingIhFacilities) ihMap.set(f.id, f);
        for (const f of newlyAddedFacilities) ihMap.set(f.id, f);
        const updatedIhList = Array.from(ihMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        writeFileSync(ihFacilitiesPath, JSON.stringify(updatedIhList, null, 2));

        ourFacilities.sort((a, b) => a.name.localeCompare(b.name));
        writeFileSync(facilitiesPath, JSON.stringify(ourFacilities, null, 2));
        console.log(
          `  Wrote ${newlyAddedFacilities.length} new Island Health facilities to ${ihFacilitiesPath} and updated ${facilitiesPath} (total: ${ourFacilities.length})`,
        );
      }
    }
  }

  // Fallback: preserve existing inspection links for facilities not returned in municipality discovery
  for (const rec of existingInspections) {
    if (rec.permitID && rec.facilityId && !matched.has(rec.facilityId)) {
      matched.set(rec.facilityId, {
        facilityId: rec.facilityId,
        permitID: rec.permitID,
        apiData: {
          permitID: rec.permitID,
          establishmentName: "",
          permitName: "",
          addressLine1: "",
          city: "",
          zip: "",
          inspectionID: "",
          inspectionDate: "",
          purpose: "",
          ServiceType: rec.serviceType || "",
        },
        fromDiscovery: false,
      });
    }
  }

  console.log(`Total matched: ${matched.size} of ${ourFacilities.length} facilities`);

  const inspections: InspectionRecord[] = [];
  const matchedEntries = Array.from(matched.values());

  // Prioritize unfetched facilities first
  matchedEntries.sort((a, b) => {
    const existingA = existingRecordsMap.get(a.facilityId);
    const existingB = existingRecordsMap.get(b.facilityId);
    const fetchedA = existingA?.allFetched || false;
    const fetchedB = existingB?.allFetched || false;

    if (!fetchedA && fetchedB) return -1;
    if (fetchedA && !fetchedB) return 1;
    return 0;
  });

  console.log(`\nChecking/fetching inspection details for ${matchedEntries.length} facilities...`);

  let rateLimited = false;
  let limitReached = false;
  let newFetchesCount = 0;
  let consecutiveFailures = 0;

  for (let i = 0; i < matchedEntries.length; i++) {
    const entry = matchedEntries[i];
    if (!entry) continue;

    const isTarget = !targetFacilityId || entry.facilityId === targetFacilityId;

    if (isTarget && targetFacilityId) {
      console.log(
        `  Processing targeted facility ${entry.facilityId} (${entry.apiData.permitName || "ID " + entry.facilityId})...`,
      );
    } else if (i % 25 === 0 && !targetFacilityId) {
      console.log(
        `  Processing ${i + 1}/${matchedEntries.length} (new fetches so far: ${newFetchesCount})...`,
      );
    }

    const inspectionUrl = FACILITY_PAGE_URL(entry.permitID);
    const facilityInspections: InspectionDetail[] = [];
    const existing = existingRecordsMap.get(entry.facilityId);
    let successfullyFetched = false;

    const apiLatestDate = entry.apiData.inspectionDate
      ? entry.apiData.inspectionDate.split("T")[0]
      : "";

    const bypassCache =
      (targetFacilityId !== undefined && isTarget) || process.argv.includes("--force");
    const permitChanged = Boolean(existing && existing.permitID !== entry.permitID);

    let cacheIsUpToDate = false;
    if (!bypassCache && !permitChanged) {
      if (entry.fromDiscovery && !apiLatestDate) {
        // Live discovery shows this facility has 0 published inspections on Island Health
        if (!existing || (existing.allFetched && existing.inspections.length === 0)) {
          cacheIsUpToDate = true;
          successfullyFetched = true;
        }
      } else if (
        existing &&
        existing.allFetched &&
        Array.isArray(existing.inspections)
      ) {
        if (!entry.fromDiscovery) {
          // Facility wasn't in municipality discovery (e.g. historical/delisted); preserve cached data
          cacheIsUpToDate = true;
        } else if (existing.inspections.length > 0) {
          const cachedLatestDate = existing.inspections[0].date;
          if (cachedLatestDate === apiLatestDate) {
            cacheIsUpToDate = true;
          }
        }
      }
    }

    const needFetch = isTarget && !cacheIsUpToDate;
    if (needFetch && !rateLimited && !limitReached) {
      if (newFetchesCount >= limit) {
        console.log(
          `  [Batch Limit] Reached limit of ${limit} new fetches. Skipping remaining new fetches.`,
        );
        limitReached = true;
      } else {
        newFetchesCount++;
      }
    }

    if (!isTarget) {
      if (existing && existing.inspections) {
        facilityInspections.push(...existing.inspections);
      }
    } else if (cacheIsUpToDate) {
      if (existing && existing.inspections && !permitChanged) {
        facilityInspections.push(...existing.inspections);
      }
    } else if (!rateLimited && !limitReached) {
      await sleepJitter(400, 800);

      const inspList = await fetchFacilityInspections(entry.permitID);

      if (inspList === null) {
        consecutiveFailures++;
        console.warn(
          `  Failed to fetch facility page for ${entry.permitID} (consecutive failures: ${consecutiveFailures}).`,
        );
        if (consecutiveFailures >= 5) {
          console.error(
            `  Too many consecutive failures. Flagging as rate-limited/blocked.`,
          );
          rateLimited = true;
        }
      } else {
        let fetchSuccess = true;
        if (inspList.length > 0) {
          const top6 = inspList.slice(0, 6);
          for (const insp of top6) {
            let contraventions: Contravention[] = [];
            if (cache.has(insp.inspectionID) && !bypassCache) {
              contraventions = cache.get(insp.inspectionID)!.contraventions;
            } else {
              await sleepJitter(400, 800);
              const fetched = await fetchContraventions(insp.inspectionID);
              if (fetched === null) {
                consecutiveFailures++;
                console.warn(
                  `  Failed to fetch contraventions for inspection ${insp.inspectionID} (consecutive failures: ${consecutiveFailures}).`,
                );
                fetchSuccess = false;
                if (consecutiveFailures >= 5) {
                  console.error(
                    `  Too many consecutive failures. Flagging as rate-limited/blocked.`,
                  );
                  rateLimited = true;
                }
                break;
              }
              contraventions = fetched;
              cache.set(insp.inspectionID, {
                id: insp.inspectionID,
                date: insp.date,
                type: insp.type,
                contraventions,
              });
            }
            facilityInspections.push({
              id: insp.inspectionID,
              date: insp.date,
              type: insp.type,
              contraventions,
            });
          }
        }

        if (fetchSuccess) {
          consecutiveFailures = 0;
          successfullyFetched = true;
        }
      }
    }

    // Fallback: restore from cache if rate-limited or network failure (and permitID didn't change)
    if (facilityInspections.length === 0 && !successfullyFetched && existing && !permitChanged) {
      if (existing.inspections && Array.isArray(existing.inspections)) {
        facilityInspections.push(...existing.inspections);
      }
    }

    const serviceType = entry.apiData.ServiceType || existing?.serviceType || "";

    inspections.push({
      facilityId: entry.facilityId,
      permitID: entry.permitID,
      inspectionUrl,
      serviceType: serviceType || undefined,
      inspections: facilityInspections,
      allFetched:
        successfullyFetched || (!permitChanged && (existing?.allFetched ?? false)),
    });

    // Write progress periodically (every 15 new successful fetches)
    if (needFetch && successfullyFetched && newFetchesCount % 15 === 0) {
      const tempInspections = [...inspections];
      for (let j = i + 1; j < matchedEntries.length; j++) {
        const remainingEntry = matchedEntries[j];
        const remainingExisting = existingRecordsMap.get(remainingEntry.facilityId);
        const remainingServiceType =
          remainingEntry.apiData.ServiceType || remainingExisting?.serviceType || "";
        tempInspections.push({
          facilityId: remainingEntry.facilityId,
          permitID: remainingEntry.permitID,
          inspectionUrl: FACILITY_PAGE_URL(remainingEntry.permitID),
          serviceType: remainingServiceType || undefined,
          inspections: remainingExisting?.inspections ?? [],
          allFetched: remainingExisting?.allFetched ?? false,
        });
      }
      writeFileSync(inspectionsPath, JSON.stringify(tempInspections, null, 2));
      console.log(
        `  [Progress Saved] Wrote temporary inspections status to ${inspectionsPath} (new fetches: ${newFetchesCount})`,
      );
    }
  }

  const nextInspectionsRaw = JSON.stringify(inspections, null, 2);
  writeFileSync(inspectionsPath, nextInspectionsRaw);
  console.log(`\nDone! Wrote ${inspections.length} inspection records to ${inspectionsPath}`);

  const currentFacilitiesRaw = readFileSync(facilitiesPath, "utf-8");
  if (currentFacilitiesRaw !== prevFacilitiesRaw || nextInspectionsRaw !== prevInspectionsRaw) {
    writeFileSync(
      metaPath,
      JSON.stringify(
        {
          lastUpdated: new Date().toISOString(),
          count: ourFacilities.length,
        },
        null,
        2,
      ),
    );
    console.log(`  Updated ${metaPath} (lastUpdated timestamp & count=${ourFacilities.length})`);
  } else {
    console.log(`  No data changes detected; preserved existing ${metaPath}`);
  }

  const withContraventions = inspections.filter((r) =>
    r.inspections.some((i) => i.contraventions.length > 0),
  );
  const uncorrected = inspections.filter((r) =>
    r.inspections.some((i) => i.contraventions.some((c) => !c.corrected)),
  );
  console.log(`  New/updated facilities fetched: ${newFetchesCount}`);
  console.log(`  With contraventions: ${withContraventions.length}`);
  console.log(`  With uncorrected issues: ${uncorrected.length}`);
}

main();
