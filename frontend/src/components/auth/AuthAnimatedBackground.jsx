import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * AuthAnimatedBackground
 *
 * High-performance, GPU-accelerated interactive background for JobPortal AI Authentication.
 * Features:
 * - Interactive HTML5 Canvas Neural Particle Constellation with connecting lines
 * - Mouse cursor attraction & interactive parallax spotlight
 * - Asynchronous Framer Motion floating ambient gradient orbs (Indigo, Purple, Fuchsia, Cyan)
 * - Subtle Cyber Perspective Grid with radial vignette
 * - Fully responsive, theme-aware (Light / Dark mode), 60 FPS requestAnimationFrame
 */
export default function AuthAnimatedBackground() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const isDark = theme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle pool definition
    const particleCount = Math.min(Math.floor((width * height) / 18000), 55);
    const particles = [];

    const primaryColor = isDark ? "rgba(99, 102, 241," : "rgba(79, 70, 229,";
    const accentColor = isDark ? "rgba(168, 85, 247," : "rgba(147, 51, 234,";
    const cyanColor = isDark ? "rgba(6, 182, 212," : "rgba(14, 165, 233,";

    for (let i = 0; i < particleCount; i++) {
      const type = i % 3;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1.2,
        colorPrefix: type === 0 ? primaryColor : type === 1 ? accentColor : cyanColor,
        baseAlpha: Math.random() * 0.35 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseVal: Math.random() * Math.PI * 2,
      });
    }

    let mouse = { x: -1000, y: -1000, radius: 140 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      setMousePos({ x: -1000, y: -1000 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse interaction (soft attraction / gentle wave)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 0.4;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }

        // Pulse alpha
        p.pulseVal += p.pulseSpeed;
        const currentAlpha = p.baseAlpha + Math.sin(p.pulseVal) * 0.12;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix} ${Math.max(0.05, currentAlpha)})`;
        ctx.shadowColor = `${p.colorPrefix} 0.5)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connecting constellation lines to neighbors
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          const maxDist = 120;

          if (dist2 < maxDist) {
            const lineAlpha = (1 - dist2 / maxDist) * (isDark ? 0.18 : 0.12);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${p.colorPrefix} ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none" aria-hidden="true">
      {/* ── Dynamic Mouse Parallax Spotlight Glow ── */}
      {mousePos.x > 0 && (
        <div
          className="absolute h-[500px] w-[500px] rounded-full blur-[140px] transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `translate3d(${mousePos.x - 250}px, ${mousePos.y - 250}px, 0)`,
            background: isDark
              ? "radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 80%)"
              : "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 80%)",
          }}
        />
      )}

      {/* ── 1. Floating Asynchronous Glowing Mesh Orbs ── */}
      {/* Orb 1: Top-Left Indigo Glow */}
      <motion.div
        className="absolute -top-32 -left-32 h-[550px] w-[550px] rounded-full blur-[140px]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(79, 70, 229, 0.35) 0%, rgba(99, 102, 241, 0.15) 60%, transparent 80%)"
            : "radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(129, 140, 248, 0.1) 60%, transparent 80%)",
        }}
        animate={{
          x: [0, 60, -40, 0],
          y: [0, 40, -30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orb 2: Top-Right Purple/Fuchsia Glow */}
      <motion.div
        className="absolute top-10 -right-40 h-[600px] w-[600px] rounded-full blur-[150px]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(168, 85, 247, 0.28) 0%, rgba(217, 70, 239, 0.12) 60%, transparent 80%)"
            : "radial-gradient(circle, rgba(192, 132, 252, 0.18) 0%, rgba(232, 121, 249, 0.08) 60%, transparent 80%)",
        }}
        animate={{
          x: [0, -70, 30, 0],
          y: [0, 60, -40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Orb 3: Bottom-Left Cyan/Emerald Glow */}
      <motion.div
        className="absolute -bottom-40 left-10 h-[500px] w-[500px] rounded-full blur-[140px]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, rgba(16, 185, 129, 0.1) 60%, transparent 80%)"
            : "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(52, 211, 153, 0.07) 60%, transparent 80%)",
        }}
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.2, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Orb 4: Center-Right Rose Aura */}
      <motion.div
        className="absolute top-1/2 right-1/4 h-[420px] w-[420px] rounded-full blur-[130px]"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, rgba(236, 72, 153, 0.06) 60%, transparent 80%)"
            : "radial-gradient(circle, rgba(251, 113, 133, 0.12) 0%, rgba(244, 114, 182, 0.05) 60%, transparent 80%)",
        }}
        animate={{
          x: [0, -40, 50, 0],
          y: [0, 40, -30, 0],
          scale: [0.95, 1.1, 1, 0.95],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* ── 2. Subtle Cyber Perspective Grid Overlay with Vignette ── */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 50%, black 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 40%, transparent 85%)",
        }}
      />

      {/* ── 3. High-Performance Interactive Canvas (Particles & Neural Links) ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
      />

      {/* ── 4. Ambient Radial Lighting Sheen ── */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-background/40 to-background pointer-events-none" />
    </div>
  );
}
