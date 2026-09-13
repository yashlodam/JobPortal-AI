/**
 * src/features/mock-interview/components/DifficultySelector.jsx
 * Select difficulty levels (Beginner, Intermediate, Advanced, Expert).
 */

import React from "react";
import { DIFFICULTY_LEVELS } from "../constants/interviewData";
import { Check } from "lucide-react";

export default function DifficultySelector({ selectedDifficulty, onSelectDifficulty }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-satoshi">
      {DIFFICULTY_LEVELS.map((lvl) => {
        const isSelected = selectedDifficulty === lvl.id;

        return (
          <button
            type="button"
            key={lvl.id}
            onClick={() => onSelectDifficulty(lvl.id)}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-3 ${
              isSelected
                ? `${lvl.color} shadow-lg ring-1 ring-indigo-500`
                : "bg-surface border-border text-body hover:bg-surface-hover hover:text-heading"
            }`}
          >
            <div>
              <h5 className="text-xs font-black uppercase tracking-wider">{lvl.label}</h5>
              <p className="text-[11px] text-muted font-medium">{lvl.exp}</p>
            </div>
            {isSelected && <Check size={16} className="shrink-0 text-white" />}
          </button>
        );
      })}
    </div>
  );
}
