/**
 * src/features/resume-builder/components/Editor/CertificationsForm.jsx
 * Certifications array manager.
 */

import React from "react";
import { Award, Plus, Trash2 } from "lucide-react";

export default function CertificationsForm({ certifications = [], onChange }) {
  const handleAdd = () => {
    const newItem = {
      id: `cert-${Date.now()}`,
      name: "",
      issuer: "",
      date: "",
      credentialUrl: "",
    };
    onChange([...certifications, newItem]);
  };

  const handleRemove = (id) => {
    onChange(certifications.filter((item) => item.id !== id));
  };

  const handleUpdate = (id, field, value) => {
    onChange(
      certifications.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-6 font-satoshi text-body">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-lg font-black text-heading flex items-center gap-2">
            <Award size={20} className="text-indigo-500 dark:text-indigo-400" /> Professional Certifications
          </h3>
          <p className="text-xs text-muted font-medium">AWS, Spring, Oracle, or Google Cloud official credentials.</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-md shadow-indigo-500/20"
        >
          <Plus size={14} /> Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface-hover border border-border text-center space-y-3">
          <p className="text-xs text-muted font-medium">No certifications added yet.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border text-xs font-bold text-indigo-500 dark:text-indigo-400 transition cursor-pointer"
          >
            + Add Certification
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-2xl bg-surface-hover border border-border space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                  Certification #{idx + 1}
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
                  value={item.name || ""}
                  onChange={(e) => handleUpdate(item.id, "name", e.target.value)}
                  placeholder="Certification Name (e.g. AWS Solutions Architect)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                />
                <input
                  type="text"
                  value={item.issuer || ""}
                  onChange={(e) => handleUpdate(item.id, "issuer", e.target.value)}
                  placeholder="Issuing Organization (e.g. Amazon Web Services)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                />
                <input
                  type="text"
                  value={item.date || ""}
                  onChange={(e) => handleUpdate(item.id, "date", e.target.value)}
                  placeholder="Issue Date (e.g. Mar 2024)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                />
                <input
                  type="text"
                  value={item.credentialUrl || ""}
                  onChange={(e) => handleUpdate(item.id, "credentialUrl", e.target.value)}
                  placeholder="Credential URL / Verification ID"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
