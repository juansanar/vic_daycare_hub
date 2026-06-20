import { useStore } from "../store";
import type { Facility, TrackerStatus, InspectionRecord } from "../types";
import { resolveAgeGroupLabels, parseIslandHealthServiceType } from "../lib/ages";
import { MunicipalityGlyph } from "./Icons";
import {
  BC_CHILD_CARE_MAP_URL,
  CONTACT_CENTRE_COPY,
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
  const setTrackerField = useStore((s) => s.setTrackerField);
  const setSelectedFacility = useStore((s) => s.setSelectedFacility);
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);

  if (!facility) return null;

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

  const gridItems = [
    {
      label: "Under 36 months",
      served: servedIds.has("under36") || servedIds.has("familyChildCare") || servedIds.has("multiAge"),
      vacant: facility.vacancyUnder36,
    },
    {
      label: "30 months – 5 years",
      served: servedIds.has("preschool30to5") || servedIds.has("familyChildCare") || servedIds.has("multiAge"),
      vacant: facility.vacancy30mos5yrs,
    },
    {
      label: "Licensed preschool",
      served: servedIds.has("licensedPreschool"),
      vacant: facility.vacancyLicpre,
    },
    {
      label: "School age (Gr 1–12)",
      served: servedIds.has("schoolAge") || servedIds.has("kindergarten") || servedIds.has("familyChildCare") || servedIds.has("multiAge"),
      vacant: facility.vacancyOosGr1Age12,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">{facility.name}</h2>
        <button
          onClick={() => setSelectedFacility(null)}
          className="rounded p-0.5 text-gray-300 transition hover:bg-stone-100 hover:text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 text-xs text-gray-500">
        <p className="flex items-center gap-1.5">
          <MunicipalityGlyph municipality={facility.municipality} size={14} className="text-emerald-600 shrink-0" />
          <span>{facility.address}, {facility.municipality} {facility.postalCode}</span>
        </p>
        {facility.phone && (
          <p>
            <a href={`tel:${facility.phone}`} className="text-emerald-600 hover:underline">
              {facility.phone}
            </a>
          </p>
        )}
        {facility.email && (
          <p>
            <a href={`mailto:${facility.email}`} className="text-emerald-600 hover:underline">
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
              className="text-emerald-600 hover:underline"
            >
              Website ↗
            </a>
          )}
          {facility.lat && facility.lng && (
            <button
              onClick={() => setActiveTab("map")}
              className="text-emerald-600 hover:underline text-left font-medium"
            >
              {activeTab === "map" ? "Centered on map 🎯" : "Show on map 🗺️"}
            </button>
          )}
        </div>
        <p className="text-[11px] text-gray-300">{facility.serviceType}</p>
      </div>

      <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
        <p className="text-xs leading-relaxed text-gray-600">{CONTACT_CENTRE_COPY}</p>
      </div>

      {/* Age groups */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          Ages served
        </p>
        {ageLabels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {ageLabels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600"
              >
                {label}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400">
            Not reported in government records
          </p>
        )}
      </div>

      {/* Availability Section */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Availability
          </span>
          {facility.vacancyLastUpdated && (
            <span className="text-[10px] text-gray-400">
              Updated: {facility.vacancyLastUpdated}
            </span>
          )}
        </div>
        
        <div className="divide-y divide-stone-100">
          {gridItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 text-xs">
              <span className="font-medium text-gray-700">{item.label}</span>
              {item.served ? (
                item.vacant ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/10 animate-pulse">
                    Spaces available
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-amber-600/10">
                    No spaces (Waitlist)
                  </span>
                )
              ) : (
                <span className="inline-flex items-center rounded-full bg-stone-50 px-2.5 py-0.5 text-[10px] font-normal text-stone-400 ring-1 ring-stone-500/5">
                  Not offered
                </span>
              )}
            </div>
          ))}
        </div>
        
        <p className="text-[10px] leading-relaxed text-gray-400">
          Source:{" "}
          <a
            href={BC_CHILD_CARE_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-600 hover:underline hover:text-emerald-700"
          >
            BC Child Care Map ↗
          </a>
        </p>
      </div>

      {/* Fees & Funding Card */}
      {facility.isTenDollarDay ? (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shadow-sm">
              $
            </span>
            <h4 className="text-xs font-bold text-indigo-800">$10 a Day ChildCareBC</h4>
          </div>
          <p className="text-[11px] leading-relaxed text-indigo-700/90 font-medium">
            This facility is a participating $10/day childcare site. Full-time parent fees are capped at a maximum of $200 per month.
          </p>
        </div>
      ) : facility.isCcfri ? (
        <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold shadow-sm">
              ✓
            </span>
            <h4 className="text-xs font-bold text-sky-800">CCFRI Participant</h4>
          </div>
          <p className="text-[11px] leading-relaxed text-sky-700/90 font-medium">
            Participates in the Child Care Fee Reduction Initiative. Eligible families receive direct fee reductions (up to $900/month) applied directly to their invoices.
          </p>
        </div>
      ) : null}

      {/* Inspection Section */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Inspection History
          </span>
          <a
            href={inspectionLink}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="text-[11px] font-medium text-emerald-600 hover:underline hover:text-emerald-700"
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
                  className="group rounded-lg border border-stone-200 bg-stone-50 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer items-center justify-between p-3 select-none hover:bg-stone-100 transition">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-gray-700">
                        {insp.date}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {insp.type} Inspection
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {violationCount === 0 ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200/50">
                          No violations
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                          {violationCount} infraction{violationCount > 1 ? "s" : ""}
                          {uncorrectedCount > 0 && ` (${uncorrectedCount} outstanding)`}
                        </span>
                      )}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  <div className="border-t border-stone-200 bg-white p-3 space-y-3">
                    {violationCount === 0 ? (
                      <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-2.5 flex items-start gap-2">
                        <span className="text-emerald-600 text-xs">✓</span>
                        <p className="text-[11px] leading-relaxed text-emerald-800 font-medium">
                          No violations found during this inspection.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {insp.contraventions.map((c, i) => (
                          <div key={i} className="space-y-1 text-[11px] border-b border-stone-100 last:border-0 pb-2.5 last:pb-0">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-gray-800 block">
                                {c.code}
                              </span>
                              {c.corrected ? (
                                <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 ring-1 ring-emerald-600/10">
                                  Corrected
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 ring-1 ring-amber-600/10">
                                  Outstanding
                                </span>
                              )}
                            </div>
                            {c.description && (
                              <p className="text-gray-500 leading-normal font-medium">
                                {c.description}
                              </p>
                            )}
                            {c.observations && (
                              <div className="bg-stone-50 border-l-2 border-stone-300 p-1.5 rounded-r">
                                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Observations</span>
                                <p className="text-gray-600 italic leading-relaxed">
                                  {c.observations}
                                </p>
                              </div>
                            )}
                            {!c.corrected && c.correctByDate && (
                              <p className="text-[10px] text-amber-600 font-medium">
                                To be corrected by: {c.correctByDate}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pt-1.5 border-t border-stone-100 flex justify-end">
                      <a
                        href={reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="text-[11px] font-semibold text-emerald-600 hover:underline hover:text-emerald-700 flex items-center gap-0.5"
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
          <p className="text-[11px] text-gray-400">
            No inspection data available yet
          </p>
        )}
      </div>

      <hr className="border-stone-200" />

      {/* Tracker fields */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Your Tracker
        </h3>

        <label className="block text-xs text-gray-600">
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
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-gray-600">
          Waitlist date
          <input
            type="date"
            value={entry?.waitlistDate ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "waitlistDate", e.target.value)
            }
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none"
          />
        </label>

        <label className="block text-xs text-gray-600">
          Cost notes
          <input
            type="text"
            value={entry?.costNotes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "costNotes", e.target.value)
            }
            placeholder="e.g. $1200/month infant"
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs placeholder:text-gray-300 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none"
          />
        </label>

        <label className="block text-xs text-gray-600">
          Food info
          <input
            type="text"
            value={entry?.foodNotes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "foodNotes", e.target.value)
            }
            placeholder="e.g. Lunch & snacks provided"
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs placeholder:text-gray-300 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none"
          />
        </label>

        <label className="block text-xs text-gray-600">
          CCFRI notes
          <input
            type="text"
            value={entry?.ccfriNotes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "ccfriNotes", e.target.value)
            }
            placeholder="e.g. Fee reduction applied"
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs placeholder:text-gray-300 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none"
          />
        </label>

        <label className="block text-xs text-gray-600">
          Notes
          <textarea
            value={entry?.notes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "notes", e.target.value)
            }
            rows={3}
            placeholder="Any other details..."
            className="mt-1 block w-full rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs placeholder:text-gray-300 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
}
