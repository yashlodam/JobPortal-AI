/**
 * src/components/ui/Modal.jsx & Drawer.jsx
 * Master 3D Glassmorphic Modal & Drawer system.
 */
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            role="dialog"
            aria-modal="true"
            aria-label={title || "Dialog"}
            className={`relative w-full ${sizes[size]} max-h-[90vh] flex flex-col rounded-3xl border border-border bg-surface-elevated text-body shadow-2xl p-6 sm:p-7 z-10 overflow-hidden font-inter`}
          >
            {title && (
              <div className="flex items-center justify-between pb-4 border-b border-border bg-surface-elevated">
                <h3 className="text-xl font-black text-heading font-satoshi tracking-tight">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl p-2 text-muted hover:bg-surface hover:text-heading transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto pt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Drawer({ isOpen, onClose, title, children, position = "right" }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const slideVariants = {
    right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
    left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            variants={slideVariants[position]}
            initial="initial"
            animate="animate"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={title || "Drawer"}
            className={`relative ml-auto h-full w-full max-w-xl flex flex-col border-l border-border bg-surface-elevated text-body shadow-2xl p-6 sm:p-7 z-10 overflow-hidden font-inter`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border bg-surface-elevated">
              <h3 className="text-xl font-black text-heading font-satoshi tracking-tight">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl p-2 text-muted hover:bg-surface hover:text-heading transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
