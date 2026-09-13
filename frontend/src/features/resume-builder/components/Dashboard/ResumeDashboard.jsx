/**
 * src/features/resume-builder/components/Dashboard/ResumeDashboard.jsx
 * Resume Builder Dashboard displaying resumes, recent drafts, creation CTA, skeletons & empty states.
 */

import React, { useEffect, useState } from "react";
import { Plus, FileText, Sparkles, FolderKanban } from "lucide-react";
import { useResumeBuilder } from "../../hooks/useResumeBuilder";
import { useToast } from "../../../../components/ui/ToastNotification";
import { pdfGenerationService } from "../../services/pdfGenerationService";
import ResumeCard from "./ResumeCard";
import CreateResumeModal from "./CreateResumeModal";

export default function ResumeDashboard() {
  const toast = useToast();
  const {
    resumes,
    loading,
    fetchResumes,
    deleteResume,
    duplicateResume,
    createResume,
    setCurrentResume,
    setViewMode,
  } = useResumeBuilder();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleEdit = (resume) => {
    setCurrentResume(resume);
    setViewMode("editor");
  };

  const handlePreview = (resume) => {
    setCurrentResume(resume);
    setViewMode("preview");
  };

  const handleDuplicate = async (resume) => {
    try {
      toast.info("Duplicating resume on cloud backend...");
      await duplicateResume(resume.id);
      toast.success("Resume duplicated successfully!");
    } catch (err) {
      toast.error(err || "Failed to duplicate resume.");
    }
  };

  const handleAnalyze = (resume) => {
    toast.info(`Connecting ${resume.title} to AI ATS Auditor...`);
    window.location.href = "/career-hub/resume-analyzer";
  };

  const handleDownload = async (resume) => {
    setCurrentResume(resume);
    setViewMode("preview");

    // Wait 150ms for Preview DOM sheet to mount, then trigger instant PDF download
    setTimeout(async () => {
      const sourceElement = document.getElementById("printable-resume-sheet");
      if (sourceElement) {
        try {
          toast.info("Generating Resume...");
          const candidateName = resume?.personalInfo?.fullName || resume?.fullName || "Candidate";
          await pdfGenerationService.generateResumePdf(sourceElement, candidateName);
          toast.success("Resume Downloaded Successfully");
        } catch (err) {
          toast.error("Unable to generate resume. Please try again.");
        }
      }
    }, 150);
  };

  const handleDelete = async (id) => {
    try {
      await deleteResume(id);
      toast.success("Resume draft deleted.");
    } catch (err) {
      toast.error("Failed to delete resume.");
    }
  };

  const handleModalCreate = async (data) => {
    try {
      toast.info("Creating new resume in Spring Boot backend...");
      await createResume(data);
      toast.success("New resume created successfully! Customize your sections below.");
    } catch (err) {
      toast.error(err || "Failed to create resume.");
    }
  };

  return (
    <div className="space-y-8 font-satoshi py-4 text-body">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-satoshi">
            <Sparkles size={14} /> AI Resume Builder Studio
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-heading tracking-tight font-satoshi">
            Create & Optimize <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">ATS Resumes</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted font-medium max-w-xl leading-relaxed">
            Build high-impact, ATS-optimized technical resumes with real-time A4 preview, AI summary generation, bullet point rewrites, and enterprise templates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xl hover:scale-105 shrink-0 font-satoshi"
        >
          <Plus size={16} /> Create New Resume
        </button>
      </div>

      {/* Resumes Grid / Loading / Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-lg font-black text-heading font-satoshi flex items-center gap-2">
            <FolderKanban size={20} className="text-indigo-600 dark:text-indigo-400" /> My Resumes ({resumes.length})
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-surface border border-border p-6 space-y-4" />
            ))}
          </div>
        ) : !resumes || resumes.length === 0 ? (
          <div className="p-12 rounded-3xl bg-surface border border-border text-center space-y-4 shadow-sm">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <FileText size={32} />
            </div>
            <h4 className="text-xl font-black text-heading font-satoshi">No Resumes Found</h4>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto font-medium">
              You haven't created any resume drafts yet. Click below to start building your first high-scoring ATS resume.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-lg font-satoshi"
            >
              <Plus size={14} /> Create First Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((r) => (
              <ResumeCard
                key={r.id}
                resume={r}
                onEdit={handleEdit}
                onPreview={handlePreview}
                onDuplicate={handleDuplicate}
                onAnalyze={handleAnalyze}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <CreateResumeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleModalCreate}
      />
    </div>
  );
}
