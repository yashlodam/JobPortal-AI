import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/**
 * SectionBadge — consistent label pill above every section heading.
 *
 * @param {string} children    - The badge text
 * @param {string} [className] - Extra classes on the wrapper
 */
function SectionBadge({ children, className = "" }) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 shadow-sm backdrop-blur-md ${
        isLight
          ? "border-indigo-200 bg-indigo-50/90 text-indigo-700"
          : "border-indigo-500/25 bg-indigo-500/10 text-indigo-300"
      } ${className}`}
    >
      <Sparkles
        size={12}
        aria-hidden="true"
        className={isLight ? "text-indigo-600" : "text-indigo-400"}
      />
      <span className="text-xs font-bold uppercase tracking-widest font-satoshi">
        {children}
      </span>
    </motion.div>
  );
}

export default SectionBadge;

