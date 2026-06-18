import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { TrackerEntry } from "../types";

let unsubscribe: Unsubscribe | null = null;
let syncPaused = false;

function getCollectionRef(uid: string) {
  if (!db) return null;
  return collection(db, "users", uid, "trackerEntries");
}

/**
 * Push a single tracker entry to Firestore.
 */
export function pushEntry(uid: string, facilityId: string, entry: TrackerEntry) {
  if (!db) return;
  const ref = doc(db, "users", uid, "trackerEntries", facilityId);
  setDoc(ref, { ...entry, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Upload all local entries to Firestore (merge, don't overwrite).
 * Called on first sign-in to seed the remote with existing local data.
 */
export function pushAllEntries(uid: string, entries: Record<string, TrackerEntry>) {
  if (!db) return;
  for (const [facilityId, entry] of Object.entries(entries)) {
    if (entry.status === "none" && !entry.notes && !entry.waitlistDate) continue;
    pushEntry(uid, facilityId, entry);
  }
}

/**
 * Subscribe to Firestore changes for a user's tracker entries.
 * Calls `onRemoteChange` whenever remote data changes.
 */
export function subscribeToRemote(
  uid: string,
  onRemoteChange: (entries: Record<string, TrackerEntry>) => void,
) {
  unsubscribeFromRemote();

  const colRef = getCollectionRef(uid);
  if (!colRef) return;

  unsubscribe = onSnapshot(colRef, (snapshot) => {
    if (syncPaused) return;

    const entries: Record<string, TrackerEntry> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      entries[docSnap.id] = {
        facilityId: docSnap.id,
        status: data.status ?? "none",
        waitlistDate: data.waitlistDate ?? "",
        costNotes: data.costNotes ?? "",
        foodNotes: data.foodNotes ?? "",
        ccfriNotes: data.ccfriNotes ?? "",
        notes: data.notes ?? "",
      };
    });
    onRemoteChange(entries);
  });
}

/**
 * Stop listening to remote changes.
 */
export function unsubscribeFromRemote() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

/**
 * Temporarily pause processing remote snapshots (used during local writes
 * to avoid echo loops).
 */
export function pauseSync() {
  syncPaused = true;
}

export function resumeSync() {
  syncPaused = false;
}
