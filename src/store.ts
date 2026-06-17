import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TrackerEntry, NannyEntry, TrackerStatus } from "./types";

interface AppState {
  trackerEntries: Record<string, TrackerEntry>;
  nannyEntries: NannyEntry[];
  activeTab: "list" | "map" | "nanny" | "resources";
  selectedFacilityId: string | null;

  setTrackerField: (
    facilityId: string,
    field: keyof Omit<TrackerEntry, "facilityId">,
    value: string | TrackerStatus,
  ) => void;
  addNanny: (entry: NannyEntry) => void;
  updateNanny: (id: string, entry: Partial<NannyEntry>) => void;
  removeNanny: (id: string) => void;
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
      nannyEntries: [],
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

      addNanny: (entry) => {
        set((state) => ({ nannyEntries: [...state.nannyEntries, entry] }));
      },

      updateNanny: (id, partial) => {
        set((state) => ({
          nannyEntries: state.nannyEntries.map((n) =>
            n.id === id ? { ...n, ...partial } : n,
          ),
        }));
      },

      removeNanny: (id) => {
        set((state) => ({
          nannyEntries: state.nannyEntries.filter((n) => n.id !== id),
        }));
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedFacility: (id) => set({ selectedFacilityId: id }),

      exportData: () => {
        const { trackerEntries, nannyEntries } = get();
        return JSON.stringify({ trackerEntries, nannyEntries }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.trackerEntries) set({ trackerEntries: data.trackerEntries });
          if (data.nannyEntries) set({ nannyEntries: data.nannyEntries });
        } catch {
          console.error("Failed to import data");
        }
      },
    }),
    {
      name: "vic-daycare-hub-storage",
      partialize: (state) => ({
        trackerEntries: state.trackerEntries,
        nannyEntries: state.nannyEntries,
      }),
    },
  ),
);
