import { useState } from "react";
import { useStore } from "../store";
import { filterFacilities, defaultFilters } from "../lib/filters";
import type { FilterState } from "../lib/filters";
import type { Facility, InspectionRecord } from "../types";
import { hasVacancyReported } from "../lib/vacancy";
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
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      <Filters onChange={setFilters} />
      <div className="flex-1 overflow-y-auto">
        <p className="px-4 py-2 text-xs text-gray-400">
          {filtered.length} facilities
        </p>
        <ul className="divide-y divide-stone-100">
          {filtered.map((f) => {
            const inspection = inspectionMap.get(f.id);
            const latestInspection = inspection?.inspections?.[0];
            const hasWarning = latestInspection?.contraventions?.some((c) => !c.corrected) ?? false;
            return (
              <li
                key={f.id}
                onClick={() => setSelectedFacility(f.id)}
                className={`cursor-pointer px-4 py-3 transition hover:bg-stone-50 ${
                  selectedFacilityId === f.id ? "bg-emerald-50/60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {f.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-gray-400">
                      <span className="truncate">{f.address}</span>
                      <span className="inline-block h-2.5 w-px bg-stone-200" />
                      <span className="flex items-center gap-1 text-gray-500 font-medium">
                        <MunicipalityGlyph municipality={f.municipality} size={11} className="text-emerald-600 shrink-0" />
                        {f.municipality}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-300">
                      {f.serviceType}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {f.isTenDollarDay && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                        $10/day
                      </span>
                    )}
                    {hasVacancyReported(f) && (
                      <span
                        className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700"
                        title="Self-reported by the provider to BC's Child Care Map"
                      >
                        Vacancy
                      </span>
                    )}
                    {hasWarning && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
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
