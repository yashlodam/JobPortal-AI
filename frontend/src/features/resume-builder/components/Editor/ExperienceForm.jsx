/**
 * src/features/resume-builder/components/Editor/ExperienceForm.jsx
 * Experience entries array manager with per-item AI bullet improvement.
 * AI result writes directly into the textarea via Redux — no modal required.
 */

import React, { useRef, useState } from "react";
import { Briefcase, Plus, Trash2, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useResumeBuilder } from "../../hooks/useResumeBuilder";
import { useToast } from "../../../../components/ui/ToastNotification";

export default function ExperienceForm({ experience = [], onChange }) {
  const toast = useToast();
  const { improveContent, aiLoading, aiSuggestion, currentResume } = useResumeBuilder();
  const [loadingItemId, setLoadingItemId] = useState(null);

  const handleAdd = () => {
    const newItem = {
      id: `exp-${Date.now()}`,
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    onChange([...experience, newItem]);
  };

  const handleRemove = (id) => {
    onChange(experience.filter((item) => item.id !== id));
  };

  const handleUpdate = (id, field, value) => {
    onChange(
      experience.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAIImprove = async (item) => {
    if (!currentResume?.id) {
      toast.error("Please save your resume before using AI improvements.");
      return;
    }
    if (!item.description && !item.position) {
      toast.error("Please enter some description or position before improving with AI.");
      return;
    }

    setLoadingItemId(item.id);
    toast.info("AI is improving your experience bullet points...");

    try {
      await improveContent({
        resumeId: currentResume.id,
        content: item.description || item.position || "Software engineering role",
        itemType: "experience",
        sectionType: "EXPERIENCE",
        itemId: item.id,
      });
      toast.success("AI improved your bullet points and applied them!");
    } catch {
      toast.error("AI improvement failed. Please try again.");
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <div className="space-y-6 font-satoshi text-body">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-lg font-black text-heading flex items-center gap-2">
            <Briefcase size={20} className="text-indigo-500 dark:text-indigo-400" /> Work Experience
          </h3>
          <p className="text-xs text-muted font-medium">Add past roles, achievements, and technical impact bullets.</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-md shadow-indigo-500/20"
        >
          <Plus size={14} /> Add Position
        </button>
      </div>

      {experience.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface-hover border border-border text-center space-y-3">
          <p className="text-xs text-muted font-medium">No experience entries added yet.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border text-xs font-bold text-indigo-500 dark:text-indigo-400 transition cursor-pointer"
          >
            + Add First Experience Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {experience.map((item, idx) => {
            const isThisItemLoading = loadingItemId === item.id;
            const isThisItemApplied =
              aiSuggestion?.targetField === "experience" &&
              aiSuggestion?.itemId === item.id &&
              aiSuggestion?.applied;

            return (
              <div key={item.id} className="p-5 rounded-2xl bg-surface-hover border border-border space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                    Position #{idx + 1}
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
                    <label className="text-muted uppercase tracking-wider block">Company Name</label>
                    <input
                      type="text"
                      value={item.company || ""}
                      onChange={(e) => handleUpdate(item.id, "company", e.target.value)}
                      placeholder="e.g. Google / Microsoft"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted uppercase tracking-wider block">Job Title / Position</label>
                    <input
                      type="text"
                      value={item.position || ""}
                      onChange={(e) => handleUpdate(item.id, "position", e.target.value)}
                      placeholder="e.g. Senior Full Stack Engineer"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted uppercase tracking-wider block">Location</label>
                    <input
                      type="text"
                      value={item.location || ""}
                      onChange={(e) => handleUpdate(item.id, "location", e.target.value)}
                      placeholder="e.g. Bengaluru, India"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted uppercase tracking-wider block">Start Date</label>
                    <input
                      type="text"
                      value={item.startDate || ""}
                      onChange={(e) => handleUpdate(item.id, "startDate", e.target.value)}
                      placeholder="e.g. Jan 2023"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted uppercase tracking-wider block">End Date</label>
                    <input
                      type="text"
                      value={item.current ? "Present" : item.endDate || ""}
                      onChange={(e) => handleUpdate(item.id, "endDate", e.target.value)}
                      disabled={item.current}
                      placeholder="e.g. Present"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    id={`curr-${item.id}`}
                    checked={item.current || false}
                    onChange={(e) => handleUpdate(item.id, "current", e.target.checked)}
                    className="rounded border-border bg-surface text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor={`curr-${item.id}`} className="text-muted font-medium cursor-pointer">
                    I currently work in this role
                  </label>
                </div>

                {/* AI Applied confirmation banner */}
                {isThisItemApplied && !isThisItemLoading && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={13} />
                    AI improved bullets applied. Edit freely below.
                  </div>
                )}

                {/* Bullet Points Description with AI Improve CTA */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-muted uppercase tracking-wider">
                      Responsibilities & Achievements
                    </label>
                    <button
                      onClick={() => handleAIImprove(item)}
                      disabled={isThisItemLoading || aiLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-black text-[11px] hover:bg-indigo-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isThisItemLoading ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Sparkles size={11} className="text-amber-400" />
                      )}
                      {isThisItemLoading ? "AI Improving..." : "Improve with AI"}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={item.description || ""}
                    onChange={(e) => handleUpdate(item.id, "description", e.target.value)}
                    placeholder="Architected Spring Boot 3 microservices handling 500k+ daily transactions with 99.9% uptime..."
                    className="w-full p-4 rounded-xl bg-surface border border-border text-xs sm:text-sm text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium leading-relaxed transition resize-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
