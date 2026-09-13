/**
 * src/features/resume-builder/components/Editor/ProjectsForm.jsx
 * Technical projects array manager with per-item AI bullet improver.
 * AI result writes directly into the textarea via Redux — no modal required.
 */

import React, { useState } from "react";
import { FolderGit2, Plus, Trash2, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useResumeBuilder } from "../../hooks/useResumeBuilder";
import { useToast } from "../../../../components/ui/ToastNotification";

export default function ProjectsForm({ projects = [], onChange }) {
  const toast = useToast();
  const { improveContent, aiLoading, aiSuggestion, currentResume } = useResumeBuilder();
  const [loadingItemId, setLoadingItemId] = useState(null);

  const handleAdd = () => {
    const newItem = {
      id: `proj-${Date.now()}`,
      name: "",
      projectName: "",
      description: "",
      technologies: "",
      githubUrl: "",
      liveUrl: "",
      startDate: "",
      endDate: "",
    };
    onChange([...projects, newItem]);
  };

  const handleRemove = (id) => {
    onChange(projects.filter((item) => item.id !== id));
  };

  const handleUpdate = (id, field, value) => {
    onChange(
      projects.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "name") updated.projectName = value;
          if (field === "projectName") updated.name = value;
          return updated;
        }
        return item;
      })
    );
  };

  const handleAIImprove = async (item) => {
    if (!currentResume?.id) {
      toast.error("Please save your resume before using AI improvements.");
      return;
    }
    if (!item.description && !item.name && !item.projectName) {
      toast.error("Please enter a project name or description before improving with AI.");
      return;
    }

    setLoadingItemId(item.id);
    toast.info("AI is improving your project description...");

    try {
      await improveContent({
        resumeId: currentResume.id,
        content: item.description || item.name || item.projectName || "Technical project",
        itemType: "projects",
        sectionType: "PROJECTS",
        itemId: item.id,
      });
      toast.success("AI improved your project description and applied it!");
    } catch {
      toast.error("AI improvement failed. Please try again.");
    } finally {
      setLoadingItemId(null);
    }
  };

  const getTechString = (tech) => {
    if (Array.isArray(tech)) return tech.join(", ");
    if (typeof tech === "string") return tech;
    return "";
  };

  return (
    <div className="space-y-6 font-satoshi text-body">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h3 className="text-lg font-black text-heading flex items-center gap-2">
            <FolderGit2 size={20} className="text-indigo-500 dark:text-indigo-400" /> Technical Projects
          </h3>
          <p className="text-xs text-muted font-medium">Highlight key software applications, repositories, and live URLs.</p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-md shadow-indigo-500/20"
        >
          <Plus size={14} /> Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface-hover border border-border text-center space-y-3">
          <p className="text-xs text-muted font-medium">No projects added yet.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border text-xs font-bold text-indigo-500 dark:text-indigo-400 transition cursor-pointer"
          >
            + Add First Project Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((item, idx) => {
            const isThisItemLoading = loadingItemId === item.id;
            const isThisItemApplied =
              aiSuggestion?.targetField === "projects" &&
              aiSuggestion?.itemId === item.id &&
              aiSuggestion?.applied;

            return (
              <div key={item.id} className="p-5 rounded-2xl bg-surface-hover border border-border space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                    Project #{idx + 1}
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
                    <label className="text-muted uppercase tracking-wider block">Project Name</label>
                    <input
                      type="text"
                      value={item.name || item.projectName || ""}
                      onChange={(e) => handleUpdate(item.id, "name", e.target.value)}
                      placeholder="e.g. AI-Powered Job Portal"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted uppercase tracking-wider block">Technologies / Tech Stack</label>
                    <input
                      type="text"
                      value={getTechString(item.technologies)}
                      onChange={(e) => handleUpdate(item.id, "technologies", e.target.value)}
                      placeholder="e.g. React 19, Spring Boot 3, PostgreSQL, Docker"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted uppercase tracking-wider block">GitHub Repository URL</label>
                    <input
                      type="text"
                      value={item.githubUrl || ""}
                      onChange={(e) => handleUpdate(item.id, "githubUrl", e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted uppercase tracking-wider block">Live Demo / Deployed URL</label>
                    <input
                      type="text"
                      value={item.liveUrl || ""}
                      onChange={(e) => handleUpdate(item.id, "liveUrl", e.target.value)}
                      placeholder="https://project-demo.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-heading placeholder:text-muted/60 focus:outline-none focus:border-indigo-500 font-medium transition"
                    />
                  </div>
                </div>

                {/* AI Applied confirmation banner */}
                {isThisItemApplied && !isThisItemLoading && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={13} />
                    AI improved description applied. Edit freely below.
                  </div>
                )}

                {/* Project Description with AI Improve CTA */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-muted uppercase tracking-wider">
                      Project Architecture & Achievements
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
                    rows={3}
                    value={item.description || ""}
                    onChange={(e) => handleUpdate(item.id, "description", e.target.value)}
                    placeholder="Engineered end-to-end recruitment platform with AI mock interviews and ATS analysis..."
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
