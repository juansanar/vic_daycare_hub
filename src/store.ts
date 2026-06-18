import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TrackerEntry, TrackerStatus } from "./types";
import { useAuth } from "./lib/auth";
import {
  pushEntry,
  pushAllEntries,
  subscribeToRemote,
  unsubscribeFromRemote,
  pauseSync,
  resumeSync,
} from "./lib/sync";

interface AppState {
  trackerEntries: Record<string, TrackerEntry>;
  activeTab: "list" | "map" | "resources";
  selectedFacilityId: string | null;

  setTrackerField: (
    facilityId: string,
    field: keyof Omit<TrackerEntry, "facilityId">,
    value: string | TrackerStatus,
  ) => void;
  setActiveTab: (tab: AppState["activeTab"]) => void;
  setSelectedFacility: (id: string | null) => void;
  exportData: () => string;
  importData: (json: string) => void;
  mergeRemoteEntries: (entries: Record<string, TrackerEntry>) => void;
}

const defaultTrackerEntry = (facilityId: string): TrackerEntry => ({
  facilityId,
  status: "none",
  waitlistDate: "",
  costNotes: "",
  foodNotes: "",
  ccfriNotes: "",
  notes: "",
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      trackerEntries: {},
      activeTab: "list",
      selectedFacilityId: null,

      setTrackerField: (facilityId, field, value) => {
        set((state) => {
          const existing =
            state.trackerEntries[facilityId] ??
            defaultTrackerEntry(facilityId);
          const updated = { ...existing, [field]: value };
          return {
            trackerEntries: {
              ...state.trackerEntries,
              [facilityId]: updated,
            },
          };
        });

        // Push to Firestore if signed in
        const uid = useAuth.getState().user?.uid;
        if (uid) {
          const entry = get().trackerEntries[facilityId];
          if (entry) {
            pauseSync();
            pushEntry(uid, facilityId, entry);
            setTimeout(resumeSync, 1000);
          }
        }
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedFacility: (id) => set({ selectedFacilityId: id }),

      exportData: () => {
        const { trackerEntries } = get();
        return JSON.stringify({ trackerEntries }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.trackerEntries) {
            set({ trackerEntries: data.trackerEntries });
            // Also push imported data to Firestore
            const uid = useAuth.getState().user?.uid;
            if (uid) pushAllEntries(uid, data.trackerEntries);
          }
        } catch {
          console.error("Failed to import data");
        }
      },

      mergeRemoteEntries: (entries) => {
        set((state) => ({
          trackerEntries: { ...state.trackerEntries, ...entries },
        }));
      },
    }),
    {
      name: "vic-daycare-hub-storage",
      partialize: (state) => ({
        trackerEntries: state.trackerEntries,
      }),
    },
  ),
);

// React to auth state changes: start/stop sync
useAuth.subscribe((authState, prevAuthState) => {
  const uid = authState.user?.uid;
  const prevUid = prevAuthState.user?.uid;

  if (uid && uid !== prevUid) {
    // User just signed in — upload local data, then subscribe to remote
    const { trackerEntries, mergeRemoteEntries } = useStore.getState();
    pushAllEntries(uid, trackerEntries);
    subscribeToRemote(uid, mergeRemoteEntries);
  } else if (!uid && prevUid) {
    // User signed out — stop listening
    unsubscribeFromRemote();
  }
});
