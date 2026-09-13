/**
 * motionVariants.js — Centralized Framer Motion animation presets.
 *
 * Every component should import from here instead of defining
 * inline animation configs. This ensures:
 * - Consistent easing, duration, stagger across the entire app
 * - Consistent offset values (y: 28, scale: 0.97)
 * - All animations respect prefers-reduced-motion
 *
 * Usage:
 *   import { containerVariants, fadeInUp, cardHover } from "../utils/motionVariants";
 *   import useReducedMotion from "../hooks/useReducedMotion";
 *
 *   const prefersReducedMotion = useReducedMotion();
 *   const container = containerVariants(prefersReducedMotion);
 *   const item = fadeInUp(prefersReducedMotion);
 *   const hover = cardHover(prefersReducedMotion);
 */

/* ===========================
   Shared Constants
=========================== */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
export const EASE_SMOOTH = [0.4, 0, 0.2, 1];

const STAGGER_DEFAULT = 0.08;
const DURATION_DEFAULT = 0.5;
const OFFSET_Y = 28;

/* ===========================
   Empty / no-op variants
=========================== */

const NO_MOTION = {
  initial: undefined,
  animate: undefined,
  whileInView: undefined,
  exit: undefined,
  transition: { duration: 0 },
};

const NO_MOTION_VARIANTS = {
  hidden: {},
  visible: {},
};

const NO_HOVER = {};

/* ===========================
   Container (stagger children)
=========================== */

export function containerVariants(reduceMotion = false) {
  if (reduceMotion) return NO_MOTION_VARIANTS;

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: STAGGER_DEFAULT,
        delayChildren: 0.1,
      },
    },
  };
}

/* ===========================
   Fade-in-up (for children in a stagger container)
=========================== */

export function itemVariants(reduceMotion = false) {
  if (reduceMotion) return NO_MOTION_VARIANTS;

  return {
    hidden: { opacity: 0, y: OFFSET_Y, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: DURATION_DEFAULT,
        ease: EASE_OUT_EXPO,
      },
    },
  };
}

/* ===========================
   Fade-in-up (standalone, uses whileInView)
=========================== */

export function fadeInUp(reduceMotion = false, { delay = 0, duration = DURATION_DEFAULT } = {}) {
  if (reduceMotion) {
    return {
      initial: { opacity: 1, y: 0 },
      whileInView: undefined,
      viewport: undefined,
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: OFFSET_Y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration, delay, ease: EASE_OUT_EXPO },
  };
}

/* ===========================
   Card hover
=========================== */

export function cardHover(reduceMotion = false) {
  if (reduceMotion) return NO_HOVER;

  return {
    whileHover: { y: -5, scale: 1.01 },
    transition: { type: "spring", stiffness: 300, damping: 24 },
  };
}

/* ===========================
   Spring transition preset
=========================== */

export function springTransition(reduceMotion = false) {
  if (reduceMotion) return { duration: 0 };

  return {
    type: "spring",
    stiffness: 300,
    damping: 24,
  };
}
