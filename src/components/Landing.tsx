import meta from "../../data/meta.json";

const bmcUsername = import.meta.env.VITE_BMC_USERNAME || "vic_daycare_hub";

export default function Landing() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <header className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center md:pt-28 md:pb-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Free &middot; Open source &middot; No sign-up
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Victoria Childcare Hub
        </h1>
        <p className="mx-auto mt-4 text-sm text-gray-400">
          Victoria · Saanich · Oak Bay · View Royal · Langford · Colwood · Sooke · Central Saanich · Sidney
        </p>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-500">
          {meta.count}+ licensed childcare facilities across Victoria and
          surrounding areas — on an interactive map with filters, inspection
          data, and a personal tracker. Completely free for families.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#/app/map"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Explore the map
          </a>
          <a
            href="#/app/list"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Browse the list
          </a>
        </div>
        <p className="mt-5 text-xs text-gray-400">
          Works in any browser — desktop or mobile. No app to install.
        </p>
      </header>

      {/* Stats */}
      <section className="border-y border-stone-200 bg-white py-10">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-6 px-6 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{meta.count}+</p>
            <p className="mt-1 text-xs text-gray-500">Licensed facilities</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">9</p>
            <p className="mt-1 text-xs text-gray-500">Municipalities covered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">$0</p>
            <p className="mt-1 text-xs text-gray-500">Always free</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-center text-lg font-semibold text-gray-900">
          What you can do
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              icon: "🗺️",
              title: "Interactive map",
              desc: "Every facility plotted with its real address. Click any pin for contact details, service type, and $10/day status.",
            },
            {
              icon: "🔍",
              title: "Smart filters",
              desc: "Narrow by municipality, age group, vacancy, or $10/day. Results update instantly as you type.",
            },
            {
              icon: "📋",
              title: "Personal tracker",
              desc: "Mark facilities as contacted, waitlisted, or ruled out. Add notes, dates, and cost info — saved in your browser.",
            },
            {
              icon: "🏥",
              title: "Inspection reports",
              desc: "See Island Health inspection results and any outstanding issues for each facility, right in the app.",
            },
            {
              icon: "💡",
              title: "Funding explained",
              desc: "Understand $10/day centres, CCFRI fee reductions, and the Affordable Child Care Benefit with plain-language guides.",
            },
            {
              icon: "💾",
              title: "Export your data",
              desc: "Back up your tracker as JSON. Import it on another device. Your data belongs to you — nothing leaves your browser.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-stone-200 bg-white p-5 transition hover:shadow-sm"
            >
              <span className="text-lg">{item.icon}</span>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-stone-200 bg-white py-16">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-center text-lg font-semibold text-gray-900">
            Common questions
          </h2>
          <dl className="mt-8 space-y-6">
            {[
              {
                q: "Why is this free?",
                a: "Because childcare info shouldn't be behind a paywall. This is an open-source community project built on public government data. If you'd like to support hosting costs, there's an optional Buy Me a Coffee link.",
              },
              {
                q: "Where does the data come from?",
                a: `Facility data is pulled from the BC Community Care Facility Registry and was last refreshed ${meta.lastUpdated ? new Date(meta.lastUpdated).toLocaleDateString("en-CA", { year: "numeric", month: "long" }) : "recently"}. Inspection data comes from Island Health. Availability and fees change constantly — always confirm directly with facilities.`,
              },
              {
                q: "Are my notes private?",
                a: "Yes. Everything stays in your browser's local storage. Nothing is sent to a server. No accounts, no analytics, no tracking.",
              },
              {
                q: "What areas are covered?",
                a: "Victoria and surrounding areas: Victoria, Saanich, Oak Bay, View Royal, Langford, Colwood, Sooke, Central Saanich, and Sidney.",
              },
              {
                q: "What's the $10/day program?",
                a: "Some BC facilities participate in ChildCareBC's $10 a Day program — charging no more than $10/day for full-time care. We flag the ones we can identify from public records.",
              },
            ].map((item) => (
              <div key={item.q}>
                <dt className="text-sm font-medium text-gray-900">{item.q}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-gray-500">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-stone-200 bg-emerald-600 px-6 py-12 text-center">
        <h2 className="text-xl font-bold text-white">Ready to start?</h2>
        <p className="mt-2 text-sm text-emerald-100">
          No sign-up. No payment. Just open the hub.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#/app/map"
            className="inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-emerald-700 shadow transition hover:bg-emerald-50"
          >
            Open the map
          </a>
          <a
            href="#/app/list"
            className="inline-block rounded-full border border-emerald-400 px-7 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Browse the list
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-50 px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center text-xs text-gray-400">
          <p>
            Data from the{" "}
            <a
              href="https://catalogue.data.gov.bc.ca/dataset/4cc207cc-ff03-44f8-8c5f-415af5224646"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              BC Community Care Facility Registry
            </a>
            . Always confirm details directly with facilities.
          </p>
          <p className="text-[11px] text-gray-300">
            Independent community project — not affiliated with the BC
            government, Island Health, or any childcare facility.
          </p>
          <div className="flex gap-4">
            <a
              href={`https://buymeacoffee.com/${bmcUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600"
            >
              Buy me a coffee
            </a>
            <a
              href="https://github.com/juansanar/vic_daycare_hub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600"
            >
              GitHub
            </a>
          </div>
          <p className="text-[11px] text-gray-300">
            victoriachildcarehub.ca &middot; Open-source &middot; MIT License
            &middot; A community project for Victoria area families
          </p>
        </div>
      </footer>
    </div>
  );
}
