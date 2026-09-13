/**
 * src/features/resume-analyzer/components/Timeline.jsx
 * Experience timeline display component.
 */

import React from "react";
import { Briefcase, MapPin, CheckCircle2 } from "lucide-react";
import SkillChip from "./SkillChip";

export default function Timeline({ items = [] }) {
  return (
    <div className="relative pl-6 space-y-8 border-l-2 border-primary/30 font-satoshi my-4">
      {items.map((item) => (
        <div key={item.id} className="relative group">
          {/* Node Dot */}
          <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full gradient-bg-signature border-4 border-surface shadow-sm group-hover:scale-125 transition" />

          <div className="p-6 rounded-3xl bg-surface border border-border hover:border-primary/40 backdrop-blur-xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h4 className="text-lg font-black text-heading">{item.role}</h4>
                <p className="text-xs font-black text-primary mt-0.5">{item.company}</p>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-xs font-bold text-muted bg-surface-elevated border border-border px-3 py-1 rounded-full inline-block">
                  {item.period}
                </span>
                {item.location && (
                  <p className="text-[10px] text-muted font-semibold mt-1 flex items-center justify-end gap-1">
                    <MapPin size={10} /> {item.location}
                  </p>
                )}
              </div>
            </div>

            {/* Bullet Highlights */}
            {item.highlights && (
              <ul className="space-y-2 text-xs sm:text-sm text-body font-medium">
                {item.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Tech stack used */}
            {item.technologies && (
              <div className="pt-2 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-black uppercase text-muted mr-1">Stack:</span>
                {item.technologies.map((tech) => (
                  <SkillChip key={tech} name={tech} type="detected" />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
