import meta from "../../data/meta.json";

const bmcUsername = import.meta.env.VITE_BMC_USERNAME || "vic_daycare_hub";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
        <p className="mb-4 text-sm font-medium tracking-wide text-indigo-600 uppercase">
          100% free &middot; Open source &middot; No sign-up
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Victoria &amp; Westshore{" "}
          <span className="text-indigo-600">Daycare Hub</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          A free community tool that puts {meta.count}+ licensed childcare
          facilities on an interactive map — with contact info, filters, and a
          personal organizer to track your search. No paywalls, no accounts,
          just the information you need.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#/app"
            className="rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Explore the Map
          </a>
          <a
            href={`https://buymeacoffee.com/${bmcUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Buy me a coffee
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          No download required. Works in any browser, desktop or mobile.
        </p>
      </header>

      {/* Why this exists */}
      <section className="border-y bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Why does this exist?
          </h2>
          <p className="mt-4 text-gray-600">
            BC publishes childcare licensing data, but it&apos;s buried in government
            databases that aren&apos;t designed for parents. We pull that public data
            together, plot it on a map, and give you a simple way to organize
            your search — completely free, forever.
          </p>
        </div>
      </section>

      {/* What it does */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          What you can do
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Browse on a map",
              desc: "Every facility plotted with its real address. Click any pin to see full contact details, service type, and $10/day status.",
            },
            {
              title: "Search and filter",
              desc: "Narrow by area, age group, vacancy, or $10/day — or just type a name. Results update instantly.",
            },
            {
              title: "Organize your search",
              desc: "Mark facilities as contacted, waitlisted, or ruled out. Add your own notes, dates, and cost info — all saved locally in your browser.",
            },
            {
              title: "Understand the funding",
              desc: "Plain-language explainer of $10/day centres, CCFRI fee reductions, and the Affordable Child Care Benefit — with links to official sources.",
            },
            {
              title: "Track nannies too",
              desc: "Found someone on Facebook or Nextdoor? Log their rate, availability, and references alongside your daycare search.",
            },
            {
              title: "Take it with you",
              desc: "Export your tracker as a JSON backup. Import it on another device. Your data belongs to you.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border bg-white p-5">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y bg-indigo-50 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-6 text-center sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-indigo-700">{meta.count}+</p>
            <p className="mt-1 text-sm text-gray-600">Licensed facilities</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-700">2 regions</p>
            <p className="mt-1 text-sm text-gray-600">
              Victoria core &amp; Westshore
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-700">$0</p>
            <p className="mt-1 text-sm text-gray-600">
              Always free, open source
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Common questions
        </h2>
        <dl className="mt-8 space-y-6">
          {[
            {
              q: "Why is this free?",
              a: "Because childcare info shouldn't be behind a paywall. This is an open-source community project. The data comes from public government sources. If you'd like to chip in for hosting costs, there's a Buy Me a Coffee link — but it's entirely optional.",
            },
            {
              q: "Where does the data come from?",
              a: `Facility data is pulled from the BC Community Care Facility Registry (a public government dataset) and was last refreshed ${meta.lastUpdated ? new Date(meta.lastUpdated).toLocaleDateString("en-CA", { year: "numeric", month: "long" }) : "recently"}. We don't make it up — but availability and fees change constantly, so always call to confirm.`,
            },
            {
              q: "Are my notes private?",
              a: "Yes. Everything you type stays in your browser's local storage. Nothing is sent to a server. We don't have accounts, analytics, or tracking. Use the Export button to back up your data.",
            },
            {
              q: "What areas are covered?",
              a: "Greater Victoria (Victoria, Saanich, Oak Bay, Esquimalt, View Royal, Sidney, Central/North Saanich) and Westshore (Langford, Colwood, Metchosin, Highlands, Sooke).",
            },
            {
              q: "What's the deal with $10/day?",
              a: "Some BC facilities participate in the $10 a Day ChildCareBC program — they charge no more than $10/day for full-time care. We flag the ones we can identify. Note: BC paused expanding the program in 2026, but existing centres remain active.",
            },
            {
              q: "Can I use this on my phone?",
              a: "Yes. The app works in any browser. On mobile, the detail panel opens as an overlay when you tap a facility.",
            },
          ].map((item) => (
            <div key={item.q}>
              <dt className="font-medium text-gray-900">{item.q}</dt>
              <dd className="mt-1 text-sm text-gray-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA */}
      <section className="border-t bg-indigo-600 px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-white">
          Ready to explore?
        </h2>
        <p className="mt-2 text-indigo-100">
          No sign-up. No payment. Just open the map.
        </p>
        <a
          href="#/app"
          className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-indigo-600 shadow hover:bg-indigo-50 transition"
        >
          Open the Hub
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 px-6 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center text-sm text-gray-500">
          <p>
            Data sourced from the{" "}
            <a
              href="https://catalogue.data.gov.bc.ca/dataset/4cc207cc-ff03-44f8-8c5f-415af5224646"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              BC Community Care Facility Registry
            </a>
            . Always confirm details directly with facilities.
          </p>
          <div className="flex gap-4">
            <a
              href={`https://buymeacoffee.com/${bmcUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600"
            >
              Buy me a coffee
            </a>
            <a
              href="https://github.com/juansanar/vic_daycare_hub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600"
            >
              GitHub
            </a>
          </div>
          <p className="text-xs text-gray-400">
            Open-source &middot; MIT License &middot; A community project for
            Victoria &amp; Westshore families
          </p>
        </div>
      </footer>
    </div>
  );
}
