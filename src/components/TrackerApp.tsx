import { useStore } from "../store";
import FacilityList from "./FacilityList";
import Filters from "./Filters";
import FacilityDetail from "./FacilityDetail";
import NannyLog from "./NannyLog";
import Resources from "./Resources";
import { lazy, Suspense } from "react";

const FacilityMap = lazy(() => import("./FacilityMap"));

const TABS = [
  { id: "list", label: "List" },
  { id: "map", label: "Map" },
  { id: "nanny", label: "Nanny Log" },
  { id: "resources", label: "Resources" },
] as const;

export default function TrackerApp() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const selectedFacilityId = useStore((s) => s.selectedFacilityId);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <a href="#/" className="text-lg font-semibold text-indigo-600">
          Victoria Daycare Hub
        </a>
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex flex-1 overflow-hidden">
        {activeTab === "list" && (
          <div className="flex flex-1 overflow-hidden">
            <div className="flex flex-1 flex-col overflow-hidden">
              <Filters />
              <FacilityList />
            </div>
            {selectedFacilityId && (
              <aside className="w-96 overflow-y-auto border-l p-4">
                <FacilityDetail facilityId={selectedFacilityId} />
              </aside>
            )}
          </div>
        )}

        {activeTab === "map" && (
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center">
                Loading map...
              </div>
            }
          >
            <FacilityMap />
          </Suspense>
        )}

        {activeTab === "nanny" && <NannyLog />}
        {activeTab === "resources" && <Resources />}
      </main>
    </div>
  );
}
