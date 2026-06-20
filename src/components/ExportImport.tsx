import { useRef } from "react";
import { useStore } from "../store";

export default function ExportImport() {
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vic-daycare-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        importData(reader.result);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExport}
        className="hover:text-emerald-600 dark:hover:text-emerald-450 transition"
      >
        Export
      </button>
      <span className="text-gray-300 dark:text-stone-700">|</span>
      <button
        onClick={handleImport}
        className="hover:text-emerald-600 dark:hover:text-emerald-450 transition"
      >
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
