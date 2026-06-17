import { useStore } from "../store";
import FacilityList from "./FacilityList";
import FacilityDetail from "./FacilityDetail";
import Resources from "./Resources";
import ExportImport from "./ExportImport";
import { lazy, Suspense } from "react";

const FacilityMap = lazy(() => import("./FacilityMap"));

const bmcUsername = import.meta.env.VITE_BMC_USERNAME || "vic_daycare_hub";

const TABS = [
  { id: "list", label: "List", icon: "☰" },
  { id: "map", label: "Map", icon: "◎" },
  { id: "resources", label: "Resources", icon: "◇" },
] as const;

export default function TrackerApp() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const selectedFacilityId = useStore((s) => s.selectedFacilityId);
  const setSelectedFacility = useStore((s) => s.setSelectedFacility);

  return (
    <div className="flex h-screen flex-col bg-stone-50">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-2.5">
        <a
          href="#/"
          className="text-base font-semibold tracking-tight text-emerald-700"
        >
          Greater Victoria Daycare Hub
        </a>
        <nav className="flex gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition ${
                activeTab === tab.id
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-500 hover:bg-stone-100 hover:text-gray-700"
              }`}
            >
              <span className="text-[10px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {activeTab === "list" && (
          <div className="flex flex-1 overflow-hidden">
            <FacilityList />
            {selectedFacilityId && (
              <aside className="hidden w-96 overflow-y-auto border-l border-stone-200 bg-white p-4 md:block">
                <FacilityDetail facilityId={selectedFacilityId} />
              </aside>
            )}
            {selectedFacilityId && (
              <div className="fixed inset-0 z-50 flex md:hidden">
                <div
                  className="absolute inset-0 bg-black/20"
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
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
                Loading map...
              </div>
            }
          >
            <FacilityMap />
          </Suspense>
        )}

        {activeTab === "resources" && <Resources />}
      </main>

      <footer className="flex items-center justify-between border-t border-stone-200 bg-white px-4 py-2 text-[11px] text-gray-400">
        <ExportImport />
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/juansanar/vic_daycare_hub/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-emerald-600"
          >
            Suggest a correction
          </a>
          <a
            href={`https://buymeacoffee.com/${bmcUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-emerald-600"
          >
            Support this project
          </a>
        </div>
      </footer>
    </div>
  );
}
