import ThemeToggle from "./ThemeToggle";
import { useStore } from "../store";

export default function TermsOfService() {
  const setFeedbackOpen = useStore((s) => (s as any).setFeedbackOpen);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = "#/";
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900 transition-colors duration-200 dark:bg-stone-950 dark:text-stone-100 theme-transition">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/85 px-4 py-3 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/85">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-stone-50 hover:shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <a
            href="#/"
            className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-emerald-700 dark:text-emerald-450"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-6 w-6 object-contain rounded-md"
            />
            <span>Victoria Childcare Hub</span>
          </a>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        
        {/* Document Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-stone-250/30 bg-stone-100/50 px-4 py-1.5 text-[11px] font-medium text-stone-605 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-400">
            Victoria Childcare Hub &middot; Terms of Use
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-stone-50">
            Terms of Service
          </h1>
          <p className="mt-3 text-xs text-gray-400 dark:text-stone-500">
            Last updated: July 1, 2026
          </p>
        </div>

        {/* Policy Body */}
        <article className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-gray-655 dark:text-stone-300">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-100 dark:border-stone-850">
              1. What Victoria Childcare Hub is
            </h2>
            <p>
              Victoria Childcare Hub is a free, open-source community platform created to help families locate and track licensed childcare spaces in the Greater Victoria area.
            </p>
            <p>
              We compile publicly available government records, health inspection logs, and community updates into an interactive map and listing directory. <strong>We do not operate childcare facilities, process enrollment applications, or guarantee childcare placements.</strong> Any placement or waiting list contract is strictly between you and the respective childcare provider.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-105 dark:border-stone-850">
              2. Daycare Listings & Accuracy Disclaimer
            </h2>
            <p>
              Daycare details, $10/day flags, fee reduction eligibility (CCFRI), age capacities, and inspection history are parsed from sources such as the BC Community Care Facility Registry and Island Health.
            </p>
            <p>
              While we run scrapers and validations to keep this data as fresh as possible, childcare availability, fees, and program guidelines fluctuate constantly. All directory details are provided on an <strong>"as-is" and "as-available" basis without warranties of any kind</strong>. You are solely responsible for contacting facilities directly to confirm their current fees, waitlist conditions, and enrollment availability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-105 dark:border-stone-850">
              3. User Tracker & Data Storage
            </h2>
            <p>
              The hub offers a personal tracker to organize your applications.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-500 dark:text-stone-450">
              <li>
                <strong>Local Storage:</strong> By default, tracker notes are saved directly in your browser. If you clear your browser cache, delete site history, or use incognito/private windows, your tracker history may be lost. You are responsible for using our <strong>Export / Import</strong> feature to back up your records.
              </li>
              <li>
                <strong>Cloud Sync (Optional):</strong> If you choose to enable database synchronization, you must sign in with a Google account. You are responsible for keeping your credentials secure.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-105 dark:border-stone-850">
              4. Appropriate Conduct
            </h2>
            <p>
              We want to maintain a helpful and clean experience for Victoria families. When using our in-app feedback or data correction forms:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-500 dark:text-stone-450">
              <li>You agree to submit only truthful, accurate, and respectful information.</li><li>You agree not to spam, submit malicious code, or attempt to compromise site functions.</li><li>We reserve the right to remove feedback reports, block access, or clear synchronized databases that violate these principles.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-105 dark:border-stone-850">
              5. License & Open Source
            </h2>
            <p>
              The code backing this website is open-source and released under the <strong>MIT License</strong>. You are welcome to audit, review, or submit improvements on our GitHub repository.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-105 dark:border-stone-850">
              6. Questions & Contacts
            </h2>
            <p>
              If you have any questions about these Terms, wish to suggest a correction, or report a bug, please:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-500 dark:text-stone-450">
              <li>
                Submit a report on our{" "}
                <a
                  href="https://github.com/juansanar/vic_daycare_hub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline dark:text-emerald-450"
                >
                  GitHub project page
                </a>.
              </li>
              <li>
                Or launch our{" "}
                <button
                  onClick={() => setFeedbackOpen(true)}
                  className="text-emerald-600 hover:underline font-semibold dark:text-emerald-450 cursor-pointer border-none bg-transparent p-0 inline align-baseline"
                >
                  In-App Feedback Form
                </button>{" "}
                to reach our community maintainers directly.
              </li>
            </ul>
          </section>

        </article>

        {/* Back navigation footer */}
        <div className="mt-12 flex justify-center border-t border-stone-200 pt-8 dark:border-stone-800">
          <button
            onClick={handleBack}
            className="rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            Return to Victoria Childcare Hub
          </button>
        </div>

      </main>
    </div>
  );
}
