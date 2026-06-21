import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../data");

function main() {
  console.log("Starting inspections validation...");

  const facilities = JSON.parse(
    readFileSync(resolve(DATA_DIR, "facilities.json"), "utf-8")
  );
  const inspections = JSON.parse(
    readFileSync(resolve(DATA_DIR, "inspections.json"), "utf-8")
  );

  console.log(`Loaded ${facilities.length} facilities.`);
  console.log(`Loaded ${inspections.length} inspection records.`);

  const facilitiesMap = new Map<string, any>(facilities.map((f: any) => [f.id, f]));
  const inspectionsMap = new Map<string, any>(inspections.map((i: any) => [i.facilityId, i]));

  let hasErrors = false;

  // 1. Verify general completeness of matched facilities (100% must be fully fetched)
  const uncompleted: string[] = [];
  let fetchedCount = 0;
  for (const record of inspections) {
    if (!record.allFetched) {
      const fac = facilitiesMap.get(record.facilityId);
      const name = fac ? fac.name : "Unknown Facility Name";
      uncompleted.push(`ID: ${record.facilityId} - ${name} (permitID: ${record.permitID})`);
    } else {
      fetchedCount++;
    }
  }

  console.log(`\nInspections Ingestion Status: ${fetchedCount} / ${inspections.length} matched facilities are fully fetched.`);

  if (uncompleted.length > 0) {
    console.error(`\n[ERROR] Found ${uncompleted.length} facilities with incomplete inspections (allFetched is false):`);
    uncompleted.slice(0, 20).forEach((u) => console.error(`  - ${u}`));
    if (uncompleted.length > 20) {
      console.error(`  ... and ${uncompleted.length - 20} more.`);
    }
    console.error("\nTo resolve this, please run: npm run scrape-inspections");
    hasErrors = true;
  } else {
    console.log("[OK] All matched facilities have allFetched: true.");
  }

  // Threshold check to prevent accidental data loss
  const MIN_FETCHED_THRESHOLD = 150;
  if (fetchedCount < MIN_FETCHED_THRESHOLD) {
    console.error(`[ERROR] Total fetched facilities count (${fetchedCount}) is below the threshold of ${MIN_FETCHED_THRESHOLD}. Ingestion data may have been corrupted or reset.`);
    hasErrors = true;
  } else {
    console.log(`[OK] Total fetched facilities count (${fetchedCount}) satisfies the minimum threshold of ${MIN_FETCHED_THRESHOLD}.`);
  }

  // 1b. Verify structure of ingested inspection records
  console.log("\nVerifying inspection records structure...");
  let structureErrors = 0;
  for (const record of inspections) {
    if (record.allFetched && Array.isArray(record.inspections)) {
      for (const insp of record.inspections) {
        if (typeof insp.id !== "string" || !insp.id) {
          console.error(`[ERROR] Facility ${record.facilityId} has inspection with invalid or missing ID`);
          structureErrors++;
        }
        if (typeof insp.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(insp.date)) {
          console.error(`[ERROR] Facility ${record.facilityId} has inspection ${insp.id || "unknown"} with invalid or missing date format: ${insp.date}`);
          structureErrors++;
        }
        if (typeof insp.type !== "string" || !insp.type) {
          console.error(`[ERROR] Facility ${record.facilityId} has inspection ${insp.id || "unknown"} with invalid or missing type`);
          structureErrors++;
        }
        if (!Array.isArray(insp.contraventions)) {
          console.error(`[ERROR] Facility ${record.facilityId} has inspection ${insp.id} where contraventions is not an array`);
          structureErrors++;
        } else {
          for (const contra of insp.contraventions) {
            if (typeof contra.code !== "string" || !contra.code) {
              console.error(`[ERROR] Facility ${record.facilityId} has contravention with invalid or missing code`);
              structureErrors++;
            }
            if (typeof contra.description !== "string") {
              console.error(`[ERROR] Facility ${record.facilityId} has contravention ${contra.code} with invalid description`);
              structureErrors++;
            }
            if (typeof contra.observations !== "string") {
              console.error(`[ERROR] Facility ${record.facilityId} has contravention ${contra.code} with invalid observations`);
              structureErrors++;
            }
            if (typeof contra.correctByDate !== "string") {
              console.error(`[ERROR] Facility ${record.facilityId} has contravention ${contra.code} with invalid correctByDate`);
              structureErrors++;
            }
            if (typeof contra.corrected !== "boolean") {
              console.error(`[ERROR] Facility ${record.facilityId} has contravention ${contra.code} where corrected is not a boolean`);
              structureErrors++;
            }
          }
        }
      }
    }
  }
  if (structureErrors > 0) {
    console.error(`[ERROR] Found ${structureErrors} structural validation errors in inspections.json.`);
    hasErrors = true;
  } else {
    console.log("[OK] All fetched inspections have valid structures.");
  }

  // 2. Verify specific regression list of critical facilities
  const criticalList = [
    { id: "165", name: "Deep Cove Kids Club", allowEmpty: false },
    { id: "1315", name: "In The Garden Childcare Center", allowEmpty: false },
    { id: "853", name: "Pacific Heart Childcare Inc. (Mactavish)", allowEmpty: false },
    { id: "1066", name: "Victoria West Community Association-Victoria West Elementary School", allowEmpty: false },
    { id: "3886", name: "Wild Roots Child Care", allowEmpty: false },
    { id: "5488", name: "Kids & Company Victoria (Uptown)", allowEmpty: false },
    { id: "3004", name: "Hampton House Society", allowEmpty: false },
    { id: "4119", name: "CEFA University Heights", allowEmpty: true },
    { id: "5198", name: "Vme Montessori Educare", allowEmpty: false },
    { id: "2038", name: "Hamilton Park", allowEmpty: false },
    { id: "5805", name: "Karen Hambley Daycare", allowEmpty: false },
    { id: "1235", name: "Wiseways Childcare", allowEmpty: false },
    { id: "166", name: "Wiseways Preschool And Daycare", allowEmpty: false },
    { id: "3676", name: "Hans Helgesen YMCA - YWCA Child Care", allowEmpty: false },
    { id: "3016", name: "Metchosin Preschool", allowEmpty: false },
    { id: "5792", name: "Painted Turtle Early Childcare Centre", allowEmpty: false }
  ];

  console.log("\nVerifying critical facilities regression check...");
  for (const crit of criticalList) {
    const record = inspectionsMap.get(crit.id);
    if (!record) {
      console.error(`[ERROR] Critical facility ${crit.name} (ID: ${crit.id}) has no record in inspections.json!`);
      hasErrors = true;
    } else {
      if (!record.allFetched) {
        console.error(`[ERROR] Critical facility ${crit.name} (ID: ${crit.id}) is not fully fetched (allFetched: false).`);
        hasErrors = true;
      } else if (record.inspections.length === 0 && !crit.allowEmpty) {
        console.error(`[ERROR] Critical facility ${crit.name} (ID: ${crit.id}) has 0 inspections ingested, but it is known to have reports.`);
        hasErrors = true;
      } else {
        console.log(`[OK] Critical facility ${crit.name} (ID: ${crit.id}) has ${record.inspections.length} inspections.`);
      }
    }
  }

  if (hasErrors) {
    console.error("\n[FAIL] Ingested inspections validation failed.");
    process.exit(1);
  } else {
    console.log("\n[PASS] Ingested inspections validation passed successfully!");
    process.exit(0);
  }
}

main();
