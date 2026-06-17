import { useState, useEffect } from "react";
import Landing from "./components/Landing";
import TrackerApp from "./components/TrackerApp";

type View = "landing" | "app";

function getViewFromHash(): View {
  return window.location.hash === "#/app" ? "app" : "landing";
}

export default function App() {
  const [view, setView] = useState<View>(getViewFromHash);

  useEffect(() => {
    const onHashChange = () => setView(getViewFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return view === "app" ? <TrackerApp /> : <Landing />;
}
