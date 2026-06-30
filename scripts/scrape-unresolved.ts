import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../data");
const BASE_URL = "https://inspections.myhealthdepartment.com";
const INSPECTION_PAGE_URL = (id: string) => `${BASE_URL}/island-health/program-ccfl/inspection/?inspectionID=${id}`;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchContraventions(inspectionID: string) {
  const url = INSPECTION_PAGE_URL(inspectionID);
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.warn(`Failed to fetch contraventions for ${inspectionID}: HTTP ${res.status}`);
      return null;
    }
    const html = await res.text();
    const root = parse(html);
    const contraventions: any[] = [];

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
        }
      }

      const corrected =
        /contravention has been addressed/i.test(actionsRequired) ||
        /no further action/i.test(actionsRequired);

      contraventions.push({
        code,
        description,
        observations,
        correctByDate,
        corrected,
      });
    }
    return contraventions;
  } catch (err: any) {
    console.warn(`Error fetching contraventions for ${inspectionID}:`, err.message);
    return null;
  }
}

async function main() {
  const inspections = JSON.parse(readFileSync(resolve(DATA_DIR, "inspections.json"), "utf-8"));
  
  // Find all facilities with unresolved issues in their latest inspection
  const targetRecords: any[] = [];
  for (const r of inspections) {
    if (!r.inspections || r.inspections.length === 0) continue;
    const latest = r.inspections[0];
    const hasUnresolved = latest.contraventions && latest.contraventions.some((c: any) => !c.corrected);
    if (hasUnresolved) {
      targetRecords.push(r);
    }
  }

  console.log(`Starting targeted re-scrape of ${targetRecords.length} facilities...`);

  let fetchedCount = 0;
  for (let i = 0; i < targetRecords.length; i++) {
    const r = targetRecords[i];
    console.log(`[${i + 1}/${targetRecords.length}] Processing facility ID ${r.facilityId}...`);
    
    // For each inspection that has contraventions, re-fetch and re-parse
    for (const insp of r.inspections) {
      if (insp.contraventions && insp.contraventions.length > 0) {
        await sleep(1500 + Math.random() * 1000); // 1.5s - 2.5s jitter
        const freshContraventions = await fetchContraventions(insp.id);
        if (freshContraventions !== null) {
          insp.contraventions = freshContraventions;
          fetchedCount++;
        }
      }
    }

    // Save progress after each facility to prevent data loss
    writeFileSync(resolve(DATA_DIR, "inspections.json"), JSON.stringify(inspections, null, 2));
  }

  console.log(`Done! Re-fetched ${fetchedCount} inspections for ${targetRecords.length} facilities.`);
}

main();
