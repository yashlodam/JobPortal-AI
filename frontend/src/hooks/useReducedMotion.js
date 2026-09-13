import { useState, useEffect } from "react";

/**
 * useReducedMotion — Detects if the user has requested reduced motion
 * in their OS/browser settings.
 *
 * Returns `true` when `prefers-reduced-motion: reduce` is active.
 * All Framer Motion animations should check this and disable
 * animations when true.
 *
 * @returns {boolean}
 */
export default function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}
