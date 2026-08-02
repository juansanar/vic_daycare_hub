import { useState, useMemo } from "react";
import type { FilterState } from "../lib/filters";
import { defaultFilters, getMunicipalities } from "../lib/filters";
import type { Facility, CRDRegion } from "../types";
import { BC_CHILD_CARE_MAP_URL } from "../lib/vacancy";
import facilitiesData from "../../data/facilities.json";

const facilities = facilitiesData as Facility[];

interface FiltersProps {
  onChange?: (filters: FilterState) => void;
}

const selectClasses =
  "rounded-full border border-stone-200/80 bg-white/90 px-3 py-1.5 text-xs text-stone-700 focus:border-stone-400 focus:ring-1 focus:ring-stone-200 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:focus:border-stone-600 dark:focus:ring-stone-800 cursor-pointer";

export default function Filters({ onChange }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const municipalities = useMemo(
    () => getMunicipalities(facilities, filters.region),
    [filters.region],
  );

  const update = (partial: Partial<FilterState>) => {
    const next = { ...filters, ...partial };
    if (partial.region !== undefined && partial.municipality === undefined) {
      next.municipality = "";
    }
    setFilters(next);
    onChange?.(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-stone-200/80 bg-white/80 px-4 py-2.5 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80">
      <input
        type="text"
        placeholder="Search facilities..."
        value={filters.search}
        onChange={(e) => update({ search: e.target.value })}
        className="w-44 rounded-full border border-stone-200/80 bg-white/90 px-3.5 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:ring-1 focus:ring-stone-200 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-600 dark:focus:border-stone-600"
      />

      <select
        value={filters.region}
        onChange={(e) =>
          update({ region: e.target.value as CRDRegion | "all" })
        }
        className={selectClasses}
      >
        <option value="all" className="dark:bg-stone-900">All regions</option>
        <option value="core" className="dark:bg-stone-900">Core</option>
        <option value="westshore" className="dark:bg-stone-900">Westshore</option>
        <option value="peninsula" className="dark:bg-stone-900">Peninsula</option>
      </select>

      <select
        value={filters.municipality}
        onChange={(e) => update({ municipality: e.target.value })}
        className={selectClasses}
      >
        <option value="" className="dark:bg-stone-900">All municipalities</option>
        {municipalities.map((m) => (
          <option key={m} value={m} className="dark:bg-stone-900">
            {m}
          </option>
        ))}
      </select>

      <select
        value={filters.ageGroup}
        onChange={(e) => update({ ageGroup: e.target.value })}
        className={selectClasses}
      >
        <option value="" className="dark:bg-stone-900">All ages</option>
        <option value="under 36" className="dark:bg-stone-900">Under 36 months</option>
        <option value="3 to 5" className="dark:bg-stone-900">3-5 years</option>
        <option value="school age" className="dark:bg-stone-900">School age</option>
        <option value="multi age" className="dark:bg-stone-900">Multi-age</option>
      </select>

      <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-stone-400">
        <input
          type="checkbox"
          checked={filters.tenDollarOnly}
          onChange={(e) => update({ tenDollarOnly: e.target.checked })}
          className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-200 dark:border-stone-700 dark:focus:ring-emerald-800/40"
        />
        $10/day
      </label>

      <label
        className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 cursor-pointer"
        title="Vacancies are self-reported by providers to the Province of British Columbia (BC Child Care Map)"
      >
        <input
          type="checkbox"
          checked={filters.vacancyOnly}
          onChange={(e) => update({ vacancyOnly: e.target.checked })}
          className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-200 dark:border-stone-700 dark:focus:ring-emerald-800/40"
        />
        Vacancy
      </label>

      {filters.vacancyOnly && (
        <span className="text-[10px] text-stone-500 dark:text-stone-400">
          From{" "}
          <a
            href={BC_CHILD_CARE_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 font-medium hover:underline dark:text-emerald-400"
          >
            BC Child Care Map
          </a>
          {" "}(provider self-reported to the Province of BC)
        </span>
      )}

      <select
        value={filters.trackerStatus}
        onChange={(e) =>
          update({
            trackerStatus: e.target.value as FilterState["trackerStatus"],
          })
        }
        className={selectClasses}
      >
        <option value="all" className="dark:bg-stone-900">Any status</option>
        <option value="none" className="dark:bg-stone-900">Not contacted</option>
        <option value="contacted" className="dark:bg-stone-900">Contacted</option>
        <option value="called" className="dark:bg-stone-900">Called</option>
        <option value="waitlisted" className="dark:bg-stone-900">Waitlisted</option>
        <option value="enrolled" className="dark:bg-stone-900">Enrolled</option>
        <option value="ruled_out" className="dark:bg-stone-900">Ruled out</option>
      </select>
    </div>
  );
}
