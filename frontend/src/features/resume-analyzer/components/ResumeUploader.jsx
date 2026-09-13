/**
 * src/features/resume-analyzer/components/ResumeUploader.jsx
 * Reusable Drag & Drop Resume File Uploader supporting PDF and DOCX formats.
 */

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileCheck, AlertCircle } from "lucide-react";

export default function ResumeUploader({ onFileSelect, error }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4 font-satoshi">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleChange}
        className="hidden"
      />

      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 space-y-4 bg-surface backdrop-blur-2xl group ${
          dragActive
            ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            : "border-border hover:border-primary/60 hover:bg-surface-hover"
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto shadow-sm group-hover:scale-110 transition duration-300">
          <Upload size={32} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-black text-heading">
            Upload Your Resume
          </h3>
          <p className="text-xs sm:text-sm text-body font-medium">
            Drag & drop your PDF or DOCX file here, or <span className="text-primary font-bold underline">browse files</span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs text-muted font-medium pt-2">
          <span className="flex items-center gap-1.5">
            <FileCheck size={14} className="text-emerald-500" /> PDF & Word DOCX
          </span>
          <span>•</span>
          <span>Max 10MB</span>
        </div>
      </motion.div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
