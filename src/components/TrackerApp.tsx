import { useStore } from "../store";
import { formatDataLastUpdated } from "../lib/meta";

import FacilityList from "./FacilityList";
import FacilityDetail from "./FacilityDetail";
import Resources from "./Resources";
import ExportImport from "./ExportImport";
import ThemeToggle from "./ThemeToggle";
import AuthButton from "./AuthButton";
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
  const setFeedbackOpen = useStore((s) => (s as any).setFeedbackOpen);

  return (
    <div className="flex h-screen flex-col theme-bg theme-transition">
      <header className="flex items-center justify-between border-b border-stone-200/80 bg-white/80 px-3 py-2 sm:px-5 sm:py-2.5 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-900/80">
        <a
          href="#/"
          className="font-heading flex items-center gap-2 text-base font-bold tracking-tight text-stone-900 group dark:text-stone-100"
        >
          <img
            src="/logo.png"
            alt=""
            className="h-7 w-7 shrink-0 object-contain rounded-lg shadow-2xs transform group-hover:scale-105 transition-transform duration-200"
          />
          <span className="hidden md:inline">Victoria Childcare Hub</span>
          <span className="md:hidden">Vic Childcare Hub</span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex rounded-full border border-stone-200/80 bg-stone-100/60 p-0.5 dark:border-stone-800 dark:bg-stone-800/60">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-stone-900 shadow-2xs dark:bg-stone-900 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
              >
                <span className="text-[10px]">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <ThemeToggle />
          <AuthButton />
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {activeTab === "list" && (
          <div className="flex flex-1 overflow-hidden">
            <FacilityList />
            {selectedFacilityId && (
              <aside className="hidden w-96 overflow-y-auto border-l border-stone-200/80 bg-white p-4 md:block dark:border-stone-800 dark:bg-stone-900">
                <FacilityDetail facilityId={selectedFacilityId} />
              </aside>
            )}
            {selectedFacilityId && (
              <div className="fixed inset-0 z-50 flex md:hidden">
                <div
                  className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs dark:bg-black/60"
                  onClick={() => setSelectedFacility(null)}
                />
                <div className="relative ml-auto h-full w-full max-w-sm overflow-y-auto bg-white p-4 shadow-xl dark:bg-stone-900">
                  <FacilityDetail facilityId={selectedFacilityId} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "map" && (
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center text-sm font-medium text-stone-400 dark:text-stone-500">
                Loading interactive map...
              </div>
            }
          >
            <FacilityMap />
          </Suspense>
        )}

        {activeTab === "resources" && <Resources />}
      </main>

      <footer className="border-t border-stone-200/80 bg-white/80 px-4 py-2 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80">
        <p className="text-center text-[10px] text-stone-400 dark:text-stone-500">
          Data last updated {formatDataLastUpdated()} &middot; Sourced from BC Community Care Facility Registry &amp; Island Health &middot; Independent community project.
        </p>
        <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-stone-500 dark:text-stone-400">
          <ExportImport />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFeedbackOpen(true)}
              className="transition hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
            >
              Suggest correction
            </button>
            <a href="#/privacy" className="transition hover:text-stone-900 dark:hover:text-stone-100">
              Privacy
            </a>
            <a href="#/terms" className="transition hover:text-stone-900 dark:hover:text-stone-100">
              Terms
            </a>
            <a
              href={`https://buymeacoffee.com/${bmcUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-stone-900 dark:hover:text-stone-100"
            >
              Support project
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
