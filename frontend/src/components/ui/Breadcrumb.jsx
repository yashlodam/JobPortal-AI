/**
 * src/components/ui/Breadcrumb.jsx
 */
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-muted mb-4 overflow-x-auto py-1">
      <Link to="/recruiter/dashboard" className="flex items-center gap-1 hover:text-body transition-colors shrink-0">
        <Home className="h-3.5 w-3.5" />
        <span>Dashboard</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="h-3.5 w-3.5 text-muted/50 shrink-0" />
            {isLast || !item.url ? (
              <span className="font-semibold text-heading shrink-0">{item.label}</span>
            ) : (
              <Link to={item.url} className="hover:text-body transition-colors shrink-0">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
