import { useState } from "react";
import { useStore } from "../store";
import type {
  Facility,
  TrackerStatus,
  InspectionRecord,
  VacancyAgeStatuses,
  VacancyOverride,
} from "../types";
import { resolveAgeGroupLabels, parseIslandHealthServiceType } from "../lib/ages";
import { MunicipalityGlyph } from "./Icons";
import {
  BC_CHILD_CARE_MAP_URL,
  CONTACT_CENTRE_COPY,
  VACANCY_SOURCE_LEGEND,
  formatVacancyLastUpdated,
  formatRelativeAge,
  getVacancySourceMeta,
  isVacancyOverrideActive,
  resolveAgeStatuses,
  summarizeReportedAgeGroups,
} from "../lib/vacancy";
import facilitiesData from "../../data/facilities.json";
import inspectionsData from "../../data/inspections.json";

const facilities = facilitiesData as Facility[];
const inspections = inspectionsData as unknown as InspectionRecord[];

const inspectionMap = new Map<string, InspectionRecord>();
for (const rec of inspections) {
  inspectionMap.set(rec.facilityId, rec);
}

const STATUS_OPTIONS: { value: TrackerStatus; label: string }[] = [
  { value: "none", label: "Not contacted" },
  { value: "contacted", label: "Contacted" },
  { value: "called", label: "Called" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "enrolled", label: "Enrolled" },
  { value: "ruled_out", label: "Ruled out" },
];

