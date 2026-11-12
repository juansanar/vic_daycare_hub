/**
 * Compares data/facilities.json and data/inspections.json against git HEAD (or a specified git ref)
 * and outputs a Markdown report of all added/removed facilities and new/updated inspections.
 *
 * Run with: npm run diff-report
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../data");

function loadJsonFromGit(ref: string, relPath: string): any[] {
  try {
    const raw = execSync(`git show ${ref}:${relPath}`, {
      encoding: "utf-8",
      maxBuffer: 50 * 1024 * 1024,
    });
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function main() {
  const ref =
    process.argv.find((a) => a.startsWith("--ref="))?.split("=")[1] || "HEAD";
  const outArg = process.argv.find((a) => a.startsWith("--out="))?.split("=")[1];

  const oldFacilities = loadJsonFromGit(ref, "data/facilities.json");
  const oldInspections = loadJsonFromGit(ref, "data/inspections.json");

  const newFacilities: any[] = JSON.parse(
    readFileSync(resolve(DATA_DIR, "facilities.json"), "utf-8"),
  );
  const newInspections: any[] = JSON.parse(
    readFileSync(resolve(DATA_DIR, "inspections.json"), "utf-8"),
  );

  const oldFacById = new Map(oldFacilities.map((f) => [f.id, f]));
  const newFacById = new Map(newFacilities.map((f) => [f.id, f]));

  const oldInspByFacId = new Map(oldInspections.map((r) => [r.facilityId, r]));
  const newInspByFacId = new Map(newInspections.map((r) => [r.facilityId, r]));

  const addedFacilities = newFacilities.filter((f) => !oldFacById.has(f.id));
  const removedFacilities = oldFacilities.filter((f) => !newFacById.has(f.id));

  const newlyMatchedInspections: {
    facility: any;
    record: any;
  }[] = [];

  const newInspectionReports: {
    facility: any;
    inspection: any;
    isNewFacility: boolean;
  }[] = [];

  const updatedContraventions: {
    facility: any;
    inspection: any;
    code: string;
    change: string;
  }[] = [];

  for (const rec of newInspections) {
    const fac = newFacById.get(rec.facilityId) || {
      id: rec.facilityId,
      name: `Facility ${rec.facilityId}`,
      municipality: "Unknown",
    };
    const oldRec = oldInspByFacId.get(rec.facilityId);
    const isNewFac = !oldFacById.has(rec.facilityId);

    if (!oldRec && !isNewFac) {
      newlyMatchedInspections.push({ facility: fac, record: rec });
    }

    const oldInspById = new Map<string, any>(
      (oldRec?.inspections || []).map((i: any) => [i.id, i]),
    );

    for (const insp of rec.inspections || []) {
      const oldInsp = oldInspById.get(insp.id);
      if (!oldInsp) {
        newInspectionReports.push({
          facility: fac,
          inspection: insp,
          isNewFacility: isNewFac,
        });
      } else {
        const oldContraByCode = new Map<string, any>(
          (oldInsp.contraventions || []).map((c: any) => [c.code, c]),
        );
        for (const c of insp.contraventions || []) {
          const oldC = oldContraByCode.get(c.code);
          if (oldC && !oldC.corrected && c.corrected) {
            updatedContraventions.push({
              facility: fac,
              inspection: insp,
              code: c.code,
              change: "Marked as corrected",
            });
          }
        }
      }
    }
  }

  newInspectionReports.sort((a, b) =>
    b.inspection.date.localeCompare(a.inspection.date),
  );

  const lines: string[] = [];
  const nowStr = new Date().toISOString().split("T")[0];
  lines.push(`# Data Refresh Change Report (${nowStr})`);
  lines.push("");
  lines.push(`- **Facilities**: ${oldFacilities.length} → **${newFacilities.length}** (${addedFacilities.length >= 0 ? `+${addedFacilities.length}` : addedFacilities.length} added, -${removedFacilities.length} removed)`);
  lines.push(`- **Matched Inspection Profiles**: ${oldInspections.length} → **${newInspections.length}**`);
  lines.push(`- **New Inspection Reports Added**: **${newInspectionReports.length}**`);
  lines.push(`- **Newly Matched Existing Facilities**: **${newlyMatchedInspections.length}**`);
  lines.push(`- **Contraventions Newly Marked Corrected**: **${updatedContraventions.length}**`);
  lines.push("");

  if (addedFacilities.length > 0) {
    lines.push(`## 🆕 New Facilities Added (${addedFacilities.length})`);
    lines.push("");
    lines.push("| Facility | Address | Municipality | Type | Reports |");
    lines.push("| :--- | :--- | :--- | :--- | :---: |");
    for (const f of addedFacilities) {
      const inspRec = newInspByFacId.get(f.id);
      const count = inspRec?.inspections?.length ?? 0;
      lines.push(
        `| **${f.name}** (\`${f.id}\`) | ${f.address} | ${f.municipality} | ${f.serviceType} | ${count} |`,
      );
    }
    lines.push("");
  }

  if (newlyMatchedInspections.length > 0) {
    lines.push(
      `## 🔗 Existing Facilities Newly Linked to Island Health (${newlyMatchedInspections.length})`,
    );
    lines.push("");
    lines.push("| Facility | Municipality | Inspections Found | Latest Inspection |");
    lines.push("| :--- | :--- | :---: | :---: |");
    for (const { facility, record } of newlyMatchedInspections) {
      const latest = record.inspections?.[0]?.date || "None";
      lines.push(
        `| **${facility.name}** (\`${facility.id}\`) | ${facility.municipality} | ${record.inspections?.length || 0} | ${latest} |`,
      );
    }
    lines.push("");
  }

  if (newInspectionReports.length > 0) {
    const withContraventions = newInspectionReports.filter(
      (r) => (r.inspection.contraventions?.length || 0) > 0,
    );
    lines.push(
      `## 📋 New Inspection Reports (${newInspectionReports.length} total, ${withContraventions.length} with contraventions)`,
    );
    lines.push("");
    lines.push("| Date | Facility | Municipality | Type | Contraventions |");
    lines.push("| :---: | :--- | :--- | :--- | :---: |");
    for (const r of newInspectionReports.slice(0, 100)) {
      const cLen = r.inspection.contraventions?.length || 0;
      const uncorrectedLen = (r.inspection.contraventions || []).filter(
        (c: any) => !c.corrected,
      ).length;
      const badge =
        cLen === 0
          ? "0"
          : uncorrectedLen > 0
            ? `**${cLen}** (${uncorrectedLen} uncorrected)`
            : `${cLen} (all corrected)`;
      lines.push(
        `| ${r.inspection.date} | **${r.facility.name}** | ${r.facility.municipality} | ${r.inspection.type} | ${badge} |`,
      );
    }
    if (newInspectionReports.length > 100) {
      lines.push(
        `| ... | *and ${newInspectionReports.length - 100} more inspection reports* | | | |`,
      );
    }
    lines.push("");
  }

  const reportMd = lines.join("\n");
  console.log(reportMd);

  if (outArg) {
    writeFileSync(resolve(process.cwd(), outArg), reportMd);
    console.log(`\nWrote diff report to ${outArg}`);
  }
}

main();

