import type { Facility } from "../types";

/** BC Child Care Map Data — where providers self-report vacancy to the province. */
export const BC_CHILD_CARE_DATASET_URL =
  "https://catalogue.data.gov.bc.ca/dataset/child-care-map-data";

export const BC_CHILD_CARE_MAP_URL =
  "https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/child-care-in-bc/child-care-map";

export const VACANCY_SOURCE_COPY =
  "Self-reported by the provider to the province via the BC Child Care Map.";

export const CONTACT_CENTRE_COPY =
  "Call or email the centre directly to confirm availability, fees, and waitlist status. Government records may not reflect current openings.";

export function hasVacancyReported(facility: Pick<Facility, "vacancyInd">): boolean {
  return facility.vacancyInd === "Y";
}

export function formatVacancyLastUpdated(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw.trim();
  return parsed.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function vacancyDetailLines(
  facility: Pick<Facility, "vacancyForLicense" | "vacancyLastUpdated">,
): string[] {
  const lines: string[] = [];
  if (facility.vacancyForLicense?.trim()) {
    lines.push(`Reported for: ${facility.vacancyForLicense.trim()}`);
  }
  const updated = formatVacancyLastUpdated(facility.vacancyLastUpdated);
  if (updated) {
    lines.push(`Last updated in registry: ${updated}`);
  }
  return lines;
}
