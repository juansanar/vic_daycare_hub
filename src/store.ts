import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TrackerEntry, TrackerStatus, VacancyOverride } from "./types";
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
  vacancyOverrides: Record<string, VacancyOverride>;
  vacancyReportsByFacility: Record<string, VacancyOverride[]>;
  activeTab: "list" | "map" | "resources";
  selectedFacilityId: string | null;
  isFeedbackOpen: boolean;
  feedbackFacilityId: string | null;
  feedbackFacilityName: string | null;
  isVacancyModalOpen: boolean;
  vacancyFacilityId: string | null;

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
  setFeedbackOpen: (open: boolean, facilityId?: string | null, facilityName?: string | null) => void;
  setVacancyModalOpen: (open: boolean, facilityId?: string | null) => void;
  setVacancyOverride: (facilityId: string, override: VacancyOverride) => void;
  clearVacancyReports: (facilityId: string) => void;
  mergeVacancyOverrides: (overrides: Record<string, VacancyOverride>) => void;
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
      vacancyOverrides: {},
      vacancyReportsByFacility: {},
      activeTab: "list",
      selectedFacilityId: null,
      isFeedbackOpen: false,
      feedbackFacilityId: null,
      feedbackFacilityName: null,
      isVacancyModalOpen: false,
      vacancyFacilityId: null,

      setFeedbackOpen: (open, facilityId = null, facilityName = null) => {
        set({
          isFeedbackOpen: open,
          feedbackFacilityId: facilityId,
          feedbackFacilityName: facilityName,
        });
      },

      setVacancyModalOpen: (open, facilityId = null) => {
        set({
          isVacancyModalOpen: open,
          vacancyFacilityId: facilityId,
        });
      },

      setVacancyOverride: (facilityId, override) => {
        set((state) => {
          const existingList = state.vacancyReportsByFacility[facilityId] ?? [];
          const nextList = [
            override,
            ...existingList.filter((r) => r.id !== override.id),
          ].slice(0, 5);
          return {
            vacancyOverrides: {
              ...state.vacancyOverrides,
              [facilityId]: override,
            },
            vacancyReportsByFacility: {
              ...state.vacancyReportsByFacility,
              [facilityId]: nextList,
            },
          };
        });
      },

      clearVacancyReports: (facilityId) => {
        set((state) => {
          const nextOverrides = { ...state.vacancyOverrides };
          delete nextOverrides[facilityId];
          const nextByFacility = { ...state.vacancyReportsByFacility };
          delete nextByFacility[facilityId];
          return {
            vacancyOverrides: nextOverrides,
            vacancyReportsByFacility: nextByFacility,
          };
        });
      },

      mergeVacancyOverrides: (overrides) => {
        set((state) => {
          const nextByFacility = { ...state.vacancyReportsByFacility };
          for (const [facId, ov] of Object.entries(overrides)) {
            const list = nextByFacility[facId] ?? [];
            const alreadyPresent = list.some(
              (r) =>
                (r.id && r.id === ov.id) || r.updatedAt === ov.updatedAt,
            );
            if (!alreadyPresent) {
              nextByFacility[facId] = [ov, ...list].slice(0, 5);
            }
          }
          return {
            vacancyOverrides: {
              ...state.vacancyOverrides,
              ...overrides,
            },
            vacancyReportsByFacility: nextByFacility,
          };
        });
      },

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
        vacancyOverrides: state.vacancyOverrides,
        vacancyReportsByFacility: state.vacancyReportsByFacility,
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
