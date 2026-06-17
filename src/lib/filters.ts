import type { Facility, TrackerEntry, TrackerStatus } from "../types";

export interface FilterState {
  area: "all" | "victoria" | "westshore";
  ageGroup: string;
  tenDollarOnly: boolean;
  vacancyOnly: boolean;
  trackerStatus: TrackerStatus | "all";
  search: string;
}

export const defaultFilters: FilterState = {
  area: "all",
  ageGroup: "",
  tenDollarOnly: false,
  vacancyOnly: false,
  trackerStatus: "all",
  search: "",
};

export function filterFacilities(
  facilities: Facility[],
  filters: FilterState,
  trackerEntries: Record<string, TrackerEntry>,
): Facility[] {
  const searchLower = filters.search.toLowerCase().trim();

  return facilities.filter((f) => {
    if (filters.area !== "all" && f.area !== filters.area) return false;

    if (
      filters.ageGroup &&
      !f.serviceType.toLowerCase().includes(filters.ageGroup.toLowerCase())
    )
      return false;

    if (filters.tenDollarOnly && !f.isTenDollarDay) return false;

    if (filters.vacancyOnly && f.vacancyInd !== "Y") return false;

    if (filters.trackerStatus !== "all") {
      const entry = trackerEntries[f.id];
      const status = entry?.status ?? "none";
      if (status !== filters.trackerStatus) return false;
    }

    if (searchLower) {
      const haystack = `${f.name} ${f.address} ${f.locality}`.toLowerCase();
      if (!haystack.includes(searchLower)) return false;
    }

    return true;
  });
}
