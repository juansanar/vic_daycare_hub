import { useState } from "react";
import { useStore } from "../store";
import { filterFacilities, defaultFilters } from "../lib/filters";
import type { FilterState } from "../lib/filters";
import type { Facility } from "../types";
import facilitiesData from "../../data/facilities.json";
import Filters from "./Filters";

const facilities = facilitiesData as Facility[];

export default function FacilityList() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const trackerEntries = useStore((s) => s.trackerEntries);
  const setSelectedFacility = useStore((s) => s.setSelectedFacility);
  const selectedFacilityId = useStore((s) => s.selectedFacilityId);

  const filtered = filterFacilities(facilities, filters, trackerEntries);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Filters onChange={setFilters} />
      <div className="flex-1 overflow-y-auto">
        <p className="px-4 py-2 text-sm text-gray-500">
          {filtered.length} facilities
        </p>
        <ul className="divide-y">
          {filtered.map((f) => (
            <li
              key={f.id}
              onClick={() => setSelectedFacility(f.id)}
              className={`cursor-pointer px-4 py-3 hover:bg-gray-50 ${
                selectedFacilityId === f.id ? "bg-indigo-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{f.name}</p>
                  <p className="text-sm text-gray-500">
                    {f.address}, {f.municipality}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {f.serviceType}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {f.isTenDollarDay && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      $10/day
                    </span>
                  )}
                  {f.vacancyInd === "Y" && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Vacancy
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
