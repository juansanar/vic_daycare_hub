import {
  collection,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  VacancyAgeStatuses,
  VacancyOverride,
  VacancyReporterRole,
} from "../types";
import { isVacancyOverrideActive } from "./vacancy";

export const VACANCY_OVERRIDE_TTL_DAYS = 30;

export interface VacancyReportInput {
  facilityId: string;
  facilityName: string;
  facilityEmail?: string;
  ageStatuses: VacancyAgeStatuses;
  reporterRole: VacancyReporterRole;
  reporterName?: string;
  reporterEmail?: string;
  reporterUid?: string | null;
  note?: string;
}

export interface VacancyReportResult {
  success: boolean;
  autoApproved: boolean;
  verifiedProvider: boolean;
  override: VacancyOverride;
  fallbackUsed?: boolean;
}

export function doesEmailMatchFacility(
  facilityEmail?: string,
  reporterEmail?: string,
): boolean {
  if (!facilityEmail?.trim() || !reporterEmail?.trim()) return false;
  return (
    facilityEmail.trim().toLowerCase() === reporterEmail.trim().toLowerCase()
  );
}

export function buildVacancyOverride(
  input: VacancyReportInput,
  now: Date = new Date(),
): {
  override: VacancyOverride;
  autoApproved: boolean;
  verifiedProvider: boolean;
} {
  const emailMatched = doesEmailMatchFacility(
    input.facilityEmail,
    input.reporterEmail,
  );
  const isSignedIn = Boolean(input.reporterUid);
  const verifiedProvider =
    emailMatched || (isSignedIn && input.reporterRole === "provider");
  const autoApproved = isSignedIn || emailMatched;

  const { ageStatuses } = input;
  const vacancyUnder36 = ageStatuses.under36 === "available";
  const vacancy30mos5yrs = ageStatuses.preschool30to5 === "available";
  const vacancyLicpre = ageStatuses.licPre === "available";
  const vacancyOosGr1Age12 = ageStatuses.schoolAge === "available";

  const anyVacancy =
    vacancyUnder36 ||
    vacancy30mos5yrs ||
    vacancyLicpre ||
    vacancyOosGr1Age12;

  const updatedAt = now.toISOString();
  const expiresDate = new Date(
    now.getTime() + VACANCY_OVERRIDE_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  const expiresAt = expiresDate.toISOString();

  const override: VacancyOverride = {
    id: `${input.facilityId}-${now.getTime()}`,
    facilityId: input.facilityId,
    facilityName: input.facilityName,
    vacancyInd: anyVacancy ? "Y" : "N",
    vacancyUnder36,
    vacancy30mos5yrs,
    vacancyLicpre,
    vacancyOosGr1Age12,
    ageStatuses,
    reporterRole: input.reporterRole,
    verifiedProvider,
    ...(input.note?.trim() ? { note: input.note.trim().slice(0, 2000) } : {}),
    updatedAt,
    expiresAt,
  };

  return { override, autoApproved, verifiedProvider };
}

/**
 * Submits a community or provider vacancy update.
 * - Hybrid publishing flow:
 *   - Auto-approved & goes live immediately in `/vacancyOverrides/{facilityId}` if the
 *     reporter is signed in OR their email matches the facility's registered email.
 *   - Otherwise saved as `status: "pending"` in `/vacancySubmissions` for moderation.
 */
export async function submitVacancyReport(
  input: VacancyReportInput,
): Promise<VacancyReportResult> {
  const { override, autoApproved, verifiedProvider } =
    buildVacancyOverride(input);

  if (!db) {
    return {
      success: true,
      autoApproved,
      verifiedProvider,
      override,
      fallbackUsed: true,
    };
  }

  try {
    const submissionPayload: Record<string, unknown> = {
      ...override,
      status: autoApproved ? "approved" : "pending",
      reporterName: input.reporterName?.trim() || "",
      reporterEmail: input.reporterEmail?.trim() || "",
      reporterUid: input.reporterUid || "",
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "vacancySubmissions"), submissionPayload);

    if (autoApproved) {
      await setDoc(doc(db, "vacancyOverrides", input.facilityId), override);
    }

    return {
      success: true,
      autoApproved,
      verifiedProvider,
      override,
    };
  } catch (error) {
    console.error("Failed to submit vacancy report to Firestore:", error);
    return {
      success: true,
      autoApproved,
      verifiedProvider,
      override,
      fallbackUsed: true,
    };
  }
}

/**
 * Subscribes to live `/vacancyOverrides` in Firestore and filters out expired entries.
 */
export function subscribeToVacancyOverrides(
  onUpdate: (overrides: Record<string, VacancyOverride>) => void,
): Unsubscribe | null {
  if (!db) return null;

  try {
    const colRef = collection(db, "vacancyOverrides");
    return onSnapshot(
      colRef,
      (snapshot) => {
        const active: Record<string, VacancyOverride> = {};
        const now = new Date();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as VacancyOverride;
          if (data && data.facilityId && isVacancyOverrideActive(data, now)) {
            active[data.facilityId] = data;
          }
        });
        onUpdate(active);
      },
      (err) => {
        console.warn("Vacancy overrides listener error:", err);
      },
    );
  } catch (err) {
    console.warn("Could not subscribe to vacancy overrides:", err);
    return null;
  }
}
