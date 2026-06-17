export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">Victoria Daycare Hub</h1>
      <p className="mt-4 text-lg text-gray-600">Loading...</p>
      <a
        href="#/app"
        className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
      >
        Open the Tracker
      </a>
    </div>
  );
}
