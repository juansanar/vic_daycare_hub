import { useState } from "react";
import { useStore } from "../store";
import { filterFacilities, defaultFilters } from "../lib/filters";
import type { FilterState } from "../lib/filters";
import type { Facility, InspectionRecord } from "../types";
import { hasVacancyReported } from "../lib/vacancy";
import { formatDataLastUpdated } from "../lib/meta";
import facilitiesData from "../../data/facilities.json";
import inspectionsData from "../../data/inspections.json";
import Filters from "./Filters";
import { MunicipalityGlyph } from "./Icons";


const facilities = facilitiesData as Facility[];
const inspections = inspectionsData as unknown as InspectionRecord[];

const inspectionMap = new Map<string, InspectionRecord>();
for (const rec of inspections) {
  inspectionMap.set(rec.facilityId, rec);
}

export default function FacilityList() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const trackerEntries = useStore((s) => s.trackerEntries);
  const setSelectedFacility = useStore((s) => s.setSelectedFacility);
  const selectedFacilityId = useStore((s) => s.selectedFacilityId);

  const filtered = filterFacilities(facilities, filters, trackerEntries);

  return (
    <div className="flex flex-1 flex-col overflow-hidden theme-bg theme-transition">
      <Filters onChange={setFilters} />
      <div className="flex-1 overflow-y-auto px-2 py-1">
        <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          <span>Showing {filtered.length} facilities</span>
          <span className="text-[11px] font-normal tracking-normal text-stone-400 dark:text-stone-500">
            Data updated {formatDataLastUpdated()}
          </span>
        </div>
        <ul className="space-y-1.5 pb-4">
          {filtered.map((f) => {
            const inspection = inspectionMap.get(f.id);
            const latestInspection = inspection?.inspections?.[0];
            const hasWarning = latestInspection?.contraventions?.some((c) => !c.corrected) ?? false;
            const isSelected = selectedFacilityId === f.id;
            return (
              <li
                key={f.id}
                onClick={() => setSelectedFacility(f.id)}
                className={`cursor-pointer rounded-2xl px-4 py-3.5 transition-all duration-200 border ${
                  isSelected
                    ? "bg-white border-stone-900 shadow-sm dark:bg-stone-800 dark:border-stone-100"
                    : "bg-white/60 border-stone-200/70 hover:bg-white hover:border-stone-300 dark:bg-stone-900/40 dark:border-stone-800/80 dark:hover:bg-stone-900 dark:hover:border-stone-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-heading truncate text-sm font-bold text-stone-900 dark:text-stone-100">
                      {f.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-stone-500 dark:text-stone-400">
                      <span className="truncate">{f.address}</span>
                      <span className="inline-block h-2.5 w-px bg-stone-300 dark:bg-stone-700" />
                      <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300 font-medium">
                        <MunicipalityGlyph municipality={f.municipality} size={11} className="text-amber-600 dark:text-amber-400 shrink-0" />
                        {f.municipality}
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-stone-400 dark:text-stone-500">
                      {f.serviceType}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {f.isTenDollarDay && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                        $10/day
                      </span>
                    )}
                    {hasVacancyReported(f) && (
                      <span
                        className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        title="Self-reported by provider to the Province of British Columbia (BC Child Care Map)"
                      >
                        Vacancy
                      </span>
                    )}
                    {hasWarning && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                        ⚠ Issue
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
