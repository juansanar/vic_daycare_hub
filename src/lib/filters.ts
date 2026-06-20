import type { Facility, TrackerEntry, TrackerStatus, CRDRegion, InspectionRecord } from "../types";
import { facilityMatchesAgeFilter } from "./ages";
import inspectionsData from "../../data/inspections.json";

const inspections = inspectionsData as unknown as InspectionRecord[];
const inspectionServiceTypeByFacility = new Map(
  inspections.map((r) => [r.facilityId, r.serviceType]),
);

export interface FilterState {
  region: CRDRegion | "all";
  municipality: string;
  ageGroup: string;
  tenDollarOnly: boolean;
  vacancyOnly: boolean;
  trackerStatus: TrackerStatus | "all";
  search: string;
}

export const defaultFilters: FilterState = {
  region: "all",
  municipality: "",
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
    if (filters.region !== "all" && f.region !== filters.region) return false;

    if (filters.municipality && f.municipality !== filters.municipality)
      return false;

    if (
      filters.ageGroup &&
      !facilityMatchesAgeFilter(
        f.ageGroups ?? [],
        filters.ageGroup,
        inspectionServiceTypeByFacility.get(f.id),
      )
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
      const haystack =
        `${f.name} ${f.address} ${f.municipality} ${f.locality}`.toLowerCase();
      if (!haystack.includes(searchLower)) return false;
    }

    return true;
  });
}

export function getMunicipalities(
  facilities: Facility[],
  region: CRDRegion | "all",
): string[] {
  const set = new Set<string>();
  facilities.forEach((f) => {
    if (region === "all" || f.region === region) {
      set.add(f.municipality);
    }
  });
  return Array.from(set).sort();
}
