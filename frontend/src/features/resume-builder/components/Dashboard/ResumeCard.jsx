/**
 * src/features/resume-builder/components/Dashboard/ResumeCard.jsx
 * Individual Resume Card with Edit, Preview, Duplicate, Analyze, Download, & Delete actions.
 */

import React, { useState } from "react";
import {
  Edit3,
  Eye,
  Copy,
  BarChart2,
  Download,
  Trash2,
  MoreVertical,
  Calendar,
  Sparkles,
  Award,
} from "lucide-react";
import { useToast } from "../../../../components/ui/ToastNotification";

export default function ResumeCard({ resume, onEdit, onPreview, onDuplicate, onAnalyze, onDownload, onDelete }) {
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const title = resume.title || "Untitled Resume";
  const templateName = resume.templateId ? resume.templateId.toUpperCase() : "PROFESSIONAL";
  const updatedDate = resume.lastUpdated
    ? new Date(resume.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Recently";
  const completion = resume.completionPercentage || 85;
  const atsScore = resume.atsScore || 82;

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border hover:border-indigo-500/40 backdrop-blur-2xl shadow-xl transition-all font-satoshi flex flex-col justify-between space-y-5 text-body relative group">
      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-wider">
            {templateName} Template
          </span>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-xl bg-surface-hover hover:bg-surface-elevated text-muted hover:text-heading transition cursor-pointer border border-border"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-surface-elevated border border-border shadow-2xl p-1.5 space-y-1 font-satoshi text-xs font-bold"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => { setMenuOpen(false); onEdit(resume); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-body hover:text-heading hover:bg-surface-hover transition cursor-pointer"
                >
                  <Edit3 size={14} className="text-indigo-500 dark:text-indigo-400" /> Edit Resume
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onPreview(resume); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-body hover:text-heading hover:bg-surface-hover transition cursor-pointer"
                >
                  <Eye size={14} className="text-purple-500 dark:text-purple-400" /> Live Preview
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDuplicate(resume); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-body hover:text-heading hover:bg-surface-hover transition cursor-pointer"
                >
                  <Copy size={14} className="text-amber-500 dark:text-amber-400" /> Duplicate
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onAnalyze(resume); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-body hover:text-heading hover:bg-surface-hover transition cursor-pointer"
                >
                  <BarChart2 size={14} className="text-cyan-500 dark:text-cyan-400" /> ATS Audit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDownload(resume); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-body hover:text-heading hover:bg-surface-hover transition cursor-pointer"
                >
                  <Download size={14} className="text-emerald-500 dark:text-emerald-400" /> Download PDF
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => { setMenuOpen(false); onDelete(resume.id); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-xl font-black text-heading line-clamp-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition">{title}</h3>
        <p className="text-xs text-muted font-medium flex items-center gap-1.5">
          <Calendar size={13} className="text-indigo-500 dark:text-indigo-400" /> Updated {updatedDate}
        </p>
      </div>

      {/* Strength & ATS Badges */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-surface-hover border border-border text-xs font-bold">
        <div>
          <span className="text-[10px] text-muted font-black uppercase tracking-wider block">Strength</span>
          <div className="flex items-center gap-1.5 mt-0.5 text-indigo-500 dark:text-indigo-400">
            <Sparkles size={14} />
            <span>{completion}%</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-muted font-black uppercase tracking-wider block">ATS Score</span>
          <div className="flex items-center gap-1.5 mt-0.5 text-emerald-500 dark:text-emerald-400">
            <Award size={14} />
            <span>{atsScore}/100</span>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          onClick={() => onEdit(resume)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-lg shadow-indigo-500/20"
        >
          <Edit3 size={14} /> Edit Resume
        </button>
        <button
          onClick={() => onPreview(resume)}
          className="p-2.5 rounded-2xl bg-surface-hover hover:bg-surface-elevated border border-border text-body hover:text-heading transition cursor-pointer"
          title="Preview Resume"
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
}
