import { useStore } from "../store";
import FacilityList from "./FacilityList";
import FacilityDetail from "./FacilityDetail";
import NannyLog from "./NannyLog";
import Resources from "./Resources";
import ExportImport from "./ExportImport";
import { lazy, Suspense } from "react";

const FacilityMap = lazy(() => import("./FacilityMap"));

const bmcUsername = import.meta.env.VITE_BMC_USERNAME || "vic_daycare_hub";

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
  const setSelectedFacility = useStore((s) => s.setSelectedFacility);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <a href="#/" className="text-lg font-semibold text-indigo-600">
          Victoria Daycare Hub
        </a>
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium transition ${
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
            <FacilityList />
            {/* Desktop detail sidebar */}
            {selectedFacilityId && (
              <aside className="hidden w-96 overflow-y-auto border-l p-4 md:block">
                <FacilityDetail facilityId={selectedFacilityId} />
              </aside>
            )}
            {/* Mobile detail overlay */}
            {selectedFacilityId && (
              <div className="fixed inset-0 z-50 flex md:hidden">
                <div
                  className="absolute inset-0 bg-black/30"
                  onClick={() => setSelectedFacility(null)}
                />
                <div className="relative ml-auto h-full w-full max-w-sm overflow-y-auto bg-white p-4 shadow-xl">
                  <FacilityDetail facilityId={selectedFacilityId} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "map" && (
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center text-gray-500">
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

      {/* Footer */}
      <footer className="flex items-center justify-between border-t px-4 py-2 text-xs text-gray-400">
        <ExportImport />
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/juansanar/vic_daycare_hub/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600"
          >
            Suggest a correction
          </a>
          <a
            href={`https://buymeacoffee.com/${bmcUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600"
          >
            Support this project
          </a>
        </div>
      </footer>
    </div>
  );
}
