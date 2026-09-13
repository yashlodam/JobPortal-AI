/**
 * src/features/resume-analyzer/components/UploadProgress.jsx
 * Upload Progress Component displaying file details, progress bar percentage, and status.
 */

import React from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, Loader2, X } from "lucide-react";

export default function UploadProgress({
  fileName = "",
  fileSize = "",
  progress = 0,
  onCancel = null,
}) {
  const isComplete = progress >= 100;

  return (
    <div className="p-5 rounded-3xl bg-surface border border-indigo-500/30 backdrop-blur-2xl shadow-xl space-y-3 font-satoshi max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-heading line-clamp-1">{fileName || "Uploaded Resume"}</h4>
            <p className="text-xs text-muted font-medium">{fileSize || "PDF / DOCX Document"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 size={14} /> Ready
            </span>
          ) : (
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Loader2 size={14} className="animate-spin" /> {progress}%
            </span>
          )}

          {onCancel && !isComplete && (
            <button onClick={onCancel} className="p-1 rounded-full hover:bg-surface-elevated text-muted hover:text-heading">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden relative">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
