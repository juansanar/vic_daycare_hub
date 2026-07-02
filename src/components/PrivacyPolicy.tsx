import ThemeToggle from "./ThemeToggle";
import { useStore } from "../store";

export default function PrivacyPolicy() {
  const setFeedbackOpen = useStore((s) => (s as any).setFeedbackOpen);
  const handleBack = () => {
    // Navigate back in history if possible, otherwise default to home hash
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-250/30 bg-emerald-50 px-4 py-1.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-450">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Privacy First &middot; Local storage by default &middot; Secure cloud sync
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-stone-50">
            Privacy Policy
          </h1>
          <p className="mt-3 text-xs text-gray-400 dark:text-stone-500">
            Last updated: July 1, 2026
          </p>
        </div>

        {/* Informational Banner */}
        <div className="mb-8 rounded-xl border border-emerald-200/50 bg-emerald-50/40 p-5 dark:border-emerald-900/30 dark:bg-emerald-950/10">
          <div className="flex gap-3">
            <span className="text-lg">🛡️</span>
            <div>
              <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Our Privacy Commitment</h3>
              <p className="mt-1 text-xs leading-relaxed text-emerald-700/90 dark:text-stone-400">
                Victoria Childcare Hub is a free, open-source community project built to help Victoria area families navigate daycare listings. We do not sell your personal data, run advertising networks, or track your behavior across the web.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Body */}
        <article className="prose prose-stone dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-gray-655 dark:text-stone-300">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-100 dark:border-stone-850">
              1. Information We Collect
            </h2>
            <p>
              We are committed to protecting the privacy and personal information of our website visitors and tracker users. Depending on how you interact with the hub, we may collect and process the following types of information:
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
              <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/50">
                <h3 className="text-xs font-bold text-gray-900 dark:text-stone-105 flex items-center gap-1.5">
                  <span className="text-sm">💻</span> Local Storage (Default)
                </h3>
                <p className="mt-2 text-xs text-gray-500 dark:text-stone-400 leading-relaxed">
                  If you use our daycare tracker without signing in, all daycare entries, costs, waitlist statuses, and custom notes are stored <strong>strictly on your own browser</strong>. No personal data is sent to a server.
                </p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/50">
                <h3 className="text-xs font-bold text-gray-900 dark:text-stone-105 flex items-center gap-1.5">
                  <span className="text-sm">☁️</span> Cloud Sync (Optional)
                </h3>
                <p className="mt-2 text-xs text-gray-500 dark:text-stone-400 leading-relaxed">
                  If you sign in using your Google account to sync data across devices, we collect your email address, display name, and Google profile picture URL, along with your synchronized daycare tracker database entries.
                </p>
              </div>
            </div>
            <p className="mt-3">
              <strong>Usage & Diagnostics Info:</strong> Like most websites, our hosting provider (Netlify) may temporarily collect technical connection details (IP address, browser type, and timestamps) in security and request logs for performance diagnostic purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-100 dark:border-stone-850">
              2. How We Use Your Information
            </h2>
            <p>We use the data we collect solely for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-500 dark:text-stone-450">
              <li>To provide and operate the interactive map and daycare registry;</li><li>To synchronize your personal daycare waitlist status, costs, and notes across your devices (only if signed in);</li><li>To enable the data Export/Import utilities so you can manage your files;</li><li>To monitor website loading performance, resolve technical bugs, and secure the hosting server.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-100 dark:border-stone-850">
              3. How We Share Your Information
            </h2>
            <p>
              <strong>We do not sell your personal information.</strong> We do not share your data with advertisers, third-party marketing companies, or data brokers. We share your information only with the following service providers to run the core features of the site:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-500 dark:text-stone-450">
              <li>
                <strong>Google Firebase:</strong> We use Firebase Authentication for Google Sign-In and Cloud Firestore to store and synchronize sync data. Synced data is hosted securely in the <code>northamerica-northeast2</code> (Toronto, Canada) region.
              </li>
              <li>
                <strong>Netlify:</strong> We host our static website code on Netlify. They process basic server requests and technical connection logs necessary to serve our page files.
              </li>
            </ul>
            <p className="mt-2 text-xs">
              These third parties are contractually obligated to safeguard your data and are strictly prohibited from using it for any other purpose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-100 dark:border-stone-850">
              4. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to safeguard your information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-500 dark:text-stone-450">
              <li>By default, tracker data stays local to your browser and never traverses the internet.</li><li>If you enable sync, data is transmitted securely via HTTPS and stored in Firestore behind user-specific database rules that verify authentication, ensuring only you can read or edit your documents.</li><li>Authentication handles access keys securely, and we maintain an audit of dependencies to prevent security leaks.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-100 dark:border-stone-850">
              5. Your Rights & Data Control
            </h2>
            <p>
              You have complete control and transparency over your personal daycare notes and waitlist data:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-500 dark:text-stone-450">
              <li>
                <strong>Export Data:</strong> At any time, you can click the "Export" button in the tracker settings to download a complete copy of your local tracker entries in JSON format.
              </li>
              <li>
                <strong>Delete Local Data:</strong> You can wipe all local storage data from the app settings page by clicking the "Clear all data" button or by clearing your browser cache.
              </li>
              <li>
                <strong>Delete Sync Data:</strong> If you are signed in and want to delete your synced database data, you can delete your daycare notes/statuses in the app interface which synchronizes the deletion, or sign out and contact the maintainers to delete your account record from the Firebase Console database.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-100 dark:border-stone-850">
              6. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect modifications in our features or changes in legal requirements. Any modifications will be posted here with an updated "last updated" date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-stone-200 pb-1.5 dark:text-stone-100 dark:border-stone-850">
              7. Contact Us
            </h2>
            <p>
              If you have any questions, feedback, or concerns regarding your privacy or data handling practices, please feel free to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-500 dark:text-stone-450">
              <li>
                Open an issue or submit a pull request on our{" "}
                <a
                  href="https://github.com/juansanar/vic_daycare_hub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline dark:text-emerald-450"
                >
                  GitHub Repository
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
                to submit an inquiry or correction directly to our team.
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
