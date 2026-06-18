import { useStore } from "../store";
import type { Facility, TrackerStatus, InspectionRecord } from "../types";
import { resolveAgeGroupLabels } from "../lib/ages";
import facilitiesData from "../../data/facilities.json";
import inspectionsData from "../../data/inspections.json";

const facilities = facilitiesData as Facility[];
const inspections = inspectionsData as InspectionRecord[];

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

  if (!facility) return null;

  const entry = trackerEntries[facilityId];
  const inspection = inspectionMap.get(facilityId);

  const inspectionLink = inspection?.inspectionUrl
    ?? `https://inspections.myhealthdepartment.com/island-health/program-ccfl?facility_name=${encodeURIComponent(facility.name)}`;

  const uncorrectedContraventions = inspection?.contraventions.filter((c) => !c.corrected) ?? [];
  const ageLabels = resolveAgeGroupLabels(
    facility.ageGroups ?? [],
    inspection?.serviceType,
  );

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
      <div className="space-y-1 text-xs text-gray-500">
        <p>{facility.address}, {facility.municipality} {facility.postalCode}</p>
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
        {facility.website && (
          <a
            href={facility.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-emerald-600 hover:underline"
          >
            Website ↗
          </a>
        )}
        <p className="text-[11px] text-gray-300">{facility.serviceType}</p>
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

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {facility.isTenDollarDay && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            $10/day ChildCareBC
          </span>
        )}
        {facility.vacancyInd === "Y" && (
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700">
            Vacancy reported
          </span>
        )}
      </div>

      {/* Inspection Section */}
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Inspections
          </span>
          <a
            href={inspectionLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-emerald-600 hover:underline"
          >
            View on Island Health ↗
          </a>
        </div>

        {inspection && inspection.lastInspectionDate ? (
          <>
            <p className="text-xs text-gray-500">
              Last inspected: {inspection.lastInspectionDate} ({inspection.lastInspectionType})
            </p>
            {uncorrectedContraventions.length > 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-2">
                <p className="text-xs font-medium text-amber-800">
                  {uncorrectedContraventions.length} outstanding issue{uncorrectedContraventions.length > 1 ? "s" : ""}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {uncorrectedContraventions.map((c, i) => (
                    <li key={i} className="text-[11px] text-amber-700">
                      <span className="font-medium">{c.code}</span>
                      {c.description && `: ${c.description}`}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                No outstanding issues
              </p>
            )}
          </>
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
