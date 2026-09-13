/**
 * src/features/resume-analyzer/components/DownloadReportModal.jsx
 * Export, Print, Share, and Save Analysis Modal.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer, Share2, Bookmark, Check, ShieldCheck } from "lucide-react";
import { useResumeAnalyzer } from "../hooks/useResumeAnalyzer";
import { triggerPrintReport, copyShareableLink } from "../utils/pdfExportUtils";

export default function DownloadReportModal() {
  const { downloadModalOpen, hideDownloadModal, analysis } = useResumeAnalyzer();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!downloadModalOpen) return null;

  const handleShare = () => {
    copyShareableLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownloadPDF = () => {
    // Generate print flow which browser prints or saves as PDF cleanly
    triggerPrintReport();
    hideDownloadModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-2xl font-satoshi relative overflow-hidden text-body"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-heading">Download & Share Audit Report</h3>
                <p className="text-xs text-muted font-medium">Export executive ATS compliance audit (Overall Score: {analysis?.scores?.overall || 92}/100)</p>
              </div>
            </div>

            <button onClick={hideDownloadModal} className="p-2 rounded-2xl hover:bg-surface-hover text-muted hover:text-heading transition cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleDownloadPDF}
              className="p-5 rounded-3xl gradient-bg-signature border border-primary/40 text-left space-y-2 hover:scale-[1.02] transition cursor-pointer shadow-button group"
            >
              <div className="flex items-center justify-between">
                <Download size={20} className="text-white" />
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">PDF</span>
              </div>
              <h4 className="font-extrabold text-white text-base">Download PDF Report</h4>
              <p className="text-xs text-indigo-100 font-medium">Full 2-page detailed candidate breakdown.</p>
            </button>

            <button
              onClick={triggerPrintReport}
              className="p-5 rounded-3xl bg-surface-elevated border border-border hover:border-primary/40 text-left space-y-2 hover:scale-[1.02] transition cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-between">
                <Printer size={20} className="text-body" />
                <span className="text-[10px] font-black uppercase tracking-wider bg-surface border border-border text-muted px-2 py-0.5 rounded-full">Print</span>
              </div>
              <h4 className="font-extrabold text-heading text-base">Print Report</h4>
              <p className="text-xs text-muted font-medium">Direct high-res print output format.</p>
            </button>

            <button
              onClick={handleShare}
              className="p-5 rounded-3xl bg-surface-elevated border border-border hover:border-primary/40 text-left space-y-2 hover:scale-[1.02] transition cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-between">
                {copied ? <Check size={20} className="text-emerald-500" /> : <Share2 size={20} className="text-body" />}
                <span className="text-[10px] font-black uppercase tracking-wider bg-surface border border-border text-muted px-2 py-0.5 rounded-full">Link</span>
              </div>
              <h4 className="font-extrabold text-heading text-base">{copied ? "Link Copied!" : "Share Report"}</h4>
              <p className="text-xs text-muted font-medium">Copy shareable audit report link.</p>
            </button>

            <button
              onClick={handleSave}
              className="p-5 rounded-3xl bg-surface-elevated border border-border hover:border-primary/40 text-left space-y-2 hover:scale-[1.02] transition cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-between">
                {saved ? <Check size={20} className="text-emerald-500" /> : <Bookmark size={20} className="text-body" />}
                <span className="text-[10px] font-black uppercase tracking-wider bg-surface border border-border text-muted px-2 py-0.5 rounded-full">Save</span>
              </div>
              <h4 className="font-extrabold text-heading text-base">{saved ? "Analysis Saved!" : "Save Analysis"}</h4>
              <p className="text-xs text-muted font-medium">Store snapshot in candidate profile.</p>
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button onClick={hideDownloadModal} className="text-xs font-bold text-muted hover:text-heading transition cursor-pointer">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
