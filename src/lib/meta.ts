import meta from "../../data/meta.json";

export interface MetaData {
  lastUpdated: string;
  count: number;
}

export const datasetMeta = meta as MetaData;

/**
 * Returns a human-readable date string representing when the dataset was last updated.
 * Example: "July 17, 2026"
 */
export function formatDataLastUpdated(options?: Intl.DateTimeFormatOptions): string {
  if (!datasetMeta.lastUpdated) return "recently";
  const date = new Date(datasetMeta.lastUpdated);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleDateString("en-US", options ?? {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
