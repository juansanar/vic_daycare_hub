import { useStore } from "../store";
import { useAuth } from "../lib/auth";
import { firebaseEnabled } from "../lib/firebase";

import FacilityList from "./FacilityList";
import FacilityDetail from "./FacilityDetail";
import Resources from "./Resources";
import ExportImport from "./ExportImport";
import ThemeToggle from "./ThemeToggle";
import { lazy, Suspense } from "react";

const FacilityMap = lazy(() => import("./FacilityMap"));

const bmcUsername = import.meta.env.VITE_BMC_USERNAME || "vic_daycare_hub";

const TABS = [
  { id: "list", label: "List", icon: "☰" },
  { id: "map", label: "Map", icon: "◎" },
  { id: "resources", label: "Resources", icon: "◇" },
] as const;

function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (!firebaseEnabled) return null;
  if (loading) return <span className="text-[11px] text-stone-400">...</span>;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-[11px] text-stone-500 sm:inline dark:text-stone-400">
          {user.displayName?.split(" ")[0] ?? user.email}
        </span>
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt=""
            className="h-5 w-5 rounded-full ring-1 ring-stone-200 dark:ring-stone-700"
            referrerPolicy="no-referrer"
          />
        )}
        <button
          onClick={signOut}
          className="rounded-full border border-stone-200 px-2 py-0.5 text-[11px] text-stone-600 transition hover:bg-stone-100 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 cursor-pointer"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-stone-700 shadow-2xs transition hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 cursor-pointer"
    >
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      <span className="hidden sm:inline">Sign in to sync</span>
      <span className="sm:hidden">Sign in</span>
    </button>
  );
}

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
          Independent community project — not affiliated with the BC government, Island Health, or any childcare facility.
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
