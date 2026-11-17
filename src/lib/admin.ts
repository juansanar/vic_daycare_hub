import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import type { VacancyOverride } from "../types";
import { VACANCY_OVERRIDE_TTL_DAYS } from "./vacancyReport";

export const ADMIN_EMAIL = "jucamilo.sanchez@gmail.com";

export function isAdminUser(user: User | null | undefined): boolean {
  return Boolean(
    user?.email && user.email.trim().toLowerCase() === ADMIN_EMAIL,
  );
}

export interface VacancySubmissionDoc extends VacancyOverride {
  docId: string;
  status: "pending" | "approved" | "rejected";
  reporterName?: string;
  reporterEmail?: string;
  reporterUid?: string;
  createdAtMs: number;
}

export interface FeedbackDoc {
  docId: string;
  name?: string;
  email?: string;
  type: "correction" | "bug" | "suggestion" | "other" | string;
  facilityId?: string;
  facilityName?: string;
  message: string;
  url?: string;
  resolved?: boolean;
  createdAtMs: number;
}

function extractTimestampMs(rawCreatedAt: unknown, fallbackIso?: string): number {
  if (
    rawCreatedAt &&
    typeof rawCreatedAt === "object" &&
    "toMillis" in rawCreatedAt &&
    typeof (rawCreatedAt as { toMillis: () => number }).toMillis === "function"
  ) {
    return (rawCreatedAt as { toMillis: () => number }).toMillis();
  }
  if (fallbackIso) {
    const parsed = Date.parse(fallbackIso);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

export async function fetchVacancySubmissions(): Promise<VacancySubmissionDoc[]> {
  if (!db) return [];
  const snap = await getDocs(collection(db, "vacancySubmissions"));
  const list: VacancySubmissionDoc[] = [];
  snap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    list.push({
      docId: d.id,
      id: (data.id as string) || d.id,
      facilityId: String(data.facilityId ?? ""),
      facilityName: String(data.facilityName ?? "Unknown facility"),
      vacancyInd: (data.vacancyInd as "Y" | "N") ?? "N",
      vacancyUnder36: Boolean(data.vacancyUnder36),
      vacancy30mos5yrs: Boolean(data.vacancy30mos5yrs),
      vacancyLicpre: Boolean(data.vacancyLicpre),
      vacancyOosGr1Age12: Boolean(data.vacancyOosGr1Age12),
      ageStatuses: data.ageStatuses as VacancyOverride["ageStatuses"],
      reporterRole: (data.reporterRole as VacancyOverride["reporterRole"]) ?? "parent",
      verifiedProvider: Boolean(data.verifiedProvider),
      note: typeof data.note === "string" ? data.note : undefined,
      updatedAt: String(data.updatedAt ?? ""),
      expiresAt: String(data.expiresAt ?? ""),
      status:
        (data.status as VacancySubmissionDoc["status"]) ?? "pending",
      reporterName:
        typeof data.reporterName === "string" ? data.reporterName : undefined,
      reporterEmail:
        typeof data.reporterEmail === "string" ? data.reporterEmail : undefined,
      reporterUid:
        typeof data.reporterUid === "string" ? data.reporterUid : undefined,
      createdAtMs: extractTimestampMs(data.createdAt, data.updatedAt as string),
    });
  });
  return list.sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export async function approveVacancySubmission(
  sub: VacancySubmissionDoc,
): Promise<VacancyOverride> {
  if (!db) throw new Error("Firestore is not initialized");
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + VACANCY_OVERRIDE_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const override: VacancyOverride = {
    id: sub.id || sub.docId,
    facilityId: sub.facilityId,
    facilityName: sub.facilityName,
    vacancyInd: sub.vacancyInd,
    vacancyUnder36: sub.vacancyUnder36,
    vacancy30mos5yrs: sub.vacancy30mos5yrs,
    vacancyLicpre: sub.vacancyLicpre,
    vacancyOosGr1Age12: sub.vacancyOosGr1Age12,
    ...(sub.ageStatuses ? { ageStatuses: sub.ageStatuses } : {}),
    reporterRole: sub.reporterRole,
    verifiedProvider: sub.verifiedProvider,
    ...(sub.note ? { note: sub.note } : {}),
    updatedAt: sub.updatedAt || now.toISOString(),
    expiresAt,
  };

  await setDoc(doc(db, "vacancyOverrides", sub.facilityId), override);
  await updateDoc(doc(db, "vacancySubmissions", sub.docId), {
    status: "approved",
    reviewedAt: serverTimestamp(),
  });

  return override;
}

export async function rejectVacancySubmission(docId: string): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  await updateDoc(doc(db, "vacancySubmissions", docId), {
    status: "rejected",
    reviewedAt: serverTimestamp(),
  });
}

export async function renewVacancySubmission(
  sub: VacancySubmissionDoc,
): Promise<{ updatedAt: string; expiresAt: string }> {
  if (!db) throw new Error("Firestore is not initialized");
  const now = new Date();
  const updatedAt = now.toISOString();
  const expiresAt = new Date(
    now.getTime() + VACANCY_OVERRIDE_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const override: VacancyOverride = {
    id: sub.id || sub.docId,
    facilityId: sub.facilityId,
    facilityName: sub.facilityName,
    vacancyInd: sub.vacancyInd,
    vacancyUnder36: sub.vacancyUnder36,
    vacancy30mos5yrs: sub.vacancy30mos5yrs,
    vacancyLicpre: sub.vacancyLicpre,
    vacancyOosGr1Age12: sub.vacancyOosGr1Age12,
    ...(sub.ageStatuses ? { ageStatuses: sub.ageStatuses } : {}),
    reporterRole: sub.reporterRole,
    verifiedProvider: sub.verifiedProvider,
    ...(sub.note ? { note: sub.note } : {}),
    updatedAt,
    expiresAt,
  };

  await setDoc(doc(db, "vacancyOverrides", sub.facilityId), override);
  await updateDoc(doc(db, "vacancySubmissions", sub.docId), {
    status: "approved",
    updatedAt,
    expiresAt,
    reviewedAt: serverTimestamp(),
  });

  return { updatedAt, expiresAt };
}

export async function deleteVacancySubmission(docId: string): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  await deleteDoc(doc(db, "vacancySubmissions", docId));
}

export async function fetchFeedbackItems(): Promise<FeedbackDoc[]> {
  if (!db) return [];
  const snap = await getDocs(collection(db, "feedback"));
  const list: FeedbackDoc[] = [];
  snap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    list.push({
      docId: d.id,
      name: typeof data.name === "string" ? data.name : undefined,
      email: typeof data.email === "string" ? data.email : undefined,
      type: String(data.type ?? "other"),
      facilityId:
        typeof data.facilityId === "string" ? data.facilityId : undefined,
      facilityName:
        typeof data.facilityName === "string" ? data.facilityName : undefined,
      message: String(data.message ?? ""),
      url: typeof data.url === "string" ? data.url : undefined,
      resolved: Boolean(data.resolved),
      createdAtMs: extractTimestampMs(data.createdAt),
    });
  });
  return list.sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export async function toggleFeedbackResolved(
  docId: string,
  resolved: boolean,
): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  await updateDoc(doc(db, "feedback", docId), {
    resolved,
    reviewedAt: serverTimestamp(),
  });
}

export async function deleteFeedbackItem(docId: string): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized");
  await deleteDoc(doc(db, "feedback", docId));
}
