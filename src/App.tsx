import { useState, useEffect, lazy, Suspense } from "react";
import Landing from "./components/Landing";
import TrackerApp from "./components/TrackerApp";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import FeedbackModal from "./components/FeedbackModal";
import VacancyModal from "./components/VacancyModal";
import { subscribeToVacancyOverrides } from "./lib/vacancyReport";
import { useStore } from "./store";

const AdminDashboard = lazy(() => import("./components/AdminDashboard"));

type View = "landing" | "app" | "privacy" | "terms" | "admin";

function getViewFromHash(): View {
  const hash = window.location.hash;
  if (hash.startsWith("#/app")) return "app";
  if (hash === "#/admin") return "admin";
  if (hash === "#/privacy") return "privacy";
  if (hash === "#/terms") return "terms";
  return "landing";
}

function getTabFromHash(): "list" | "map" | "resources" | null {
  const hash = window.location.hash;
  if (hash === "#/app/map") return "map";
  if (hash === "#/app/list") return "list";
  if (hash === "#/app/resources") return "resources";
  return null;
}

export default function App() {
  const [view, setView] = useState<View>(getViewFromHash);
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const mergeVacancyOverrides = useStore((s) => s.mergeVacancyOverrides);

  useEffect(() => {
    const unsub = subscribeToVacancyOverrides((overrides) => {
      mergeVacancyOverrides(overrides);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [mergeVacancyOverrides]);

  useEffect(() => {
    const onHashChange = () => {
      setView(getViewFromHash());
      const tab = getTabFromHash();
      if (tab) setActiveTab(tab);
    };
    window.addEventListener("hashchange", onHashChange);

    // Set initial tab if specified in URL
    const initialTab = getTabFromHash();
    if (initialTab) setActiveTab(initialTab);

    return () => window.removeEventListener("hashchange", onHashChange);
  }, [setActiveTab]);

  useEffect(() => {
    if (view === "app") {
      const currentTab = getTabFromHash();
      if (currentTab !== activeTab) {
        window.location.hash = `#/app/${activeTab}`;
      }
    }
  }, [view, activeTab]);

  return (
    <>
      {view === "app" ? (
        <TrackerApp />
      ) : view === "admin" ? (
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center theme-bg text-sm text-stone-400">
              Loading admin queue...
            </div>
          }
        >
          <AdminDashboard />
        </Suspense>
      ) : view === "privacy" ? (
        <PrivacyPolicy />
      ) : view === "terms" ? (
        <TermsOfService />
      ) : (
        <Landing />
      )}
      <FeedbackModal />
      <VacancyModal />
    </>
  );
}
