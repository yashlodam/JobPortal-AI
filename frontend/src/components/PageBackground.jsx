import React from "react";

/**
 * PageBackground — Shared decorative background layer
 *
 * Renders a dot-grid pattern and glow orbs that are used across
 * multiple pages (Home, FindJobs, FindTalent, About, JobDetail, NotFound).
 *
 * All decorative elements are aria-hidden to prevent screen reader clutter.
 *
 * @param {string} [className] - Extra classes on the wrapper
 * @param {boolean} [showDotGrid=true] - Whether to render the dot grid
 * @param {boolean} [showGlowOrbs=true] - Whether to render the glow orbs
 */
function PageBackground({ className = "", showDotGrid = true, showGlowOrbs = true }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {/* Mesh gradient base */}
      <div className="mesh-gradient absolute inset-0" />

      {/* Dot grid pattern */}
      {showDotGrid && (
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      )}

      {/* Glow orbs */}
      {showGlowOrbs && (
        <>
          <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/6 blur-[160px]" />
          <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[160px]" />
          <div className="absolute bottom-1/4 left-1/2 h-[600px] w-[600px] rounded-full bg-violet/4 blur-[160px]" />
        </>
      )}
    </div>
  );
}

export default PageBackground;
