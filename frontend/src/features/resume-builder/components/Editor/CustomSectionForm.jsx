/**
 * src/features/resume-builder/components/Editor/CustomSectionForm.jsx
 * User-defined custom sections manager.
 */

import React from "react";
import { Layers, Plus, Trash2 } from "lucide-react";

export default function CustomSectionForm({ customSections = [], onChange }) {
  const handleAdd = () => {
    const newItem = {
      id: `custom-${Date.now()}`,
      sectionTitle: "Volunteering & Community",
      items: [
        {
          id: `item-${Date.now()}`,
          title: "Open Source Contributor",
          description: "Contributed to React ecosystem packages and open-source developer tooling.",
        },
      ],
    };
    onChange([...customSections, newItem]);
  };

  const handleRemoveSection = (secId) => {
    onChange(customSections.filter((item) => item.id !== secId));
  };

  const handleUpdateSectionTitle = (secId, title) => {
    onChange(
      customSections.map((item) => (item.id === secId ? { ...item, sectionTitle: title } : item))
    );
  };

  return (
    <div className="space-y-6 font-satoshi text-body">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-lg font-black text-heading flex items-center gap-2">
            <Layers size={20} className="text-indigo-500 dark:text-indigo-400" /> Custom Sections
          </h3>
          <p className="text-xs text-muted font-medium">Add user-defined sections such as Volunteering, Publications, or Speaking.</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-md"
        >
          <Plus size={14} /> Add Custom Section
        </button>
      </div>

      {customSections.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface-elevated/40 border border-border text-center space-y-3">
          <p className="text-xs text-muted font-medium">No custom sections added yet.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover text-xs font-bold text-primary transition cursor-pointer"
          >
            + Add Custom Section
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {customSections.map((sec) => (
            <div key={sec.id} className="p-5 rounded-2xl bg-surface border border-border space-y-4 relative">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  value={sec.sectionTitle || ""}
                  onChange={(e) => handleUpdateSectionTitle(sec.id, e.target.value)}
                  placeholder="Custom Section Title (e.g. Volunteering)"
                  className="px-4 py-2 rounded-xl bg-surface-elevated border border-border text-sm text-heading font-black focus:outline-none focus:border-indigo-500 transition"
                />

                <button
                  onClick={() => handleRemoveSection(sec.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-black transition cursor-pointer"
                  title="Remove Custom Section"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
