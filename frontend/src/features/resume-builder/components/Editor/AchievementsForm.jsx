/**
 * src/features/resume-builder/components/Editor/AchievementsForm.jsx
 * Honors & Awards array manager.
 */

import React from "react";
import { Trophy, Plus, Trash2 } from "lucide-react";

export default function AchievementsForm({ achievements = [], onChange }) {
  const handleAdd = () => {
    const newItem = {
      id: `ach-${Date.now()}`,
      title: "",
      description: "",
      date: "",
    };
    onChange([...achievements, newItem]);
  };

  const handleRemove = (id) => {
    onChange(achievements.filter((item) => item.id !== id));
  };

  const handleUpdate = (id, field, value) => {
    onChange(
      achievements.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-6 font-satoshi text-body">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-lg font-black text-heading flex items-center gap-2">
            <Trophy size={20} className="text-indigo-500 dark:text-indigo-400" /> Honors & Achievements
          </h3>
          <p className="text-xs text-muted font-medium">Hackathon wins, publications, patents, or company performance awards.</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-md shadow-indigo-500/20"
        >
          <Plus size={14} /> Add Achievement
        </button>
      </div>

      {achievements.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface-hover border border-border text-center space-y-3">
          <p className="text-xs text-muted font-medium">No achievements added yet.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border text-xs font-bold text-indigo-500 dark:text-indigo-400 transition cursor-pointer"
          >
            + Add Achievement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-2xl bg-surface-hover border border-border space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                  Achievement #{idx + 1}
                </span>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 transition cursor-pointer"
                  title="Remove Entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                <input
                  type="text"
                  value={item.title || ""}
                  onChange={(e) => handleUpdate(item.id, "title", e.target.value)}
                  placeholder="Achievement Title (e.g. Winner - National Hackathon 2024)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                />
                <input
                  type="text"
                  value={item.date || ""}
                  onChange={(e) => handleUpdate(item.id, "date", e.target.value)}
                  placeholder="Date (e.g. Feb 2024)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                />
              </div>

              <textarea
                rows={2}
                value={item.description || ""}
                onChange={(e) => handleUpdate(item.id, "description", e.target.value)}
                placeholder="Brief description of the honor or award..."
                className="w-full p-3 rounded-xl bg-surface border border-border text-xs text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
