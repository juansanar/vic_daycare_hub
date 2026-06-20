import { parse } from "node-html-parser";

const BASE_URL = "https://inspections.myhealthdepartment.com";
const FACILITY_PAGE_URL = (permitID: string) =>
  `${BASE_URL}/island-health/ccfl-facility/?permitID=${permitID}`;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function parseInspectionDate(dateStr: string): string {
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

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS });
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

async function fetchFacilityInspections(
  permitID: string,
): Promise<{ type: string; date: string; inspectionID: string }[]> {
  const html = await fetchHtml(FACILITY_PAGE_URL(permitID));
  if (!html) return [];

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

async function main() {
  const permitID = "AC3BD2F9-2DF5-4121-A6DD-F72064E840D3";
  const inspections = await fetchFacilityInspections(permitID);
  console.log(`Inspections found for ${permitID}:`, inspections);
}

main();
