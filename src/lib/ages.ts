export const AGE_GROUPS = [
  { id: "under36", label: "Under 36 months", filterValue: "under 36" },
  { id: "preschool30to5", label: "30 months – 5 years", filterValue: "3 to 5" },
  { id: "licensedPreschool", label: "Licensed preschool", filterValue: "preschool" },
  { id: "kindergarten", label: "Kindergarten", filterValue: "kindergarten" },
  { id: "schoolAge", label: "School age (Gr 1–12)", filterValue: "school age" },
  { id: "multiAge", label: "Multi-age", filterValue: "multi age" },
  { id: "familyChildCare", label: "Family child care", filterValue: "family" },
] as const;

export type AgeGroupId = (typeof AGE_GROUPS)[number]["id"];

export function getAgeGroupLabels(ageGroups: readonly string[]): string[] {
  return AGE_GROUPS.filter((g) => ageGroups.includes(g.id)).map((g) => g.label);
}

export function parseIslandHealthServiceType(serviceType: string): string[] {
  if (!serviceType) return [];
  const groups = new Set<string>();
  const lower = serviceType.toLowerCase();

  if (/under\s*36|301\b/.test(lower)) groups.add("under36");
  if (/30\s*month|3\s*to\s*5|302\b|3\s*years?\s*to\s*kindergarten/.test(lower))
    groups.add("preschool30to5");
  if (/licensed\s*preschool|303\b/.test(lower)) groups.add("licensedPreschool");
  if (/kindergarten|oos.*kinder/.test(lower)) groups.add("kindergarten");
  if (/school\s*age|305\b|grade\s*1|age\s*12/.test(lower)) groups.add("schoolAge");
  if (/306\b|multi[\s-]?age/.test(lower)) groups.add("multiAge");
  if (/304\b|family\s*child\s*care/.test(lower)) groups.add("familyChildCare");

  return AGE_GROUPS.filter((g) => groups.has(g.id)).map((g) => g.id);
}

export function resolveAgeGroupLabels(
  facilityAgeGroups: readonly string[],
  islandHealthServiceType?: string,
): string[] {
  const merged = new Set(facilityAgeGroups);
  for (const id of parseIslandHealthServiceType(islandHealthServiceType ?? "")) {
    merged.add(id);
  }
  return getAgeGroupLabels([...merged]);
}

export function facilityMatchesAgeFilter(
  facilityAgeGroups: readonly string[],
  filterValue: string,
  islandHealthServiceType?: string,
): boolean {
  const merged = new Set(facilityAgeGroups);
  for (const id of parseIslandHealthServiceType(islandHealthServiceType ?? "")) {
    merged.add(id);
  }
  const ageGroups = [...merged];
  if (!filterValue) return true;
  if (filterValue === "multi age") {
    return ageGroups.includes("multiAge") || ageGroups.length >= 2;
  }
  if (filterValue === "family") return ageGroups.includes("familyChildCare");
  const match = AGE_GROUPS.find((g) => g.filterValue === filterValue);
  if (!match) return true;
  if (filterValue === "school age") {
    return ageGroups.includes("schoolAge") || ageGroups.includes("kindergarten");
  }
  return ageGroups.includes(match.id);
}