export default function FacilityDetail({
  facilityId,
}: {
  facilityId: string;
}) {
  const facility = facilities.find((f) => f.id === facilityId);
  const trackerEntries = useStore((s) => s.trackerEntries);
  const vacancyOverrides = useStore((s) => s.vacancyOverrides);
  const vacancyReportsByFacility = useStore((s) => s.vacancyReportsByFacility);
  const clearVacancyReports = useStore((s) => s.clearVacancyReports);
  const setTrackerField = useStore((s) => s.setTrackerField);
  const setSelectedFacility = useStore((s) => s.setSelectedFacility);
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const setFeedbackOpen = useStore((s) => s.setFeedbackOpen);
  const setVacancyModalOpen = useStore((s) => s.setVacancyModalOpen);
  const [showVacancyHelp, setShowVacancyHelp] = useState(false);

  if (!facility) return null;

  const rawReports = vacancyReportsByFacility[facilityId] ?? [];
  const latestOverride = vacancyOverrides[facilityId];
  const activeReports: VacancyOverride[] = [
    ...rawReports.filter((r) => isVacancyOverrideActive(r)),
  ];
  if (
    latestOverride &&
    isVacancyOverrideActive(latestOverride) &&
    !activeReports.some(
      (r) =>
        (r.id && r.id === latestOverride.id) ||
        r.updatedAt === latestOverride.updatedAt,
    )
  ) {
    activeReports.unshift(latestOverride);
  }

  // Find the most recent community/provider report for each age group key
  const getLatestCommunityForAge = (
    key: keyof VacancyAgeStatuses,
  ): {
    status: "available" | "waitlist";
    report: VacancyOverride;
  } | null => {
    for (const rep of activeReports) {
      const statuses = resolveAgeStatuses(rep);
      const st = statuses[key];
      if (st === "available" || st === "waitlist") {
        return { status: st, report: rep };
      }
    }
    return null;
  };

  const entry = trackerEntries[facilityId];
  const inspection = inspectionMap.get(facilityId);


  const inspectionLink = inspection?.inspectionUrl
    ?? `https://inspections.myhealthdepartment.com/island-health/program-ccfl?facility_name=${encodeURIComponent(facility.name)}`;

  const ageLabels = resolveAgeGroupLabels(
    facility.ageGroups ?? [],
    inspection?.serviceType,
  );

  const servedIds = new Set<string>(facility.ageGroups ?? []);
  if (inspection?.serviceType) {
    for (const id of parseIslandHealthServiceType(inspection.serviceType)) {
      servedIds.add(id);
    }
  }

  const gridItems: {
    key: keyof VacancyAgeStatuses;
    label: string;
    served: boolean;
    officialVacant: boolean;
    community: {
      status: "available" | "waitlist";
      report: VacancyOverride;
    } | null;
  }[] = [
    {
      key: "under36",
      label: "Under 36 months",
      served:
        servedIds.has("under36") ||
        servedIds.has("familyChildCare") ||
        servedIds.has("multiAge"),
      officialVacant: facility.vacancyUnder36,
      community: getLatestCommunityForAge("under36"),
    },
    {
      key: "preschool30to5",
      label: "30 months – 5 years",
      served:
        servedIds.has("preschool30to5") ||
        servedIds.has("familyChildCare") ||
        servedIds.has("multiAge"),
      officialVacant: facility.vacancy30mos5yrs,
      community: getLatestCommunityForAge("preschool30to5"),
    },
    {
      key: "licPre",
      label: "Licensed preschool",
      served: servedIds.has("licensedPreschool"),
      officialVacant: facility.vacancyLicpre,
      community: getLatestCommunityForAge("licPre"),
    },
    {
      key: "schoolAge",
      label: "School age (Gr 1–12)",
      served:
        servedIds.has("schoolAge") ||
        servedIds.has("kindergarten") ||
        servedIds.has("familyChildCare") ||
        servedIds.has("multiAge"),
      officialVacant: facility.vacancyOosGr1Age12,
      community: getLatestCommunityForAge("schoolAge"),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-stone-100">{facility.name}</h2>
        <button
          onClick={() => setSelectedFacility(null)}
          className="rounded p-0.5 text-gray-300 transition hover:bg-stone-100 hover:text-gray-500 dark:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 text-xs text-gray-500 dark:text-stone-400">
        <p className="flex items-center gap-1.5">
          <MunicipalityGlyph municipality={facility.municipality} size={14} className="text-emerald-600 dark:text-emerald-450 shrink-0" />
          <span>{facility.address}, {facility.municipality} {facility.postalCode}</span>
        </p>
        {facility.phone && (
          <p>
            <a href={`tel:${facility.phone}`} className="text-emerald-600 hover:underline dark:text-emerald-450">
              {facility.phone}
            </a>
          </p>
        )}
        {facility.email && (
          <p>
            <a href={`mailto:${facility.email}`} className="text-emerald-600 hover:underline dark:text-emerald-450">
              {facility.email}
            </a>
          </p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {facility.website && (
            <a
              href={facility.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline dark:text-emerald-450"
            >
              Website ↗
            </a>
          )}
          {facility.lat && facility.lng && (
            <button
              onClick={() => {
                setActiveTab("map");
                setTimeout(() => {
                  window.dispatchEvent(
                    new CustomEvent("center-facility-on-map", {
                      detail: facilityId,
                    })
                  );
                }, 50);
              }}
              className="text-emerald-600 hover:underline text-left font-medium dark:text-emerald-450"
            >
              {activeTab === "map" ? "Center on map 🎯" : "Show on map 🗺️"}
            </button>
          )}
          <button
            onClick={() => setFeedbackOpen(true, facility.id, facility.name)}
            className="text-emerald-600 hover:underline text-left font-medium dark:text-emerald-450 cursor-pointer"
          >
            Suggest correction ✏️
          </button>
        </div>
        <p className="text-[11px] text-gray-300 dark:text-stone-600">{facility.serviceType}</p>
      </div>

      <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900/40">
        <p className="text-xs leading-relaxed text-gray-600 dark:text-stone-450">{CONTACT_CENTRE_COPY}</p>
      </div>

      {/* Age groups */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-350">
          Ages served
        </p>
        {ageLabels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {ageLabels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-200"
              >
                {label}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-stone-400 dark:text-stone-400">
            Not reported in government records
          </p>
        )}
      </div>

      {/* Availability Section */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3 dark:border-stone-800 dark:bg-stone-900/80">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-350">
              Availability
            </span>
            <button
              type="button"
              onClick={() => setShowVacancyHelp((v) => !v)}
              title="How availability sources work"
              aria-expanded={showVacancyHelp}
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold transition cursor-pointer ${
                showVacancyHelp
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              }`}
            >
              ?
            </button>
          </div>
          <button
            type="button"
            onClick={() => setVacancyModalOpen(true, facility.id)}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20 transition hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-500/30 dark:hover:bg-emerald-900/60 cursor-pointer"
          >
            + Report / Update
          </button>
        </div>

        {/* ? Popover Legend */}
        {showVacancyHelp && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-2 text-[11px] dark:border-stone-800 dark:bg-stone-950/80">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 dark:text-stone-100">
                Availability Sources Explained
              </span>
              <button
                type="button"
                onClick={() => setShowVacancyHelp(false)}
                className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <p className="text-[10px] leading-relaxed text-stone-500 dark:text-stone-400">
              We always keep the official BC Child Care Map record intact and display recent community or provider reports alongside it so you can compare both:
            </p>
            <div className="space-y-1.5 pt-0.5">
              {VACANCY_SOURCE_LEGEND.map((item) => (
                <div key={item.shortLabel} className="flex items-start gap-2">
                  <span className="text-xs leading-none mt-0.5 shrink-0">
                    {item.emoji}
                  </span>
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {item.fullLabel}:{" "}
                    </span>
                    <span className="text-stone-500 dark:text-stone-400">
                      {item.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Age Group Rows: Option A (Official 🏛️ + Inline Community Emoji Pill) */}
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {gridItems.map((item) => {
            const commMeta = item.community
              ? getVacancySourceMeta(item.community.report)
              : null;
            const commDate = item.community
              ? formatVacancyLastUpdated(item.community.report.updatedAt)
              : null;

            return (
              <div
                key={item.key}
                className="flex flex-wrap items-center justify-between gap-1.5 py-2 text-xs"
              >
                <span className="font-medium text-stone-700 dark:text-stone-200">
                  {item.label}
                </span>
                <div className="flex flex-wrap items-center justify-end gap-1">
                  {/* Official BC Child Care Map Baseline Pill (Always Preserved) */}
                  {item.served ? (
                    item.officialVacant ? (
                      <span
                        title={`Official BC Child Care Map${facility.vacancyLastUpdated ? ` (Updated ${facility.vacancyLastUpdated})` : ""}`}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-500/30"
                      >
                        <span>🏛️</span>
                        <span>Spaces available</span>
                      </span>
                    ) : (
                      <span
                        title={`Official BC Child Care Map${facility.vacancyLastUpdated ? ` (Updated ${facility.vacancyLastUpdated})` : ""}`}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-amber-600/10 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-500/30"
                      >
                        <span>🏛️</span>
                        <span>Waitlist</span>
                      </span>
                    )
                  ) : (
                    <span
                      title="Not listed in official BC Child Care Map"
                      className="inline-flex items-center gap-1 rounded-full bg-stone-50 px-2 py-0.5 text-[10px] font-normal text-stone-400 ring-1 ring-stone-500/5 dark:bg-stone-800/60 dark:text-stone-400 dark:ring-stone-500/20"
                    >
                      <span>🏛️</span>
                      <span>Not offered</span>
                    </span>
                  )}

                  {/* Inline Community / Provider Report Pill (When Reported for this Age Group) */}
                  {item.community && commMeta && (
                    <span
                      title={`${commMeta.fullLabel}${commDate ? ` (${commDate})` : ""}${item.community.report.note ? `: "${item.community.report.note}"` : ""}`}
                      className={
                        item.community.status === "available"
                          ? "inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold text-emerald-900 ring-1 ring-emerald-600/30 dark:bg-emerald-900/60 dark:text-emerald-200 dark:ring-emerald-400/40"
                          : "inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700 ring-1 ring-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
                      }
                    >
                      <span>{commMeta.emoji}</span>
                      <span>
                        {item.community.status === "available"
                          ? "Spaces open"
                          : "Full"}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Official BC Child Care Map Attribution (Always Kept with Caveats) */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] leading-relaxed text-stone-400 dark:text-stone-400">
          <span>
            🏛️ Official registry:{" "}
            <a
              href={BC_CHILD_CARE_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-600 hover:underline hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              BC Child Care Map ↗
            </a>
          </span>
          {facility.vacancyLastUpdated && (
            <span className="font-medium">
              Registry updated: {facility.vacancyLastUpdated}
            </span>
          )}
        </div>

        {/* Option B: Separate Community & Provider Reports Feed Below Official Table */}
        {activeReports.length > 0 && (
          <div className="border-t border-stone-100 pt-3 space-y-2 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Community &amp; Provider Reports ({activeReports.length})
              </span>
              <button
                type="button"
                onClick={() => clearVacancyReports(facility.id)}
                className="text-[10px] text-stone-400 hover:text-red-500 dark:text-stone-500 dark:hover:text-red-400 cursor-pointer"
                title="Clear local test reports for this facility"
              >
                Reset local
              </button>
            </div>
            <div className="space-y-2">
              {activeReports.map((rep, idx) => {
                const meta = getVacancySourceMeta(rep);
                const dateStr =
                  formatVacancyLastUpdated(rep.updatedAt) ?? rep.updatedAt;
                const relAge = formatRelativeAge(rep.updatedAt);
                const reportedGroups = summarizeReportedAgeGroups(rep);

                return (
                  <div
                    key={rep.id ?? `${rep.updatedAt}-${idx}`}
                    className={`rounded-xl border p-2.5 space-y-1.5 text-xs ${
                      rep.verifiedProvider
                        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/25"
                        : "border-stone-200 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-950/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-800 dark:text-stone-100">
                        <span>{meta.emoji}</span>
                        <span>{meta.fullLabel}</span>
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                        {dateStr}
                        {relAge ? ` · ${relAge}` : ""}
                      </span>
                    </div>

                    {reportedGroups.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {reportedGroups.map((g) => (
                          <span
                            key={g.key}
                            className={
                              g.status === "available"
                                ? "inline-flex items-center rounded-md bg-emerald-100/80 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "inline-flex items-center rounded-md bg-amber-100/70 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
                            }
                          >
                            {g.shortLabel}:{" "}
                            {g.status === "available"
                              ? "Spaces open"
                              : "Waitlist"}
                          </span>
                        ))}
                      </div>
                    )}

                    {rep.note && (
                      <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-300 italic">
                        &ldquo;{rep.note}&rdquo;
                      </p>
                    )}

                    {rep.vacancyInd === "Y" && (
                      <div className="flex justify-end pt-0.5">
                        <button
                          type="button"
                          onClick={() => setVacancyModalOpen(true, facility.id)}
                          className="text-[10px] font-medium text-stone-400 hover:text-emerald-600 dark:text-stone-500 dark:hover:text-emerald-400 cursor-pointer"
                        >
                          No longer available? Update status →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fees & Funding Card */}
      {facility.isTenDollarDay ? (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 space-y-1.5 shadow-sm dark:border-indigo-950/30 dark:bg-indigo-950/10">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shadow-sm dark:bg-indigo-900 dark:text-indigo-300">
              $
            </span>
            <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300">$10 a Day ChildCareBC</h4>
          </div>
          <p className="text-[11px] leading-relaxed text-indigo-700/90 font-medium dark:text-indigo-400/90">
            This facility is a participating $10/day childcare site. Full-time parent fees are capped at a maximum of $200 per month.
          </p>
        </div>
      ) : facility.isCcfri ? (
        <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 space-y-1.5 shadow-sm dark:border-sky-950/30 dark:bg-sky-950/10">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold shadow-sm dark:bg-sky-900 dark:text-sky-300">
              ✓
            </span>
            <h4 className="text-xs font-bold text-sky-800 dark:text-sky-300">CCFRI Participant</h4>
          </div>
          <p className="text-[11px] leading-relaxed text-sky-700/90 font-medium dark:text-sky-400/90">
            Participates in the Child Care Fee Reduction Initiative. Eligible families receive direct fee reductions (up to $900/month) applied directly to their invoices.
          </p>
        </div>
      ) : null}

      {/* Inspection Section */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3 dark:border-stone-800 dark:bg-stone-900/80">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-350">
            Inspection History
          </span>
          <a
            href={inspectionLink}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="text-[11px] font-medium text-emerald-600 hover:underline hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Island Health Records ↗
          </a>
        </div>

        {inspection && inspection.inspections && inspection.inspections.length > 0 ? (
          <div className="space-y-2">
            {inspection.inspections.slice(0, 6).map((insp, index) => {
              const violationCount = insp.contraventions.length;
              const uncorrectedCount = insp.contraventions.filter((c) => !c.corrected).length;
              const reportUrl = insp.id && insp.id !== "migrated-unknown-id"
                ? `https://inspections.myhealthdepartment.com/island-health/program-ccfl/inspection/?inspectionID=${insp.id}`
                : inspection.inspectionUrl;

              return (
                <details
                  key={insp.id || index}
                  className="group rounded-xl border border-stone-200 bg-stone-50 overflow-hidden [&_summary::-webkit-details-marker]:hidden dark:border-stone-800 dark:bg-stone-900/90"
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer items-center justify-between p-3 select-none hover:bg-stone-100 dark:hover:bg-stone-800 transition">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-100">
                        {insp.date}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-350 font-medium">
                        {insp.type} Inspection
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {violationCount === 0 ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200/50 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60">
                          No violations
                        </span>
                      ) : uncorrectedCount === 0 ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200/50 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60">
                          Contraventions corrected
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/70">
                          {uncorrectedCount} outstanding infraction{uncorrectedCount > 1 ? "s" : ""}
                        </span>
                      )}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-stone-400 transition-transform group-open:rotate-180 dark:text-stone-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  <div className="border-t border-stone-200 bg-white p-3 space-y-3 dark:border-stone-800 dark:bg-stone-900">
                    {violationCount === 0 ? (
                      <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-2.5 flex items-start gap-2 dark:bg-emerald-950/30 dark:border-emerald-900/50">
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                        <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300 font-medium">
                          No violations found during this inspection.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {insp.contraventions.map((c, i) => (
                          <div key={i} className="space-y-1 text-[11px] border-b border-stone-100 dark:border-stone-800 last:border-0 pb-2.5 last:pb-0">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                                {c.code}
                              </span>
                              {c.corrected ? (
                                <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-950/40 dark:text-emerald-300">
                                  Corrected
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-950/40 dark:text-amber-300">
                                  Outstanding
                                </span>
                              )}
                            </div>
                            {c.description && (
                              <p className="text-stone-600 dark:text-stone-300 leading-normal font-medium">
                                {c.description}
                              </p>
                            )}
                            {c.corrected && c.correctiveActions && (
                              <div className="bg-emerald-50/40 dark:bg-emerald-950/30 border-l-2 border-emerald-400 dark:border-emerald-600 p-2 rounded">
                                <span className="block text-[9px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider mb-0.5">Corrective Action Taken</span>
                                <p className="text-emerald-900 dark:text-emerald-200 leading-normal font-medium">
                                  {c.correctiveActions}
                                </p>
                              </div>
                            )}
                            {c.observations && (
                              <div className="bg-stone-50 dark:bg-stone-800 border-l-2 border-stone-300 dark:border-stone-600 p-2 rounded-r">
                                <span className="block text-[10px] text-stone-500 dark:text-stone-350 font-bold uppercase tracking-wider mb-0.5">Observations</span>
                                <p className="text-stone-700 dark:text-stone-200 italic leading-relaxed">
                                  {c.observations}
                                </p>
                              </div>
                            )}
                            {!c.corrected && c.correctByDate && (
                              <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                                To be corrected by: {c.correctByDate}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                      <a
                        href={reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="text-[11px] font-semibold text-emerald-600 hover:underline hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-0.5"
                      >
                        View official report ↗
                      </a>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-stone-400 dark:text-stone-400">
            No inspection data available yet
          </p>
        )}
      </div>

      <hr className="border-stone-200 dark:border-stone-800" />

      {/* Tracker fields */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-350">
          Your Tracker
        </h3>

        <label className="block text-xs text-gray-600 dark:text-stone-400">
          Status
          <select
            value={entry?.status ?? "none"}
            onChange={(e) =>
              setTrackerField(
                facilityId,
                "status",
                e.target.value as TrackerStatus,
              )
            }
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-emerald-700 dark:focus:ring-emerald-800/40"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="dark:bg-stone-900">
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-gray-600 dark:text-stone-400">
          Waitlist date
          <input
            type="date"
            value={entry?.waitlistDate ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "waitlistDate", e.target.value)
            }
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-emerald-700 dark:focus:ring-emerald-800/40"
          />
        </label>

        <label className="block text-xs text-gray-600 dark:text-stone-400">
          Cost notes
          <input
            type="text"
            value={entry?.costNotes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "costNotes", e.target.value)
            }
            placeholder="e.g. $1200/month infant"
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs placeholder:text-gray-300 dark:placeholder:text-stone-600 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-emerald-700 dark:focus:ring-emerald-800/40"
          />
        </label>

        <label className="block text-xs text-gray-600 dark:text-stone-400">
          Food info
          <input
            type="text"
            value={entry?.foodNotes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "foodNotes", e.target.value)
            }
            placeholder="e.g. Lunch & snacks provided"
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs placeholder:text-gray-300 dark:placeholder:text-stone-600 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-emerald-700 dark:focus:ring-emerald-800/40"
          />
        </label>

        <label className="block text-xs text-gray-600 dark:text-stone-400">
          CCFRI notes
          <input
            type="text"
            value={entry?.ccfriNotes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "ccfriNotes", e.target.value)
            }
            placeholder="e.g. Fee reduction applied"
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs placeholder:text-gray-300 dark:placeholder:text-stone-600 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-emerald-700 dark:focus:ring-emerald-800/40"
          />
        </label>

        <label className="block text-xs text-gray-600 dark:text-stone-400">
          Notes
          <textarea
            value={entry?.notes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "notes", e.target.value)
            }
            rows={3}
            placeholder="Any other details..."
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs placeholder:text-gray-300 dark:placeholder:text-stone-600 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-emerald-700 dark:focus:ring-emerald-800/40"
          />
        </label>
      </div>
    </div>
  );
}
