import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TrackerEntry, TrackerStatus } from "./types";

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
          return {
            trackerEntries: {
              ...state.trackerEntries,
              [facilityId]: { ...existing, [field]: value },
            },
          };
        });
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
          if (data.trackerEntries) set({ trackerEntries: data.trackerEntries });
        } catch {
          console.error("Failed to import data");
        }
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
