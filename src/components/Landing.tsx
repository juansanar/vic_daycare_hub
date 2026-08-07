import meta from "../../data/meta.json";
import { formatDataLastUpdated } from "../lib/meta";
import ThemeToggle from "./ThemeToggle";
import AuthButton from "./AuthButton";
import { useStore } from "../store";

const bmcUsername = import.meta.env.VITE_BMC_USERNAME || "vic_daycare_hub";

export default function Landing() {
  const setFeedbackOpen = useStore((s) => (s as any).setFeedbackOpen);

  return (
    <div className="min-h-screen theme-bg theme-pattern-bg theme-transition">
      {/* Floating Top Controls */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
        <AuthButton />
        <ThemeToggle />
      </div>

      {/* Hero */}
      <header className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 text-center md:pt-28 md:pb-24">
        {/* Soft Decorative Background Glow */}
        <div className="pointer-events-none absolute inset-x-0 top-12 -z-10 flex justify-center opacity-40 blur-3xl dark:opacity-20">
          <div className="h-64 w-96 rounded-full bg-amber-200/50 dark:bg-amber-900/30" />
          <div className="h-64 w-96 rounded-full bg-emerald-200/40 dark:bg-teal-900/30 -ml-20" />
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-stone-700 shadow-xs backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-300">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Free &middot; Open source &middot; Data updated {formatDataLastUpdated()}</span>
        </div>

        <h1 className="font-heading flex flex-col items-center justify-center gap-3 text-4xl font-extrabold tracking-tight sm:flex-row sm:gap-3.5 sm:text-6xl text-stone-900 dark:text-stone-50">
          <img
            src="/logo.png"
            alt=""
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-2xl shadow-sm transform hover:rotate-3 transition-transform duration-300 shrink-0"
          />
          <span>Victoria Childcare Hub</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-xs font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Victoria · Saanich · Oak Bay · View Royal · Langford · Colwood · Sooke · Central Saanich · Sidney · Esquimalt · Metchosin · North Saanich · Highlands
        </p>

        <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-300">
          <strong className="font-semibold text-stone-900 dark:text-stone-100">{meta.count}+ licensed childcare facilities</strong> across Greater Victoria—on an interactive map with smart filters, Island Health inspection records, and a private personal tracker.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center">
          <a
            href="#/app/map"
            className="theme-btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm shadow-md cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Explore Interactive Map
          </a>
          <a
            href="#/app/list"
            className="theme-card inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-stone-800 hover:text-stone-950 dark:text-stone-200 dark:hover:text-white cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Browse Facility List
          </a>
        </div>

        <p className="mt-5 text-xs text-stone-400 dark:text-stone-500">
          Works seamlessly in any mobile or desktop browser. No app download needed.
        </p>
      </header>

      {/* Stats Banner */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <div className="theme-card grid grid-cols-3 gap-4 p-6 sm:p-8 text-center divide-x divide-stone-200/60 dark:divide-stone-800">
          <div>
            <p className="font-heading text-3xl font-extrabold text-stone-900 sm:text-4xl dark:text-stone-50">{meta.count}+</p>
            <p className="mt-1 text-xs font-medium text-stone-500 dark:text-stone-400">Licensed Facilities</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-extrabold text-stone-900 sm:text-4xl dark:text-stone-50">13</p>
            <p className="mt-1 text-xs font-medium text-stone-500 dark:text-stone-400">Municipalities Covered</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-extrabold text-stone-900 sm:text-4xl dark:text-stone-50">$0</p>
            <p className="mt-1 text-xs font-medium text-stone-500 dark:text-stone-400">100% Free & Open Access</p>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Designed For Parents</span>
          <h2 className="font-heading mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Everything you need for your childcare search
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              icon: "🗺️",
              title: "Interactive map",
              desc: "Every facility plotted with exact address. Click any pin for contact details, service type, and $10/day flags.",
              badge: "Map View",
            },
            {
              icon: "🔍",
              title: "Smart filters",
              desc: "Filter instantly by municipality, age group, vacancy status, or $10/day participation.",
              badge: "Instant Search",
            },
            {
              icon: "📋",
              title: "Personal tracker",
              desc: "Keep notes, mark facilities as contacted, waitlisted, or ruled out. Saved locally or synced securely.",
              badge: "Private Notes",
            },
            {
              icon: "🏥",
              title: "Inspection reports",
              desc: "Direct access to Island Health inspection history and unresolved compliance items.",
              badge: "Health Records",
            },
            {
              icon: "💡",
              title: "Funding explained",
              desc: "Plain-language guides covering $10/day centres, CCFRI fee reductions, and ACCB government subsidies.",
              badge: "Financial Guides",
            },
            {
              icon: "💾",
              title: "Export & Ownership",
              desc: "Back up your data anytime as JSON. Your search records belong to you—no proprietary lock-in.",
              badge: "Data Sovereignty",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="theme-card theme-card-hover flex flex-col justify-between p-6"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-heading mt-4 text-base font-bold text-stone-900 dark:text-stone-100">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="theme-card p-6 sm:p-10">
          <h2 className="font-heading text-center text-2xl font-bold text-stone-900 dark:text-stone-50">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-6">
            {[
              {
                q: "Why is this platform free?",
                a: "Childcare information should be accessible to all parents without paywalls. This is an open-source community project built on public government data.",
              },
              {
                q: "Where does the data come from?",
                a: `Facility records are sourced directly from the BC Community Care Facility Registry (refreshed ${formatDataLastUpdated()}). Inspection logs are linked directly from Island Health public records.`,
              },
              {
                q: "Are my personal notes and waitlist tracker private?",
                a: "Yes! Everything is stored locally on your device by default. If you choose to log in with Google, your tracker entries are encrypted and stored in Canada (northamerica-northeast2 region).",
              },
              {
                q: "Which communities are included?",
                a: "Victoria, Saanich, Oak Bay, View Royal, Langford, Colwood, Sooke, Central Saanich, Sidney, Esquimalt, Metchosin, North Saanich, and Highlands.",
              },
              {
                q: "How are $10/day childcare centres identified?",
                a: "Facilities participating in ChildCareBC's $10 a Day program are cross-referenced from public provincial registries and flagged clearly with a badge.",
              },
            ].map((item, idx) => (
              <div key={item.q} className={idx > 0 ? "pt-5 border-t border-stone-200/70 dark:border-stone-800" : ""}>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-200">{item.q}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="mx-auto max-w-4xl px-6 py-12 text-center">
        <div className="rounded-3xl bg-stone-900 text-white p-8 sm:p-12 shadow-xl dark:bg-stone-800">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold">Ready to find your childcare options?</h2>
          <p className="mt-3 text-sm text-stone-300 max-w-md mx-auto">
            No accounts or payments needed. Instant access to all facilities, maps, and tracking tools.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#/app/map"
              className="inline-block rounded-full bg-white px-8 py-3.5 text-sm font-bold text-stone-900 shadow hover:bg-stone-100 transition cursor-pointer"
            >
              Open Interactive Map
            </a>
            <a
              href="#/app/list"
              className="inline-block rounded-full border border-stone-700 px-8 py-3.5 text-sm font-bold text-stone-200 hover:bg-stone-800 transition cursor-pointer"
            >
              Browse List View
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 px-6 py-10 dark:border-stone-800">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center text-xs text-stone-400 dark:text-stone-500">
          <p>
            Data from the{" "}
            <a
              href="https://catalogue.data.gov.bc.ca/dataset/4cc207cc-ff03-44f8-8c5f-415af5224646"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-stone-600 hover:underline dark:text-stone-300"
            >
              BC Community Care Facility Registry
            </a>
            {" "}(last updated {formatDataLastUpdated()}). Always confirm details directly with facilities.
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-medium">
            <a
              href={`https://buymeacoffee.com/${bmcUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-700 dark:hover:text-stone-300"
            >
              Buy me a coffee
            </a>
            <a
              href="https://github.com/juansanar/vic_daycare_hub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-700 dark:hover:text-stone-300"
            >
              GitHub
            </a>
            <a href="#/privacy" className="hover:text-stone-700 dark:hover:text-stone-300">
              Privacy Policy
            </a>
            <a href="#/terms" className="hover:text-stone-700 dark:hover:text-stone-300">
              Terms of Use
            </a>
            <button
              onClick={() => setFeedbackOpen(true)}
              className="hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer"
            >
              Feedback / Corrections
            </button>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-600">
            victoriachildcarehub.ca &middot; Open-source &middot; MIT License &middot; A community project for Victoria area families
          </p>
        </div>
      </footer>
    </div>
  );
}
