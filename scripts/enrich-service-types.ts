/**
 * Adds Island Health ServiceType to existing inspections.json records via API search.
 * Run: npm run enrich-service-types
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../data");
const BASE_URL = "https://inspections.myhealthdepartment.com";
const DELAY_MS = 400;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Content-Type": "application/json",
  Accept: "application/json",
  Origin: BASE_URL,
  Referer: `${BASE_URL}/island-health/program-ccfl`,
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

async function searchServiceType(name: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: BROWSER_HEADERS,
    body: JSON.stringify({
      data: {
        path: "island-health",
        programName: "ccfl",
        filters: {},
        start: 0,
        count: 5,
        searchQueryOverride: null,
        searchStr: name,
        lat: 0,
        lng: 0,
        sort: {},
      },
      task: "searchInspections",
    }),
  });
  if (!res.ok) return "";
  const data = await res.json();
  if (!Array.isArray(data)) return "";
  const target = normalize(name);
  for (const row of data) {
    const rowName = normalize(row.permitName || row.establishmentName || "");
    if (rowName === target && row.ServiceType) return String(row.ServiceType);
  }
  return "";
}

async function main() {
  const inspectionsPath = resolve(DATA_DIR, "inspections.json");
  const facilitiesPath = resolve(DATA_DIR, "facilities.json");
  const inspections = JSON.parse(readFileSync(inspectionsPath, "utf-8")) as Array<{
    facilityId: string;
    serviceType?: string;
  }>;
  const facilities = JSON.parse(readFileSync(facilitiesPath, "utf-8")) as Array<{
    id: string;
    name: string;
  }>;
  const nameById = new Map(facilities.map((f) => [f.id, f.name]));

  let updated = 0;
  for (let i = 0; i < inspections.length; i++) {
    const rec = inspections[i];
    const name = nameById.get(rec.facilityId);
    if (!name) continue;
    if (i % 25 === 0) console.log(`  ${i + 1}/${inspections.length}...`);
    await sleep(DELAY_MS);
    const serviceType = await searchServiceType(name);
    if (serviceType) {
      rec.serviceType = serviceType;
      updated++;
    }
  }

  writeFileSync(inspectionsPath, JSON.stringify(inspections, null, 2));
  console.log(`Done. Updated serviceType on ${updated} records.`);
}

main();
