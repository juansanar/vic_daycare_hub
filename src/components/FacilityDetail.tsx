import { useStore } from "../store";
import type { Facility, TrackerStatus } from "../types";
import facilitiesData from "../../data/facilities.json";

const facilities = facilitiesData as Facility[];

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

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold">{facility.name}</h2>
        <button
          onClick={() => setSelectedFacility(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          &times;
        </button>
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <p>{facility.address}, {facility.municipality} {facility.postalCode}</p>
        {facility.phone && <p>Phone: {facility.phone}</p>}
        {facility.email && <p>Email: {facility.email}</p>}
        {facility.website && (
          <a
            href={facility.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            Website
          </a>
        )}
        <p className="text-xs text-gray-400">{facility.serviceType}</p>
      </div>

      {facility.isTenDollarDay && (
        <p className="rounded bg-green-50 px-2 py-1 text-sm text-green-700">
          Verified $10/day ChildCareBC Centre
        </p>
      )}

      <a
        href={`https://inspections.myhealthdepartment.com/island-health/program-ccfl?facility_name=${encodeURIComponent(facility.name)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded bg-amber-50 px-2 py-1 text-sm text-amber-700 hover:bg-amber-100 transition"
      >
        View Island Health inspections &rarr;
      </a>

      <hr />

      {/* Tracker fields */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Your Tracker</h3>

        <label className="block text-sm">
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
            className="mt-1 block w-full rounded border px-2 py-1 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Waitlist date
          <input
            type="date"
            value={entry?.waitlistDate ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "waitlistDate", e.target.value)
            }
            className="mt-1 block w-full rounded border px-2 py-1 text-sm"
          />
        </label>

        <label className="block text-sm">
          Cost notes
          <input
            type="text"
            value={entry?.costNotes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "costNotes", e.target.value)
            }
            className="mt-1 block w-full rounded border px-2 py-1 text-sm"
          />
        </label>

        <label className="block text-sm">
          Food info
          <input
            type="text"
            value={entry?.foodNotes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "foodNotes", e.target.value)
            }
            className="mt-1 block w-full rounded border px-2 py-1 text-sm"
          />
        </label>

        <label className="block text-sm">
          CCFRI notes
          <input
            type="text"
            value={entry?.ccfriNotes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "ccfriNotes", e.target.value)
            }
            className="mt-1 block w-full rounded border px-2 py-1 text-sm"
          />
        </label>

        <label className="block text-sm">
          Notes
          <textarea
            value={entry?.notes ?? ""}
            onChange={(e) =>
              setTrackerField(facilityId, "notes", e.target.value)
            }
            rows={3}
            className="mt-1 block w-full rounded border px-2 py-1 text-sm"
          />
        </label>
      </div>
    </div>
  );
}
