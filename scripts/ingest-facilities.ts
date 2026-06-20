/**
 * Ingest script: fetches licensed child care facilities from the BC ArcGIS REST API,
 * filters to Victoria + Westshore + Peninsula, assigns CRD municipalities via postal code,
 * merges $10/day flags, and writes data/facilities.json + data/meta.json.
 *
 * Run with: npm run ingest
 */

import { writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../data");

const API_BASE =
  "https://delivery.maps.gov.bc.ca/arcgis/rest/services/mpcm/bcgwpub/MapServer/700/query";

const LOCALITIES = [
  "victoria",
  "saanich",
  "oak bay",
  "esquimalt",
  "view royal",
  "langford",
  "colwood",
  "metchosin",
  "highlands",
  "sooke",
  "saanichton",
  "sidney",
  "north saanich",
  "central saanich",
  "brentwood bay",
];

// Maps Forward Sortation Area (first 3 chars of postal code) to CRD municipality.
// Source: Canada Post FSA boundaries for Greater Victoria.
const FSA_TO_MUNICIPALITY: Record<string, string> = {
  V8V: "Victoria",
  V8W: "Victoria",
  V8T: "Victoria",
  V8R: "Oak Bay",
  V8S: "Oak Bay",
  V8P: "Saanich",
  V8N: "Saanich",
  V8X: "Saanich",
  V8Z: "Saanich",
  V8Y: "Saanich",
  V9A: "View Royal",
  V9B: "Langford",
  V9C: "Colwood",
  V9E: "Sooke",
  V8M: "Central Saanich",
  V8L: "Sidney",
};

// Fallback by locality name when postal code doesn't resolve
const LOCALITY_TO_MUNICIPALITY: Record<string, string> = {
  victoria: "Victoria",
  saanich: "Saanich",
  "oak bay": "Oak Bay",
  esquimalt: "Esquimalt",
  "view royal": "View Royal",
  langford: "Langford",
  colwood: "Colwood",
  metchosin: "Metchosin",
  highlands: "Highlands",
  sooke: "Sooke",
  saanichton: "Central Saanich",
  sidney: "Sidney",
  "north saanich": "North Saanich",
  "central saanich": "Central Saanich",
  "brentwood bay": "Central Saanich",
};

type CRDRegion = "core" | "westshore" | "peninsula" | "other";

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

interface RawFeature {
  attributes: Record<string, string | number | null>;
}

interface ApiResponse {
  features: RawFeature[];
  exceededTransferLimit?: boolean;
}

async function fetchAllFeatures(): Promise<RawFeature[]> {
  const allFeatures: RawFeature[] = [];
  let offset = 0;
  const PAGE_SIZE = 1000;

  const localityFilter = LOCALITIES.map(
    (l) => `UPPER(LOCALITY) = '${l.toUpperCase()}'`,
  ).join(" OR ");

  const where = `(${localityFilter})`;

  while (true) {
    const params = new URLSearchParams({
      where,
      outFields: "*",
      f: "json",
      resultOffset: String(offset),
      resultRecordCount: String(PAGE_SIZE),
    });

    const url = `${API_BASE}?${params}`;
    console.log(`Fetching offset=${offset}...`);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API responded ${res.status}: ${res.statusText}`);
    }

    const data: ApiResponse = await res.json();
    allFeatures.push(...data.features);
    console.log(`  Got ${data.features.length} features (total: ${allFeatures.length})`);

    if (!data.exceededTransferLimit || data.features.length < PAGE_SIZE) {
      break;
    }
    offset += PAGE_SIZE;
  }

  return allFeatures;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getMunicipality(locality: string, postalCode: string): string {
  const fsa = postalCode.replace(/\s/g, "").slice(0, 3).toUpperCase();
  if (FSA_TO_MUNICIPALITY[fsa]) return FSA_TO_MUNICIPALITY[fsa];
  const localLower = locality.toLowerCase().trim();
  if (LOCALITY_TO_MUNICIPALITY[localLower]) return LOCALITY_TO_MUNICIPALITY[localLower];
  return locality || "Unknown";
}

function getRegion(municipality: string): CRDRegion {
  return MUNICIPALITY_TO_REGION[municipality] ?? "other";
}

function getAgeGroups(a: Record<string, string | number | null>): string[] {
  const groups: string[] = [];
  if (a.SRVC_UNDER36_IND === "Y") groups.push("under36");
  if (a.SRVC_30MOS_5YRS_IND === "Y") groups.push("preschool30to5");
  if (a.SRVC_LICPRE_IND === "Y") groups.push("licensedPreschool");
  if (a.SRVC_OOS_KINDER_IND === "Y") groups.push("kindergarten");
  if (a.SRVC_OOS_GR1_AGE12_IND === "Y") groups.push("schoolAge");

  if (groups.length > 0) return groups;

  const desc = String(a.DESC_PROGRAMS_PROVIDED ?? "");
  if (!desc || desc === "None") return groups;

  const lower = desc.toLowerCase();
  if (lower.includes("under 36")) groups.push("under36");
  if (lower.includes("3 years to kindergarten") || lower.includes("30 months"))
    groups.push("preschool30to5");
  if (lower.includes("licensed preschool")) groups.push("licensedPreschool");
  if (lower.includes("kindergarten")) groups.push("kindergarten");
  if (lower.includes("grade 1") || lower.includes("age 12"))
    groups.push("schoolAge");

  return groups;
}

interface Facility {
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

async function main() {
  console.log("Loading $10/day centres list...");
  const tenDollarRaw = JSON.parse(
    readFileSync(resolve(DATA_DIR, "ten-dollar-centres.json"), "utf-8"),
  );
  const tenDollarNames: string[] = tenDollarRaw.names;
  const tenDollarOverrides: Record<string, boolean> =
    tenDollarRaw.overrides ?? {};
  const normalizedTenDollar = new Set(tenDollarNames.map(normalize));

  console.log("Loading website overrides...");
  let websiteOverrides: Record<string, string> = {};
  try {
    websiteOverrides = JSON.parse(
      readFileSync(resolve(DATA_DIR, "website-overrides.json"), "utf-8"),
    );
  } catch {
    // Fallback to empty if file not present or unparseable
  }

  console.log("Fetching facilities from BC ArcGIS API...");
  let features: RawFeature[];
  try {
    features = await fetchAllFeatures();
  } catch (err) {
    console.error("Failed to fetch from API:", err);
    console.log("Keeping existing facilities.json as fallback.");
    return;
  }

  console.log(`Processing ${features.length} features...`);

  const facilities: Facility[] = features.map((f) => {
    const a = f.attributes;
    const id = String(a.FACILITY_ID ?? a.SEQUENCE_ID ?? "");
    const name = String(a.OCCUPANT_NAME ?? "");
    const locality = String(a.LOCALITY ?? "");
    const postalCode = String(a.POSTAL_CODE ?? "");

    let isTenDollarDay = false;
    if (tenDollarOverrides[id] !== undefined) {
      isTenDollarDay = tenDollarOverrides[id];
    } else {
      isTenDollarDay = normalizedTenDollar.has(normalize(name));
    }

    const municipality = getMunicipality(locality, postalCode);
    const region = getRegion(municipality);

    return {
      id,
      name,
      address: String(a.STREET_ADDRESS ?? ""),
      locality,
      postalCode,
      municipality,
      region,
      lat: Number(a.LATITUDE) || 0,
      lng: Number(a.LONGITUDE) || 0,
      phone: String(a.CONTACT_PHONE ?? ""),
      email: String(a.CONTACT_EMAIL ?? ""),
      website: websiteOverrides[id] || String(a.WEBSITE_URL ?? ""),
      serviceType: String(a.SERVICE_TYPE_DESC ?? ""),
      ageGroups: getAgeGroups(a),
      vacancyInd: String(a.VACANCY_IND ?? ""),
      vacancyForLicense: String(a.VACANCY_FOR_LICENSE ?? ""),
      vacancyLastUpdated: String(a.VACANCY_LAST_UPDATE_DATE ?? ""),
      isTenDollarDay,
      isCcfri: a.IS_CCFRI_AUTH_IND === "Y",
      vacancyUnder36: a.VACANCY_SRVC_UNDER36_IND === "Y",
      vacancy30mos5yrs: a.VACANCY_SRVC_30MOS_5YRS_IND === "Y",
      vacancyLicpre: a.VACANCY_SRVC_LICPRE_IND === "Y",
      vacancyOosGr1Age12: a.VACANCY_SRVC_OOS_GR1_AGE12_IND === "Y",
    };
  });

  const uniqueFacilities = Array.from(
    new Map(facilities.map((f) => [f.id, f])).values(),
  );

  uniqueFacilities.sort((a, b) => a.name.localeCompare(b.name));

  // Print municipality breakdown
  const muniCounts: Record<string, number> = {};
  uniqueFacilities.forEach((f) => {
    muniCounts[f.municipality] = (muniCounts[f.municipality] || 0) + 1;
  });
  console.log("\nMunicipality breakdown:");
  Object.entries(muniCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  const facilitiesPath = resolve(DATA_DIR, "facilities.json");
  const metaPath = resolve(DATA_DIR, "meta.json");

  writeFileSync(facilitiesPath, JSON.stringify(uniqueFacilities, null, 2));
  writeFileSync(
    metaPath,
    JSON.stringify(
      {
        lastUpdated: new Date().toISOString(),
        count: uniqueFacilities.length,
      },
      null,
      2,
    ),
  );

  console.log(`\nDone! Wrote ${uniqueFacilities.length} facilities.`);
  console.log(`  ${facilitiesPath}`);
  console.log(`  ${metaPath}`);

  const tenDollarCount = uniqueFacilities.filter((f) => f.isTenDollarDay).length;
  console.log(`  $10/day flagged: ${tenDollarCount}`);
}

main();
