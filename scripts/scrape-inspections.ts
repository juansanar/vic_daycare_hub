/**
 * Scrapes Island Health inspection data for child care facilities.
 *
 * Strategy:
 * 1. Use the Island Health JSON API to discover all CCFL facilities with permitIDs
 * 2. Match discovered facilities to our facilities.json by normalized name
 * 3. For each matched facility, fetch its facility page (server-rendered HTML) to get inspection history
 * 4. For the most recent routine inspection, fetch the detail page to get contraventions
 * 5. Write data/inspections.json
 *
 * Run with: npm run scrape-inspections
 */

import { parse } from "node-html-parser";
import { writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  islandHealthNamesMatch,
  normalizeIslandHealthName,
} from "./lib/island-health-names.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../data");

const BASE_URL = "https://inspections.myhealthdepartment.com";
const FACILITY_PAGE_URL = (permitID: string) =>
  `${BASE_URL}/island-health/ccfl-facility/?permitID=${permitID}`;
const INSPECTION_PAGE_URL = (inspectionID: string) =>
  `${BASE_URL}/island-health/program-ccfl/inspection/?inspectionID=${inspectionID}`;

const DELAY_MS = 800;
const PAGE_SIZE = 25;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface OurFacility {
  id: string;
  name: string;
  address: string;
  municipality: string;
}

interface APIFacility {
  permitID: string;
  establishmentName: string;
  permitName: string;
  addressLine1: string;
  city: string;
  zip: string;
  inspectionID: string;
  inspectionDate: string;
  purpose: string;
  ServiceType?: string;
}

interface Contravention {
  code: string;
  description: string;
  observations: string;
  correctByDate: string;
  corrected: boolean;
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

async function fetchJson(body: object): Promise<unknown> {
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
    });
    if (!res.ok) {
      console.warn(`  API returned ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.warn(`  fetchJson error:`, err);
    return null;
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.warn(`  HTTP ${res.status} for ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`  Fetch error for ${url}:`, err);
    return null;
  }
}

