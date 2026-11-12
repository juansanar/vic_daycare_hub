import type {
  Facility,
  VacancyAgeStatuses,
  VacancyOverride,
} from "../types";

/** BC Child Care Map Data — where providers self-report vacancy to the province. */
export const BC_CHILD_CARE_DATASET_URL =
  "https://catalogue.data.gov.bc.ca/dataset/child-care-map-data";

export const BC_CHILD_CARE_MAP_URL =
  "https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/child-care-in-bc/child-care-map";

export const VACANCY_SOURCE_COPY =
  "Self-reported by the provider to the Province of British Columbia (BC Child Care Map).";

export const CONTACT_CENTRE_COPY =
  "Call or email the centre directly to confirm availability, fees, and waitlist status. Government records may not reflect current openings.";

export interface VacancySourceMeta {
  emoji: string;
  shortLabel: string;
  fullLabel: string;
  description: string;
}

export const VACANCY_SOURCE_LEGEND: VacancySourceMeta[] = [
  {
    emoji: "🏛️",
    shortLabel: "BC Registry",
    fullLabel: "BC Child Care Map (Official)",
    description:
      "Self-reported by the provider to the Province of BC. Often lags behind real-time openings.",
  },
  {
    emoji: "🏫",
    shortLabel: "Facility Staff",
    fullLabel: "Reported by Facility Staff",
    description:
      "Submitted directly on Victoria Childcare Hub by centre staff (marked 'Verified Centre' when matching the facility's registered email).",
  },
  {
    emoji: "📣",
    shortLabel: "Facebook Group",
    fullLabel: "Spotted on Facebook Group",
    description:
      "Reported from a provider's availability post in a local Victoria childcare Facebook group.",
  },
  {
    emoji: "👨‍👩‍👧",
    shortLabel: "Parent Report",
    fullLabel: "Reported by Parent",
    description:
      "Shared by a parent who recently called, toured, or received a waitlist update from the facility.",
  },
];

export function getVacancySourceMeta(
  override: Pick<VacancyOverride, "reporterRole" | "verifiedProvider">,
): VacancySourceMeta {
  if (override.verifiedProvider) {
    return {
      emoji: "🏫",
      shortLabel: "Verified Centre",
      fullLabel: "Verified by Centre Staff",
      description:
        "Verified via the facility's registered email address on Victoria Childcare Hub.",
    };
  }
  switch (override.reporterRole) {
    case "provider":
      return {
        emoji: "🏫",
        shortLabel: "Staff Report",
        fullLabel: "Reported by Facility Staff",
        description: "Submitted by staff at this child care facility.",
      };
    case "facebook":
      return {
        emoji: "📣",
        shortLabel: "Facebook Post",
        fullLabel: "Spotted on Facebook Group",
        description:
          "Spotted in a local Victoria childcare Facebook group post.",
      };
    case "parent":
      return {
        emoji: "👨‍👩‍👧",
        shortLabel: "Parent Report",
        fullLabel: "Reported by Parent",
        description:
          "Reported by a parent who called, visited, or heard from the centre.",
      };
  }
}

export function hasVacancyReported(
  facility: Pick<Facility, "vacancyInd" | "communityVacancy">,
): boolean {
  return (
    facility.vacancyInd === "Y" ||
    facility.communityVacancy?.vacancyInd === "Y"
  );
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

export function isVacancyOverrideActive(
  override?: VacancyOverride | null,
  now: Date = new Date(),
): boolean {
  if (!override) return false;
  const expires = new Date(override.expiresAt);
  if (Number.isNaN(expires.getTime())) return true;
  return expires.getTime() > now.getTime();
}

export function formatVacancySourceLabel(override: VacancyOverride): string {
  const meta = getVacancySourceMeta(override);
  return `${meta.emoji} ${meta.fullLabel}`;
}

export function resolveAgeStatuses(
  override: VacancyOverride,
): VacancyAgeStatuses {
  if (override.ageStatuses) {
    return override.ageStatuses;
  }
  return {
    under36: override.vacancyUnder36 ? "available" : "waitlist",
    preschool30to5: override.vacancy30mos5yrs ? "available" : "waitlist",
    licPre: override.vacancyLicpre ? "available" : "waitlist",
    schoolAge: override.vacancyOosGr1Age12 ? "available" : "waitlist",
  };
}

export function summarizeReportedAgeGroups(
  override: VacancyOverride,
): { key: keyof VacancyAgeStatuses; label: string; shortLabel: string; status: "available" | "waitlist" }[] {
  const statuses = resolveAgeStatuses(override);
  const defs: {
    key: keyof VacancyAgeStatuses;
    label: string;
    shortLabel: string;
  }[] = [
    { key: "under36", label: "Under 36 months", shortLabel: "<36m" },
    { key: "preschool30to5", label: "30 months – 5 years", shortLabel: "30m–5y" },
    { key: "licPre", label: "Licensed preschool", shortLabel: "Preschool" },
    { key: "schoolAge", label: "School age (Gr 1–12)", shortLabel: "School age" },
  ];

  const items: {
    key: keyof VacancyAgeStatuses;
    label: string;
    shortLabel: string;
    status: "available" | "waitlist";
  }[] = [];

  for (const d of defs) {
    const st = statuses[d.key];
    if (st === "available" || st === "waitlist") {
      items.push({ ...d, status: st });
    }
  }
  return items;
}

/**
 * Attaches `communityVacancy` to a Facility while keeping the official
 * BC Child Care Map fields (`vacancyUnder36`, `vacancyLastUpdated`, etc.) intact!
 * Only `vacancyInd` is promoted to `"Y"` if a community report indicates an opening,
 * so the "Vacancy" filter includes both official and community-reported openings.
 */
export function applyVacancyOverride(
  facility: Facility,
  override?: VacancyOverride | null,
): Facility {
  if (!override || !isVacancyOverrideActive(override)) {
    return facility;
  }
  return {
    ...facility,
    vacancyInd:
      facility.vacancyInd === "Y" || override.vacancyInd === "Y"
        ? "Y"
        : facility.vacancyInd,
    communityVacancy: override,
  };
}

export function applyVacancyOverridesToList(
  facilities: Facility[],
  overrides: Record<string, VacancyOverride>,
): Facility[] {
  if (!overrides || Object.keys(overrides).length === 0) return facilities;
  return facilities.map((f) => applyVacancyOverride(f, overrides[f.id]));
}
