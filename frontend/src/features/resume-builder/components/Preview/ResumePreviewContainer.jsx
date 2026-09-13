/**
 * src/features/resume-builder/components/Preview/ResumePreviewContainer.jsx
 * Enterprise Production-Ready A4 PDF Generator & Preview Canvas.
 * Generates 1-Page, High-DPI ATS-Friendly PDF downloads directly using pdfGenerationService (100% Decoupled from AI).
 */

import React, { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, Download, Layout, Loader2, RotateCcw } from "lucide-react";
import { useResumeBuilder } from "../../hooks/useResumeBuilder";
import { useToast } from "../../../../components/ui/ToastNotification";
import { RESUME_TEMPLATES } from "../../constants/resumeTemplates";
import { pdfGenerationService } from "../../services/pdfGenerationService";
import A4Sheet from "./A4Sheet";

export default function ResumePreviewContainer({ resume }) {
  const toast = useToast();
  const { setSelectedTemplate } = useResumeBuilder();
  const [zoom, setZoom] = useState(100);
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-fit zoom to device width on mobile screens
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Fits within mobile screen (leaving 28px for container padding and margins)
        const targetWidth = Math.max(280, width - 28);
        const calculatedScale = Math.min(100, Math.max(36, Math.floor((targetWidth / 794) * 100)));
        setZoom(calculatedScale);
      } else if (width < 1024) {
        const targetWidth = Math.max(480, width - 64);
        const calculatedScale = Math.min(100, Math.max(50, Math.floor((targetWidth / 794) * 100)));
        setZoom(calculatedScale);
      } else {
        setZoom(100);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDownloadPDF = async () => {
    if (isDownloading) return;

    const sourceElement = document.getElementById("printable-resume-sheet");
    if (!sourceElement) {
      toast.error("Unable to generate resume. Please try again.");
      return;
    }

    const candidateName = resume?.personalInfo?.fullName || resume?.fullName || "Candidate";

    try {
      setIsDownloading(true);
      toast.info("Generating Resume...");
      await pdfGenerationService.generateResumePdf(sourceElement, candidateName);
      toast.success("Resume Downloaded Successfully");
    } catch (err) {
      toast.error("Unable to generate resume. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleZoomReset = () => {
    if (window.innerWidth < 640) {
      const targetWidth = Math.max(280, window.innerWidth - 28);
      setZoom(Math.min(100, Math.max(36, Math.floor((targetWidth / 794) * 100))));
    } else {
      setZoom(100);
    }
  };

  const scaleFactor = zoom / 100;
  const scaledWidth = Math.round(794 * scaleFactor);
  const scaledHeight = Math.round(1123 * scaleFactor);

  return (
    <div className="space-y-4 font-satoshi text-body">
      {/* Responsive Controls Bar */}
      <div className="p-3.5 rounded-3xl bg-surface border border-border backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Template Selector Pill */}
        <div className="flex items-center gap-2 justify-between sm:justify-start">
          <span className="text-xs font-black text-muted uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Layout size={14} className="text-indigo-500 dark:text-indigo-400" /> Template:
          </span>
          <select
            value={resume?.templateId || "professional"}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            style={{ colorScheme: "auto" }}
            className="flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 rounded-xl bg-surface-hover border border-border text-xs font-extrabold text-heading focus:outline-none focus:border-indigo-500 cursor-pointer shadow-inner"
          >
            {RESUME_TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id} className="bg-surface text-heading font-medium">
                {tpl.name}
              </option>
            ))}
          </select>
        </div>

        {/* Zoom & Direct PDF Download Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* Zoom Control Group */}
          <div className="flex items-center gap-1 bg-surface-hover border border-border px-2.5 py-1.5 sm:py-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(35, z - 10))}
              className="p-1 text-muted hover:text-heading transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="text-[11px] font-mono font-black text-indigo-500 dark:text-indigo-300 w-12 text-center hover:text-heading transition cursor-pointer"
              title="Fit / Reset Zoom"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(130, z + 10))}
              className="p-1 text-muted hover:text-heading transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Direct Download PDF CTA Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
            title="Download 1-Page ATS PDF Resume"
          >
            {isDownloading ? (
              <>
                <Loader2 size={15} className="animate-spin text-amber-300" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* A4 Paper Scalable Canvas — Responsive & No Horizontal Scroll */}
      <div className="overflow-x-hidden overflow-y-auto max-h-[78vh] p-2 sm:p-8 bg-surface-hover/80 rounded-3xl border border-border flex justify-center shadow-inner relative">
        <div
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            position: "relative",
            overflow: "hidden",
          }}
          className="transition-all duration-200 shadow-2xl rounded-lg shrink-0 mx-auto"
        >
          <div
            id="printable-resume-sheet"
            style={{
              transform: `scale(${scaleFactor})`,
              transformOrigin: "top left",
              width: "794px",
              minHeight: "1123px",
            }}
            className="bg-white"
          >
            <A4Sheet resume={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}