async function discoverAllFacilities(): Promise<APIFacility[]> {
  console.log("Discovering facilities via Island Health API...");
  const allFacilities: APIFacility[] = [];
  let start = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await fetchJson({
      data: {
        path: "island-health",
        programName: "ccfl",
        filters: {},
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
      hasMore = false;
      break;
    }

    allFacilities.push(...(result as APIFacility[]));
    console.log(`  Fetched ${allFacilities.length} records so far (page start=${start})...`);

    if (result.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      start += PAGE_SIZE;
      await sleep(DELAY_MS);
    }
  }

  // Deduplicate by permitID (API returns one entry per inspection, same facility appears multiple times)
  const byPermit = new Map<string, APIFacility>();
  for (const f of allFacilities) {
    if (!byPermit.has(f.permitID)) {
      byPermit.set(f.permitID, f);
    }
  }

  const unique = Array.from(byPermit.values());
  console.log(`  Discovered ${unique.length} unique facilities (from ${allFacilities.length} inspection records)`);
  return unique;
}

function parseInspectionDate(dateStr: string): string {
  // Handles "09-Jan-2026" format from HTML
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
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

    // Date is in a <p> in the second column
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

  // Each contravention is in a .inspection-line-item-detail row
  const items = root.querySelectorAll(".inspection-line-item-detail.w-row");
  for (const item of items) {
    const codeCol = item.querySelector(".w-col-2");
    const descCol = item.querySelector(".w-col-10");

    if (!codeCol || !descCol) continue;

    const code = codeCol.textContent.trim();
    if (code === "Code" || !code) continue; // Skip header row

    const divs = descCol.querySelectorAll("div");
    let description = "";
    let observations = "";
    let correctByDate = "";

    for (const div of divs) {
      const text = div.textContent.trim();
      if (text.startsWith("Description:")) {
        description = text.replace("Description:", "").trim();
      } else if (text.startsWith("Observations:")) {
        observations = text.replace("Observations:", "").trim();
      } else if (text.startsWith("To Be Corrected By:")) {
        correctByDate = text.replace("To Be Corrected By:", "").trim();
      }
    }

    if (code) {
      contraventions.push({
        code,
        description,
        observations,
        correctByDate,
        corrected: false,
      });
    }
  }

  return contraventions;
}

async function main() {
  const ourFacilities: OurFacility[] = JSON.parse(
    readFileSync(resolve(DATA_DIR, "facilities.json"), "utf-8"),
  );
  console.log(`Loaded ${ourFacilities.length} facilities from our data`);

  // Load existing inspection data to preserve contraventions on rate-limited re-runs
  let existingInspections: any[] = [];
  try {
    existingInspections = JSON.parse(
      readFileSync(resolve(DATA_DIR, "inspections.json"), "utf-8"),
    );
  } catch { /* no existing data */ }

  const cache = new Map<string, InspectionDetail>();
  const oldMigrationMap = new Map<string, { date: string; type: string; contraventions: Contravention[] }>();
  const existingRecordsMap = new Map<string, any>();

  for (const rec of existingInspections) {
    existingRecordsMap.set(rec.facilityId, rec);
    
    // If it has inspections array, load them into the cache
    if (rec.inspections && Array.isArray(rec.inspections)) {
      for (const insp of rec.inspections) {
        cache.set(insp.id, insp);
      }
    } else if (rec.permitID && rec.lastInspectionDate && rec.lastInspectionType) {
      // It's the old format - record for migration fallback
      oldMigrationMap.set(rec.permitID, {
        date: rec.lastInspectionDate,
        type: rec.lastInspectionType,
        contraventions: rec.contraventions || [],
      });
    }
  }

  // Build normalized name index for matching
  const nameIndex = new Map<string, OurFacility>();
  for (const f of ourFacilities) {
    nameIndex.set(normalizeIslandHealthName(f.name), f);
  }

  const skipDiscovery = process.argv.includes("--skip-discovery");
  const targetFacilityId = process.argv.find(arg => arg.startsWith("--facility="))?.split("=")[1];

  // Discover all facilities from Island Health API
  const discovered = skipDiscovery ? [] : await discoverAllFacilities();

  // Match discovered facilities to ours
  const matched: Map<string, { facilityId: string; permitID: string; apiData: APIFacility }> = new Map();

  // Pre-populate matched map from existing records to save API searches
  for (const rec of existingInspections) {
    if (rec.permitID && rec.facilityId) {
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
          inspectionDate: rec.inspections?.[0]?.date ? `${rec.inspections[0].date}T00:00:00` : "",
          purpose: rec.inspections?.[0]?.type || "",
          ServiceType: rec.serviceType || "",
        },
      });
    }
  }

  for (const disc of discovered) {
    const discName = disc.permitName || disc.establishmentName;
    const normalizedName = normalizeIslandHealthName(discName);
    const ourFacility = nameIndex.get(normalizedName);
    if (ourFacility) {
      matched.set(ourFacility.id, { facilityId: ourFacility.id, permitID: disc.permitID, apiData: disc });
      continue;
    }

    for (const f of ourFacilities) {
      if (matched.has(f.id)) continue;
      if (islandHealthNamesMatch(f.name, discName)) {
        matched.set(f.id, { facilityId: f.id, permitID: disc.permitID, apiData: disc });
        break;
      }
    }
  }

  if (!skipDiscovery) {
    console.log(`\nMatched ${matched.size} of ${ourFacilities.length} facilities after pagination`);
  }

  // Phase 2: Search individually for unmatched facilities
  const unmatched = ourFacilities.filter((f) => !matched.has(f.id));
  if (unmatched.length > 0 && unmatched.length < 400 && !skipDiscovery) {
    console.log(`Searching for ${unmatched.length} unmatched facilities by name...`);
    let searchMatches = 0;
    for (let i = 0; i < unmatched.length; i++) {
      const f = unmatched[i];
      if (i % 50 === 0 && i > 0) {
        console.log(`  Searched ${i}/${unmatched.length} (${searchMatches} found)...`);
      }
      await sleep(DELAY_MS);

      const searchResult = await fetchJson({
        data: {
          path: "island-health",
          programName: "ccfl",
          filters: {},
          start: 0,
          count: 5,
          searchQueryOverride: null,
          searchStr: f.name,
          lat: 0,
          lng: 0,
          sort: {},
        },
        task: "searchInspections",
      });

      if (Array.isArray(searchResult)) {
        for (const disc of searchResult as APIFacility[]) {
          const discName = disc.permitName || disc.establishmentName;
          if (islandHealthNamesMatch(f.name, discName)) {
            matched.set(f.id, { facilityId: f.id, permitID: disc.permitID, apiData: disc });
            searchMatches++;
            break;
          }
        }
      } else {
        // API error (likely rate-limited), stop searching
        console.log(`  API error at search ${i}, stopping individual searches.`);
        break;
      }
    }
    console.log(`  Found ${searchMatches} additional matches via search`);
  }

  console.log(`Total matched: ${matched.size} of ${ourFacilities.length} facilities`);

  // For each matched facility, fetch inspection data
  const inspections: InspectionRecord[] = [];
  const matchedEntries = Array.from(matched.values());

  // Prioritize "Hampton House Society" (facilityId "3004") and other unfetched facilities
  matchedEntries.sort((a, b) => {
    if (a.facilityId === "3004") return -1;
    if (b.facilityId === "3004") return 1;

    const existingA = existingRecordsMap.get(a.facilityId);
    const existingB = existingRecordsMap.get(b.facilityId);
    const fetchedA = existingA?.allFetched || false;
    const fetchedB = existingB?.allFetched || false;

    if (!fetchedA && fetchedB) return -1;
    if (fetchedA && !fetchedB) return 1;
    return 0;
  });

  console.log(`\nFetching inspection details for ${matchedEntries.length} facilities...`);

  let rateLimited = false;
  let consecutiveFailures = 0;

  for (let i = 0; i < matchedEntries.length; i++) {
    const entry = matchedEntries[i];
    if (!entry) continue;

    const isTarget = !targetFacilityId || entry.facilityId === targetFacilityId;

    if (isTarget && targetFacilityId) {
      console.log(`  Processing targeted facility ${entry.facilityId} (${entry.apiData.permitName || "ID " + entry.facilityId})...`);
    } else if (i % 20 === 0 && !targetFacilityId) {
      console.log(`  Processing ${i + 1}/${matchedEntries.length}...`);
    }

    const inspectionUrl = FACILITY_PAGE_URL(entry.permitID);
    const facilityInspections: InspectionDetail[] = [];
    const existing = existingRecordsMap.get(entry.facilityId);
    let successfullyFetched = false;

    // Check if cache is up-to-date based on the latest inspection date from the API
    const apiLatestDate = entry.apiData.inspectionDate
      ? entry.apiData.inspectionDate.split("T")[0]
      : "";
      
    let cacheIsUpToDate = false;
    if (existing && existing.allFetched && Array.isArray(existing.inspections) && existing.inspections.length > 0) {
      const cachedLatestDate = existing.inspections[0].date;
      if (cachedLatestDate === apiLatestDate) {
        cacheIsUpToDate = true;
      }
    }

    if (!isTarget) {
      if (existing && existing.inspections) {
        facilityInspections.push(...existing.inspections);
      }
    } else if (cacheIsUpToDate && existing) {
      facilityInspections.push(...existing.inspections);
    } else if (!rateLimited) {
      await sleep(DELAY_MS);

      const inspList = await fetchFacilityInspections(entry.permitID);

      if (inspList === null) {
        consecutiveFailures++;
        console.warn(`  Failed to fetch facility page for ${entry.permitID} (consecutive failures: ${consecutiveFailures}).`);
        if (consecutiveFailures >= 5) {
          console.error(`  Too many consecutive failures. Flagging as rate-limited/blocked.`);
          rateLimited = true;
        }
      } else {
        let fetchSuccess = true;
        if (inspList.length > 0) {
          // Fetch details for top 6 inspections
          const top6 = inspList.slice(0, 6);
          for (const insp of top6) {
            let contraventions: Contravention[] = [];
            if (cache.has(insp.inspectionID)) {
              contraventions = cache.get(insp.inspectionID)!.contraventions;
            } else {
              // Try migrating from old migration map
              const oldMig = oldMigrationMap.get(entry.permitID);
              if (oldMig && oldMig.date === insp.date && oldMig.type === insp.type) {
                contraventions = oldMig.contraventions;
                cache.set(insp.inspectionID, {
                  id: insp.inspectionID,
                  date: insp.date,
                  type: insp.type,
                  contraventions,
                });
              } else {
                await sleep(DELAY_MS);
                const fetched = await fetchContraventions(insp.inspectionID);
                if (fetched === null) {
                  consecutiveFailures++;
                  console.warn(`  Failed to fetch contraventions for inspection ${insp.inspectionID} (consecutive failures: ${consecutiveFailures}).`);
                  fetchSuccess = false;
                  if (consecutiveFailures >= 5) {
                    console.error(`  Too many consecutive failures. Flagging as rate-limited/blocked.`);
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
            }
            facilityInspections.push({
              id: insp.inspectionID,
              date: insp.date,
              type: insp.type,
              contraventions,
            });
          }

          if (fetchSuccess) {
            // Apply correction logic on facilityInspections
            for (const rd of facilityInspections) {
              if (/routine/i.test(rd.type)) {
                const hasNewerCleanFollowUp = facilityInspections.some(
                  (other) =>
                    /follow/i.test(other.type) &&
                    other.date > rd.date &&
                    other.contraventions.length === 0
                );
                if (hasNewerCleanFollowUp) {
                  rd.contraventions = rd.contraventions.map((c) => ({
                    ...c,
                    corrected: true,
                  }));
                  // Update cache
                  const cached = cache.get(rd.id);
                  if (cached) {
                    cached.contraventions = rd.contraventions;
                  }
                }
              }
            }
          }
        }

        if (fetchSuccess) {
          consecutiveFailures = 0;
          successfullyFetched = true;
        }
      }
    }

    // Fallback: If we couldn't get inspections (rate-limited, or network failure), restore from cache or old migration map
    if (facilityInspections.length === 0) {
      if (existing) {
        if (existing.inspections && Array.isArray(existing.inspections)) {
          facilityInspections.push(...existing.inspections);
        } else if (existing.lastInspectionDate) {
          // Old format fallback
          const oldMig = oldMigrationMap.get(entry.permitID);
          if (oldMig) {
            facilityInspections.push({
              id: "migrated-unknown-id",
              date: oldMig.date,
              type: oldMig.type,
              contraventions: oldMig.contraventions,
            });
          }
        }
      }
    }

    const serviceType = entry.apiData.ServiceType ?? existing?.serviceType ?? "";

    inspections.push({
      facilityId: entry.facilityId,
      permitID: entry.permitID,
      inspectionUrl,
      serviceType: serviceType || undefined,
      inspections: facilityInspections,
      allFetched: !isTarget ? (existing?.allFetched ?? false) : (cacheIsUpToDate ? existing?.allFetched : successfullyFetched),
    });
  }

  // Write results
  const outputPath = resolve(DATA_DIR, "inspections.json");
  writeFileSync(outputPath, JSON.stringify(inspections, null, 2));
  console.log(`\nDone! Wrote ${inspections.length} inspection records to ${outputPath}`);

  const withContraventions = inspections.filter((r) => r.inspections.some((i) => i.contraventions.length > 0));
  const uncorrected = inspections.filter((r) =>
    r.inspections.some((i) => i.contraventions.some((c) => !c.corrected)),
  );
  console.log(`  With contraventions: ${withContraventions.length}`);
  console.log(`  With uncorrected issues: ${uncorrected.length}`);
}

main();
