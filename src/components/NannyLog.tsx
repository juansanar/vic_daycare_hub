import { useState } from "react";
import { useStore } from "../store";
import type { NannyEntry } from "../types";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const emptyEntry: Omit<NannyEntry, "id"> = {
  name: "",
  rate: "",
  availability: "",
  references: "",
  cprCert: false,
  criminalCheck: false,
  notes: "",
};

export default function NannyLog() {
  const nannyEntries = useStore((s) => s.nannyEntries);
  const addNanny = useStore((s) => s.addNanny);
  const updateNanny = useStore((s) => s.updateNanny);
  const removeNanny = useStore((s) => s.removeNanny);
  const [draft, setDraft] = useState<Omit<NannyEntry, "id">>(emptyEntry);
  const [editing, setEditing] = useState<string | null>(null);

  const handleAdd = () => {
    if (!draft.name.trim()) return;
    if (editing) {
      updateNanny(editing, draft);
      setEditing(null);
    } else {
      addNanny({ ...draft, id: generateId() });
    }
    setDraft(emptyEntry);
  };

  const startEdit = (entry: NannyEntry) => {
    setEditing(entry.id);
    const { id: _id, ...rest } = entry;
    setDraft(rest);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="mb-4 text-xl font-semibold">Nanny / Caregiver Log</h2>

      {/* Form */}
      <div className="mb-6 grid grid-cols-1 gap-3 rounded border p-4 sm:grid-cols-2">
        <input
          placeholder="Name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="rounded border px-2 py-1.5 text-sm"
        />
        <input
          placeholder="Rate (e.g. $20/hr)"
          value={draft.rate}
          onChange={(e) => setDraft({ ...draft, rate: e.target.value })}
          className="rounded border px-2 py-1.5 text-sm"
        />
        <input
          placeholder="Availability"
          value={draft.availability}
          onChange={(e) =>
            setDraft({ ...draft, availability: e.target.value })
          }
          className="rounded border px-2 py-1.5 text-sm"
        />
        <input
          placeholder="References"
          value={draft.references}
          onChange={(e) => setDraft({ ...draft, references: e.target.value })}
          className="rounded border px-2 py-1.5 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.cprCert}
            onChange={(e) => setDraft({ ...draft, cprCert: e.target.checked })}
          />
          CPR certified
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.criminalCheck}
            onChange={(e) =>
              setDraft({ ...draft, criminalCheck: e.target.checked })
            }
          />
          Criminal record check
        </label>
        <textarea
          placeholder="Notes"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          className="col-span-full rounded border px-2 py-1.5 text-sm"
          rows={2}
        />
        <button
          onClick={handleAdd}
          className="col-span-full rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          {editing ? "Update" : "Add"} Caregiver
        </button>
      </div>

      {/* List */}
      {nannyEntries.length === 0 ? (
        <p className="text-sm text-gray-500">No caregivers logged yet.</p>
      ) : (
        <ul className="divide-y">
          {nannyEntries.map((entry) => (
            <li key={entry.id} className="py-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{entry.name}</p>
                  <p className="text-sm text-gray-500">
                    {entry.rate} &middot; {entry.availability}
                  </p>
                  {entry.notes && (
                    <p className="mt-1 text-sm text-gray-400">{entry.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(entry)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeNanny(entry.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
