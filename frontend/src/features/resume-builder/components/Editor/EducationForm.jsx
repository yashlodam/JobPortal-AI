/**
 * src/features/resume-builder/components/Editor/EducationForm.jsx
 * Education history array manager.
 */

import React from "react";
import { GraduationCap, Plus, Trash2 } from "lucide-react";

export default function EducationForm({ education = [], onChange }) {
  const handleAdd = () => {
    const newItem = {
      id: `edu-${Date.now()}`,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      grade: "",
      location: "",
      description: "",
    };
    onChange([...education, newItem]);
  };

  const handleRemove = (id) => {
    onChange(education.filter((item) => item.id !== id));
  };

  const handleUpdate = (id, field, value) => {
    onChange(
      education.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-6 font-satoshi text-body">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-lg font-black text-heading flex items-center gap-2">
            <GraduationCap size={20} className="text-indigo-500 dark:text-indigo-400" /> Education History
          </h3>
          <p className="text-xs text-muted font-medium">Degrees, universities, GPAs, and academic achievements.</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-md shadow-indigo-500/20"
        >
          <Plus size={14} /> Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface-hover border border-border text-center space-y-3">
          <p className="text-xs text-muted font-medium">No education entries added yet.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border text-xs font-bold text-indigo-500 dark:text-indigo-400 transition cursor-pointer"
          >
            + Add First Education Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {education.map((item, idx) => (
            <div key={item.id} className="p-5 rounded-2xl bg-surface-hover border border-border space-y-4 relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                  Education #{idx + 1}
                </span>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 transition cursor-pointer"
                  title="Remove Entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div className="space-y-1.5">
                  <label className="text-muted uppercase tracking-wider block">University / Institution</label>
                  <input
                    type="text"
                    value={item.institution || ""}
                    onChange={(e) => handleUpdate(item.id, "institution", e.target.value)}
                    placeholder="e.g. Pune Institute of Computer Technology"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted uppercase tracking-wider block">Degree</label>
                  <input
                    type="text"
                    value={item.degree || ""}
                    onChange={(e) => handleUpdate(item.id, "degree", e.target.value)}
                    placeholder="e.g. B.Tech / Bachelor of Science"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted uppercase tracking-wider block">Field of Study</label>
                  <input
                    type="text"
                    value={item.fieldOfStudy || ""}
                    onChange={(e) => handleUpdate(item.id, "fieldOfStudy", e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted uppercase tracking-wider block">Grade / CGPA</label>
                  <input
                    type="text"
                    value={item.grade || ""}
                    onChange={(e) => handleUpdate(item.id, "grade", e.target.value)}
                    placeholder="e.g. 8.9 / 10 CGPA"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted uppercase tracking-wider block">Start Date</label>
                  <input
                    type="text"
                    value={item.startDate || ""}
                    onChange={(e) => handleUpdate(item.id, "startDate", e.target.value)}
                    placeholder="e.g. Aug 2019"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted uppercase tracking-wider block">End Date / Expected</label>
                  <input
                    type="text"
                    value={item.endDate || ""}
                    onChange={(e) => handleUpdate(item.id, "endDate", e.target.value)}
                    placeholder="e.g. May 2023"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
