import { useState, useEffect } from "react";
import Landing from "./components/Landing";
import TrackerApp from "./components/TrackerApp";
import { useStore } from "./store";

type View = "landing" | "app";

function getViewFromHash(): View {
  return window.location.hash.startsWith("#/app") ? "app" : "landing";
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
  const setActiveTab = useStore((s) => s.setActiveTab);

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

  return view === "app" ? <TrackerApp /> : <Landing />;
}
