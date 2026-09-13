/**
 * src/components/ui/Card.jsx
 * Semantic token-based card primitives. Works in both light and dark themes.
 */
import React from "react";

export function Card({ children, className = "", hover = false, glow = false, ...props }) {
  return (
    <div
      className={`
        bg-surface border border-border rounded-xl
        transition-all duration-300
        ${hover ? "hover:-translate-y-0.5 hover:border-border-hover hover:shadow-card" : ""}
        ${glow ? "hover:shadow-glow-primary" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`px-5 py-4 border-b border-border ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3 className={`text-base font-semibold text-heading ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p className={`text-sm text-muted mt-0.5 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div className={`px-5 py-4 border-t border-border flex items-center gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
