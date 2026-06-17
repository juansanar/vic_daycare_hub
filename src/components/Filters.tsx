import { useState, useMemo } from "react";
import type { FilterState } from "../lib/filters";
import { defaultFilters, getMunicipalities } from "../lib/filters";
import type { Facility, CRDRegion } from "../types";
import facilitiesData from "../../data/facilities.json";

const facilities = facilitiesData as Facility[];

interface FiltersProps {
  onChange?: (filters: FilterState) => void;
}

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
    <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
      <input
        type="text"
        placeholder="Search name, address, municipality..."
        value={filters.search}
        onChange={(e) => update({ search: e.target.value })}
        className="w-48 rounded border px-3 py-1.5 text-sm"
      />

      <select
        value={filters.region}
        onChange={(e) =>
          update({ region: e.target.value as CRDRegion | "all" })
        }
        className="rounded border px-2 py-1.5 text-sm"
      >
        <option value="all">All regions</option>
        <option value="core">Core (Victoria, Saanich, Oak Bay, Esquimalt, View Royal)</option>
        <option value="westshore">Westshore (Langford, Colwood, Metchosin, Highlands, Sooke)</option>
        <option value="peninsula">Peninsula (Sidney, North/Central Saanich)</option>
      </select>

      <select
        value={filters.municipality}
        onChange={(e) => update({ municipality: e.target.value })}
        className="rounded border px-2 py-1.5 text-sm"
      >
        <option value="">All municipalities</option>
        {municipalities.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={filters.ageGroup}
        onChange={(e) => update({ ageGroup: e.target.value })}
        className="rounded border px-2 py-1.5 text-sm"
      >
        <option value="">All ages</option>
        <option value="under 36">Under 36 months</option>
        <option value="3 to 5">3-5 years</option>
        <option value="school age">School age</option>
        <option value="multi age">Multi-age</option>
      </select>

      <label className="flex items-center gap-1.5 text-sm">
        <input
          type="checkbox"
          checked={filters.tenDollarOnly}
          onChange={(e) => update({ tenDollarOnly: e.target.checked })}
        />
        $10/day
      </label>

      <label className="flex items-center gap-1.5 text-sm">
        <input
          type="checkbox"
          checked={filters.vacancyOnly}
          onChange={(e) => update({ vacancyOnly: e.target.checked })}
        />
        Vacancy
      </label>

      <select
        value={filters.trackerStatus}
        onChange={(e) =>
          update({
            trackerStatus: e.target.value as FilterState["trackerStatus"],
          })
        }
        className="rounded border px-2 py-1.5 text-sm"
      >
        <option value="all">Any status</option>
        <option value="none">Not contacted</option>
        <option value="contacted">Contacted</option>
        <option value="called">Called</option>
        <option value="waitlisted">Waitlisted</option>
        <option value="enrolled">Enrolled</option>
        <option value="ruled_out">Ruled out</option>
      </select>
    </div>
  );
}
