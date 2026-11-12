import { useState, useEffect } from "react";
import { useStore } from "../store";
import { useAuth } from "../lib/auth";
import type {
  AgeVacancyStatus,
  Facility,
  VacancyAgeStatuses,
  VacancyReporterRole,
} from "../types";
import {
  submitVacancyReport,
  doesEmailMatchFacility,
} from "../lib/vacancyReport";
import facilitiesData from "../../data/facilities.json";

const facilities = facilitiesData as Facility[];

const ROLE_OPTIONS: {
  value: VacancyReporterRole;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    value: "provider",
    label: "Facility Staff / Provider",
    desc: "I work at or manage this child care facility",
    icon: "🏫",
  },
  {
    value: "facebook",
    label: "Facebook Group Post",
    desc: "Spotted an opening posted in a local childcare Facebook group",
    icon: "📣",
  },
  {
    value: "parent",
    label: "Parent / Community",
    desc: "Called, toured, or received a waitlist update from this centre",
    icon: "👨‍👩‍👧",
  },
];

export default function VacancyModal() {
  const isVacancyModalOpen = useStore((s) => s.isVacancyModalOpen);
  const vacancyFacilityId = useStore((s) => s.vacancyFacilityId);
  const setVacancyModalOpen = useStore((s) => s.setVacancyModalOpen);
  const setVacancyOverride = useStore((s) => s.setVacancyOverride);
  const user = useAuth((s) => s.user);

  const rawFacility = facilities.find((f) => f.id === vacancyFacilityId);

  const [role, setRole] = useState<VacancyReporterRole>("provider");
  const [ageStatuses, setAgeStatuses] = useState<VacancyAgeStatuses>({
    under36: "unreported",
    preschool30to5: "unreported",
    licPre: "unreported",
    schoolAge: "unreported",
  });
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    autoApproved: boolean;
    verifiedProvider: boolean;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isVacancyModalOpen && rawFacility) {
      setRole("provider");
      setAgeStatuses({
        under36: "unreported",
        preschool30to5: "unreported",
        licPre: "unreported",
        schoolAge: "unreported",
      });
      setNote("");
      setName(user?.displayName ?? "");
      setEmail(user?.email ?? "");
      setSubmitResult(null);
      setErrorMsg("");
    }
  }, [isVacancyModalOpen, rawFacility?.id, user?.displayName, user?.email]);

  if (!isVacancyModalOpen || !rawFacility) return null;

  const emailMatchesFacility = doesEmailMatchFacility(
    rawFacility.email,
    email,
  );
  const willAutoPublish = Boolean(user?.uid) || emailMatchesFacility;

  const handleClose = () => {
    setVacancyModalOpen(false, null);
    setSubmitResult(null);
    setErrorMsg("");
  };

  const setGroupStatus = (
    key: keyof VacancyAgeStatuses,
    status: AgeVacancyStatus,
  ) => {
    setAgeStatuses((prev) => ({ ...prev, [key]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const anyGroupSelected = Object.values(ageStatuses).some(
      (s) => s !== "unreported",
    );
    if (!anyGroupSelected && !note.trim()) {
      setErrorMsg(
        "Please select availability for at least one age group or add a note.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await submitVacancyReport({
        facilityId: rawFacility.id,
        facilityName: rawFacility.name,
        facilityEmail: rawFacility.email,
        ageStatuses,
        reporterRole: role,
        reporterName: name,
        reporterEmail: email,
        reporterUid: user?.uid ?? null,
        note,
      });

      if (res.success) {
        setVacancyOverride(rawFacility.id, res.override);
        setSubmitResult({
          autoApproved: res.autoApproved,
          verifiedProvider: res.verifiedProvider,
        });
      } else {
        setErrorMsg("Could not submit update. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ageRows: {
    key: keyof VacancyAgeStatuses;
    label: string;
    officialVacant: boolean;
  }[] = [
    {
      key: "under36",
      label: "Under 36 months",
      officialVacant: rawFacility.vacancyUnder36,
    },
    {
      key: "preschool30to5",
      label: "30 months – 5 years",
      officialVacant: rawFacility.vacancy30mos5yrs,
    },
    {
      key: "licPre",
      label: "Licensed preschool",
      officialVacant: rawFacility.vacancyLicpre,
    },
    {
      key: "schoolAge",
      label: "School age (Gr 1–12)",
      officialVacant: rawFacility.vacancyOosGr1Age12,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-300 dark:bg-black/75"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl transition-all duration-300 dark:border-stone-800 dark:bg-stone-900">
        <div className="h-1.5 w-full bg-emerald-600 dark:bg-emerald-700" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-stone-50">
                {submitResult
                  ? "Availability Report Added"
                  : "Report / Update Availability"}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                {rawFacility.name} · {rawFacility.municipality}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-gray-400 hover:bg-stone-100 hover:text-gray-600 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300"
              aria-label="Close modal"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {submitResult ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-stone-100">
                {submitResult.verifiedProvider
                  ? "🏫 Verified Provider Report Published!"
                  : submitResult.autoApproved
                    ? "Community Report Published Live!"
                    : "Submitted for Review (Shown in Your View)"}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-stone-400 max-w-sm">
                {submitResult.autoApproved
                  ? "Your report now appears alongside the official BC Child Care Map record for the next 30 days. Thank you for helping local families!"
                  : "Your report is now shown alongside the BC Child Care Map record on your device and queued for quick verification before publishing globally."}
              </p>
              <button
                onClick={handleClose}
                className="mt-6 rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                  1. Source of this report
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {ROLE_OPTIONS.map((opt) => {
                    const active = role === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRole(opt.value)}
                        className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition cursor-pointer ${
                          active
                            ? "border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600 dark:border-emerald-500 dark:bg-emerald-950/30 dark:ring-emerald-500"
                            : "border-stone-200 bg-stone-50/60 hover:bg-stone-100/70 dark:border-stone-800 dark:bg-stone-900/50 dark:hover:bg-stone-800"
                        }`}
                      >
                        <span className="text-sm mb-0.5">{opt.icon}</span>
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {opt.label}
                        </span>
                        <span className="text-[10px] leading-snug text-stone-500 dark:text-stone-400 mt-0.5">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Per-age-group toggles */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    2. Which age groups are you reporting on?
                  </label>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">
                    Official 🏛️ BC Registry stays intact
                  </span>
                </div>
                <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-stone-50/50 px-3 dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-950/50">
                  {ageRows.map((row) => {
                    const current = ageStatuses[row.key];
                    return (
                      <div
                        key={row.key}
                        className="flex flex-wrap items-center justify-between py-2.5 gap-2"
                      >
                        <div>
                          <span className="text-xs font-medium text-stone-700 dark:text-stone-200 block">
                            {row.label}
                          </span>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500">
                            🏛️ Official:{" "}
                            {row.officialVacant ? "Spaces available" : "Waitlist"}
                          </span>
                        </div>
                        <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5 dark:border-stone-800 dark:bg-stone-900">
                          <button
                            type="button"
                            onClick={() => setGroupStatus(row.key, "available")}
                            className={`rounded-md px-2 py-1 text-[10px] font-semibold transition cursor-pointer ${
                              current === "available"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                            }`}
                          >
                            Spaces open
                          </button>
                          <button
                            type="button"
                            onClick={() => setGroupStatus(row.key, "waitlist")}
                            className={`rounded-md px-2 py-1 text-[10px] font-semibold transition cursor-pointer ${
                              current === "waitlist"
                                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200"
                                : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                            }`}
                          >
                            Full / Waitlist
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setGroupStatus(row.key, "unreported")
                            }
                            className={`rounded-md px-2 py-1 text-[10px] font-medium transition cursor-pointer ${
                              current === "unreported"
                                ? "bg-stone-200/80 text-stone-700 dark:bg-stone-800 dark:text-stone-200"
                                : "text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300"
                            }`}
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Note / Facebook Post Details */}
              <div>
                <label
                  htmlFor="vacancy-note"
                  className="block text-xs font-medium text-gray-600 dark:text-stone-300 mb-1"
                >
                  Details or Note (Optional)
                </label>
                <textarea
                  id="vacancy-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    role === "facebook"
                      ? 'e.g. Pasted from Facebook group: "2 full-time toddler spots open starting Dec 1, call 250-..."'
                      : 'e.g. "2 full-time spots opening Jan 1 for 30m–5y. Call or email to book a tour."'
                  }
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:placeholder-stone-600 dark:focus:border-emerald-600"
                />
              </div>

              {/* Contact / Verification */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="vacancy-name"
                    className="block text-xs font-medium text-gray-600 dark:text-stone-300 mb-1"
                  >
                    Your Name (Optional)
                  </label>
                  <input
                    id="vacancy-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:placeholder-stone-600 dark:focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="vacancy-email"
                    className="block text-xs font-medium text-gray-600 dark:text-stone-300 mb-1"
                  >
                    Email Address (Optional)
                  </label>
                  <input
                    id="vacancy-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === "provider" && rawFacility.email
                        ? "Enter facility email to auto-verify"
                        : "jane@example.com"
                    }
                    className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:placeholder-stone-600 dark:focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Verification Status Callout */}
              <div
                className={`rounded-xl border p-2.5 text-[11px] leading-relaxed ${
                  willAutoPublish
                    ? "border-emerald-200 bg-emerald-50/60 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-400"
                }`}
              >
                {emailMatchesFacility ? (
                  <span>
                    🏫 <strong>Verified Facility Email:</strong> Matches registered centre email. This report will go live immediately with a <strong>Verified Centre</strong> badge alongside the BC Registry status.
                  </span>
                ) : user?.uid ? (
                  <span>
                    ✓ <strong>Signed-in contributor:</strong> Your report will publish live alongside the BC Registry status for 30 days.
                  </span>
                ) : (
                  <span>
                    💡 <strong>How reports appear:</strong> Community reports are displayed alongside the official 🏛️ BC Child Care Map status so parents can see both sources.
                  </span>
                )}
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 font-medium" role="alert">
                  {errorMsg}
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-lg border border-stone-200 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-stone-100 disabled:opacity-50 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Submit Report"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
