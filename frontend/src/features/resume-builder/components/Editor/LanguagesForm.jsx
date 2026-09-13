/**
 * src/features/resume-builder/components/Editor/LanguagesForm.jsx
 * Languages spoken & proficiency array manager.
 */

import React from "react";
import { Globe, Plus, Trash2 } from "lucide-react";

export default function LanguagesForm({ languages = [], onChange }) {
  const handleAdd = () => {
    const newItem = {
      id: `lang-${Date.now()}`,
      language: "",
      proficiency: "Full Professional",
    };
    onChange([...languages, newItem]);
  };

  const handleRemove = (id) => {
    onChange(languages.filter((item) => item.id !== id));
  };

  const handleUpdate = (id, field, value) => {
    onChange(
      languages.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-6 font-satoshi text-body">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-lg font-black text-heading flex items-center gap-2">
            <Globe size={20} className="text-primary" /> Languages Spoken
          </h3>
          <p className="text-xs text-muted font-medium">Add spoken languages and proficiency levels.</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl gradient-bg-signature text-white font-black text-xs transition cursor-pointer shadow-button hover:opacity-90"
        >
          <Plus size={14} /> Add Language
        </button>
      </div>

      {languages.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface-elevated border border-border text-center space-y-3">
          <p className="text-xs text-muted font-medium">No languages added yet.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-bold text-primary transition cursor-pointer"
          >
            + Add Language
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languages.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-3 relative flex items-center justify-between gap-3">
              <div className="space-y-2 flex-1 text-xs font-bold">
                <input
                  type="text"
                  value={item.language || ""}
                  onChange={(e) => handleUpdate(item.id, "language", e.target.value)}
                  placeholder="Language (e.g. English)"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-heading placeholder:text-muted focus:outline-none focus:border-primary font-medium transition"
                />
                <select
                  value={item.proficiency || "Full Professional"}
                  onChange={(e) => handleUpdate(item.id, "proficiency", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-heading focus:outline-none focus:border-primary font-medium transition"
                >
                  <option value="Native / Bilingual">Native / Bilingual</option>
                  <option value="Full Professional">Full Professional</option>
                  <option value="Professional Working">Professional Working</option>
                  <option value="Elementary">Elementary</option>
                </select>
              </div>

              <button
                onClick={() => handleRemove(item.id)}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition cursor-pointer shrink-0"
                title="Remove Entry"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
