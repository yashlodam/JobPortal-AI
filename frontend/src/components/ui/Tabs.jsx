/**
 * src/components/ui/Tabs.jsx
 */
import React from "react";
import { motion } from "framer-motion";

export function Tabs({ tabs = [], activeTab, onChange, className = "" }) {
  return (
    <div role="tablist" className={`flex items-center gap-1 border-b border-border overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              isActive ? "text-heading font-bold" : "text-muted hover:text-body"
            }`}
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isActive ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40"
              }`}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
