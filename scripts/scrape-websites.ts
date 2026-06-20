/**
 * Scrapes DuckDuckGo HTML search results to find websites for child care facilities
 * that are currently missing a website URL in data/facilities.json.
 *
 * Saves resolved websites to data/website-overrides.json to persist across runs
 * and runs npm run ingest at the end to merge the results.
 *
 * Run with: npm run scrape-websites
 * Options:
 *   --limit=N   Limit the number of search queries to perform (default: 5)
 *   --delay=MS  Delay between search requests in milliseconds (default: 2000)
 */

import { writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../data");

const BASE_URL = "https://html.duckduckgo.com/html/";
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

const IGNORED_DOMAINS = [
  "duckduckgo.com",
  "google.com",
  "bing.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "pinterest.com",
  "yelp.ca",
  "yelp.com",
  "yellowpages.ca",
  "care.com",
  "daycarebear.ca",
  "threebestrated.ca",
  "mapquest.com",
  "todocanada.ca",
  "foursquare.com",
  "groupon.com",
  "gov.bc.ca",
  "myhealthdepartment.com",
  "islandhealth.ca",
  "vicdaycare.com",
  "bcinfo.ca",
  "kidyno.com",
  "winnie.com",
  "findchildcare.ca",
  "childcarecentre.us",
  "carezen.com",
  "childcare.gov.bc.ca",
  "canadian-daycares.ca",
  "daycares.org",
  "localchildcare.ca",
  "childcarecenter.us",
  "crd.bc.ca",
  "bbb.org",
  "localdatacompany.com",
  "healthspace.ca",
  "canadian-health.ca",
  "islandhealth.custhelp.com",
  "westshore.bc.ca",
  "meetlittlescout.com",
  "gotdaycare.ca",
  "bestdaycares.ca",
];

interface Facility {
  id: string;
  name: string;
  website: string;
  locality: string;
  municipality: string;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Extract target URL from DuckDuckGo redirect url
function extractDestinationUrl(href: string): string {
  try {
    if (href.includes("uddg=")) {
      const urlObj = new URL(href, "https://html.duckduckgo.com");
      const uddg = urlObj.searchParams.get("uddg");
      if (uddg) return uddg;
    }
    if (href.startsWith("//")) {
      return `https:${href}`;
    }
    return href;
  } catch {
    return href;
  }
}

// Check if a URL belongs to a valid facility website (not a directory or social media page)
function isValidFacilityWebsite(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    
    // Ignore directories, social media, government links
    const isIgnored = IGNORED_DOMAINS.some(
      (domain) => host === domain || host.endsWith("." + domain)
    );
    
    if (isIgnored) return false;

    // Require HTTP/HTTPS
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    return true;
  } catch {
    return false;
  }
}

async function scrapeSearch(query: string): Promise<string[]> {
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}`;
  
  const res = await fetch(url, { headers: BROWSER_HEADERS });
  if (!res.ok) {
    console.warn(`  DDG search failed with status ${res.status}: ${res.statusText}`);
    return [];
  }
  
  const html = await res.text();
  const root = parse(html);
  
  const urls: string[] = [];
  const results = root.querySelectorAll(".result");
  
  for (const row of results) {
    const linkEl = row.querySelector(".result__a");
    if (!linkEl) continue;
    
    const href = linkEl.getAttribute("href") ?? "";
    if (href) {
      const destUrl = extractDestinationUrl(href);
      if (destUrl) {
        urls.push(destUrl);
      }
    }
  }
  
  return urls;
}

async function main() {
  // Parse command line arguments
  let limit = 5;
  let delay = 2000;

  process.argv.forEach((val) => {
    if (val.startsWith("--limit=")) {
      limit = parseInt(val.split("=")[1], 10);
    } else if (val.startsWith("--delay=")) {
      delay = parseInt(val.split("=")[1], 10);
    }
  });

  const facilitiesPath = resolve(DATA_DIR, "facilities.json");
  const overridesPath = resolve(DATA_DIR, "website-overrides.json");

  // Load facilities
  let facilities: Facility[] = [];
  try {
    facilities = JSON.parse(readFileSync(facilitiesPath, "utf-8"));
  } catch (err) {
    console.error("Failed to load facilities.json:", err);
    process.exit(1);
  }

  // Load existing overrides
  let overrides: Record<string, string> = {};
  try {
    overrides = JSON.parse(readFileSync(overridesPath, "utf-8"));
  } catch {
    console.log("No existing website-overrides.json found. Creating new empty file.");
    writeFileSync(overridesPath, JSON.stringify({}, null, 2));
  }

  // Identify facilities that have no website URL
  const missingWebsites = facilities.filter(
    (f) => !f.website && !overrides[f.id]
  );

  console.log(`Found ${facilities.length} total facilities.`);
  console.log(`  - ${facilities.filter((f) => f.website || overrides[f.id]).length} have websites.`);
  console.log(`  - ${missingWebsites.length} are missing websites.`);
  
  if (missingWebsites.length === 0) {
    console.log("All facilities already have websites or overrides. Nothing to scrape!");
    return;
  }

  const toProcess = missingWebsites.slice(0, limit);
  console.log(`Processing up to ${limit} facilities (delay: ${delay}ms)...`);

  let countSuccess = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const facility = toProcess[i];
    const location =
      facility.municipality && facility.municipality !== "Unknown"
        ? facility.municipality
        : (facility.locality || "");
        
    const query = `${facility.name} childcare ${location}`.trim();
    console.log(`[${i + 1}/${toProcess.length}] Searching: "${query}"...`);

    try {
      const urls = await scrapeSearch(query);
      const validWebsite = urls.find(isValidFacilityWebsite);

      if (validWebsite) {
        console.log(`  -> SUCCESS: Found website: ${validWebsite}`);
        overrides[facility.id] = validWebsite;
        countSuccess++;
        
        // Save immediately on success to preserve work
        writeFileSync(overridesPath, JSON.stringify(overrides, null, 2));
      } else {
        console.log(`  -> Checked ${urls.length} URLs, no valid primary website found.`);
      }
    } catch (err) {
      console.error(`  -> ERROR scraping search results for "${facility.name}":`, err);
    }

    // Delay between requests
    if (i < toProcess.length - 1) {
      const randomizedDelay = delay + Math.floor(Math.random() * 1000);
      await sleep(randomizedDelay);
    }
  }

  console.log(`\nScraping complete. Resolved ${countSuccess} new website URLs.`);

  if (countSuccess > 0) {
    console.log("Running ingestion pipeline to merge new overrides into facilities.json...");
    try {
      execSync("npm run ingest", { stdio: "inherit" });
      console.log("Ingestion finished successfully.");
    } catch (err) {
      console.error("Failed to run ingest pipeline:", err);
    }
  } else {
    console.log("No new websites were resolved. Ingestion skipped.");
  }
}

main().catch((err) => {
  console.error("Fatal error in scrape-websites script:", err);
  process.exit(1);
});
