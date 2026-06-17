import meta from "../../data/meta.json";

const bmcUsername = import.meta.env.VITE_BMC_USERNAME || "vic_daycare_hub";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
        <p className="mb-4 text-sm font-medium tracking-wide text-indigo-600 uppercase">
          Free &middot; No account needed &middot; Victoria &amp; Westshore BC
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Stop Googling.{" "}
          <span className="text-indigo-600">Start finding childcare.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Every licensed childcare facility in Victoria and the Westshore — with
          interactive maps, personal tracking, $10/day flags, and resources. All
          free, all in one place.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#/app"
            className="rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Open the Tracker
          </a>
          <a
            href={`https://buymeacoffee.com/${bmcUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Support this project
          </a>
        </div>
      </header>

      {/* Stats */}
      <section className="border-y bg-gray-50 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-6 text-center sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-indigo-600">{meta.count}+</p>
            <p className="mt-1 text-sm text-gray-600">Licensed facilities</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-600">2</p>
            <p className="mt-1 text-sm text-gray-600">
              Areas: Victoria &amp; Westshore
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-600">Free</p>
            <p className="mt-1 text-sm text-gray-600">
              No payment, no account
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Finding daycare in Victoria takes too many hours
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900">No single source</h3>
            <p className="mt-2 text-sm text-gray-600">
              Google only finds daycares with websites. Many excellent facilities
              are invisible online.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900">Notes everywhere</h3>
            <p className="mt-2 text-sm text-gray-600">
              Texts, browser tabs, sticky notes, voice memos — nothing in one
              place, nothing organized.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900">$10/day confusion</h3>
            <p className="mt-2 text-sm text-gray-600">
              Which centres charge $10/day? What&apos;s CCFRI? What&apos;s ACCB? Nobody
              explains it clearly.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900">
              Waitlists take forever
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              You need to get on waitlists early, but finding who to call takes
              weeks of scattered research.
            </p>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="border-t bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Everything in one place
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "All licensed facilities",
                desc: "Every facility from the BC Community Care Registry for Victoria and Westshore — including the ones with no website.",
              },
              {
                title: "Interactive map",
                desc: "See facilities on a map with clustered markers. Click to view details, center on your location.",
              },
              {
                title: "Filter by what matters",
                desc: "Age group, $10/day status, vacancy, your personal tracking status. Find what fits in seconds.",
              },
              {
                title: "Personal tracker",
                desc: "Log your status, waitlist dates, costs, food info, and notes for every facility — saved in your browser.",
              },
              {
                title: "$10/day centres flagged",
                desc: "Verified $10/day ChildCareBC centres are clearly marked. Filter to see only those.",
              },
              {
                title: "Resources & checklists",
                desc: "Document checklist, questions to ask, plain-English explainer of CCFRI, ACCB, and $10/day.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border bg-white p-5">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-gray-900">FAQ</h2>
        <dl className="mt-8 space-y-6">
          {[
            {
              q: "Is this really free?",
              a: "Yes. No payment, no account, no catch. It's an open-source community tool. If you find it helpful, you can optionally support us via Buy Me a Coffee.",
            },
            {
              q: "Will my notes be saved?",
              a: "Yes — your notes auto-save in your browser (localStorage). They'll be there every time you open the site on the same device. Use Export to back up or transfer between devices.",
            },
            {
              q: "How often is the data updated?",
              a: `The facility list is sourced from the BC Community Care Registry and was last updated ${meta.lastUpdated ? new Date(meta.lastUpdated).toLocaleDateString("en-CA", { year: "numeric", month: "long" }) : "recently"}. Availability and cost change frequently — always call to confirm.`,
            },
            {
              q: "What areas are covered?",
              a: "Victoria (including Saanich, Oak Bay, Esquimalt, View Royal, Sidney, Central/North Saanich) and Westshore (Langford, Colwood, Metchosin, Highlands, Sooke).",
            },
            {
              q: "What about $10/day centres?",
              a: "Verified $10/day ChildCareBC centres are flagged in the tracker. Note: BC paused program expansion in Budget 2026 — existing centres remain active.",
            },
          ].map((item) => (
            <div key={item.q}>
              <dt className="font-medium text-gray-900">{item.q}</dt>
              <dd className="mt-1 text-sm text-gray-600">{item.a}</dd>
            </div>
          ))}
        </dl>
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
            . Always confirm directly with facilities.
          </p>
          <div className="flex gap-4">
            <a
              href={`https://buymeacoffee.com/${bmcUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600"
            >
              Support this project
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
            Open-source &middot; MIT License &middot; Built for Victoria
            families
          </p>
        </div>
      </footer>
    </div>
  );
}
