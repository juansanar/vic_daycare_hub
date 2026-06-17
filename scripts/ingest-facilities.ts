/**
 * Ingest script: fetches licensed child care facilities from the BC ArcGIS REST API,
 * filters to Victoria + Westshore, merges $10/day flags, and writes data/facilities.json + data/meta.json.
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

const VICTORIA_LOCALITIES = [
  "victoria",
  "saanich",
  "oak bay",
  "esquimalt",
  "view royal",
  "saanichton",
  "sidney",
  "north saanich",
  "central saanich",
  "brentwood bay",
];

const WESTSHORE_LOCALITIES = [
  "langford",
  "colwood",
  "metchosin",
  "highlands",
  "sooke",
];

const ALL_LOCALITIES = [...VICTORIA_LOCALITIES, ...WESTSHORE_LOCALITIES];

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

  const localityFilter = ALL_LOCALITIES.map(
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

function getArea(locality: string): "victoria" | "westshore" {
  const lower = locality.toLowerCase().trim();
  if (WESTSHORE_LOCALITIES.includes(lower)) return "westshore";
  return "victoria";
}

interface Facility {
  id: string;
  name: string;
  address: string;
  locality: string;
  postalCode: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  website: string;
  serviceType: string;
  vacancyInd: string;
  isTenDollarDay: boolean;
  area: "victoria" | "westshore";
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

    let isTenDollarDay = false;
    if (tenDollarOverrides[id] !== undefined) {
      isTenDollarDay = tenDollarOverrides[id];
    } else {
      isTenDollarDay = normalizedTenDollar.has(normalize(name));
    }

    return {
      id,
      name,
      address: String(a.STREET_ADDRESS ?? ""),
      locality,
      postalCode: String(a.POSTAL_CODE ?? ""),
      lat: Number(a.LATITUDE) || 0,
      lng: Number(a.LONGITUDE) || 0,
      phone: String(a.CONTACT_PHONE ?? ""),
      email: String(a.CONTACT_EMAIL ?? ""),
      website: String(a.WEBSITE_URL ?? ""),
      serviceType: String(a.SERVICE_TYPE_DESC ?? ""),
      vacancyInd: String(a.VACANCY_IND ?? ""),
      isTenDollarDay,
      area: getArea(locality),
    };
  });

  const uniqueFacilities = Array.from(
    new Map(facilities.map((f) => [f.id, f])).values(),
  );

  uniqueFacilities.sort((a, b) => a.name.localeCompare(b.name));

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
