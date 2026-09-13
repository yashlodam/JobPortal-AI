import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * HomeAnimatedBackground
 *
 * Senior 15+ Year UX/Graphics Interactive Background Engine.
 * Tailored exclusively for the Master Home / Landing Page.
 *
 * Capabilities:
 * 1. 60 FPS HTML5 Canvas Interactive Neural Constellation Mesh with dynamic mouse magnetic deflection
 * 2. Click-to-Ripple shockwave energy propagation across nearby particles
 * 3. Smooth Mouse-following Parallax Ambient Spotlight
 * 4. 5 Multi-Layered Floating Framer-Motion Asynchronous Glowing Nebula Orbs (Indigo, Violet, Cyan, Emerald, Rose)
 * 5. Futuristic Micro Cyber-Grid with soft radial vignette
 * 6. Full Dark & Light Mode harmonization with high-DPI (Retina) crispness & zero-latency UI interactions
 */
export default function HomeAnimatedBackground() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  // Mouse & Ripple state held in ref for 60fps canvas loop without react re-renders
  const interactionRef = useRef({
    mouse: { x: -1000, y: -1000, targetX: -1000, targetY: -1000, radius: 160 },
    ripples: [],
  });

  const handleMouseMove = useCallback((e) => {
    interactionRef.current.mouse.targetX = e.clientX;
    interactionRef.current.mouse.targetY = e.clientY;
    setMousePos({ x: e.clientX, y: e.clientY });
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    interactionRef.current.mouse.targetX = -1000;
    interactionRef.current.mouse.targetY = -1000;
    setMousePos({ x: -1000, y: -1000 });
    setIsHovering(false);
  }, []);

  const handleClick = useCallback((e) => {
    interactionRef.current.ripples.push({
      x: e.clientX,
      y: e.clientY,
      radius: 0,
      maxRadius: 180,
      alpha: 0.6,
      speed: 4.5,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let animationFrameId;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasDimensions = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setCanvasDimensions();

    const handleResize = () => {
      setCanvasDimensions();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });

    // ── Particle Pool Configuration ──
    const targetParticleCount = Math.min(Math.floor((width * height) / 14000), 75);
    const particles = [];

    // Color definitions based on active theme
    const colorPalettes = isLight
      ? [
          "rgba(99, 102, 241,",  // Indigo
          "rgba(139, 92, 246,",  // Violet
          "rgba(6, 182, 212,",   // Cyan
          "rgba(16, 185, 129,",  // Emerald
          "rgba(244, 63, 94,",   // Rose
        ]
      : [
          "rgba(129, 140, 248,", // Neon Indigo
          "rgba(192, 132, 252,", // Electric Violet
          "rgba(34, 211, 238,",  // Cyber Cyan
          "rgba(52, 211, 153,",  // Emerald Glow
          "rgba(251, 113, 133,", // Rose Aura
        ];

    for (let i = 0; i < targetParticleCount; i++) {
      const paletteIndex = i % colorPalettes.length;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1.2,
        colorPrefix: colorPalettes[paletteIndex],
        baseAlpha: Math.random() * 0.35 + (isLight ? 0.25 : 0.2),
        pulseSpeed: Math.random() * 0.025 + 0.012,
        pulseVal: Math.random() * Math.PI * 2,
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.005 + 0.002,
      });
    }

    // ── Main 60 FPS Render Loop ──
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const mouse = interactionRef.current.mouse;
      // Smooth mouse coordinate lerping
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      const ripples = interactionRef.current.ripples;

      // ── Process & Draw Shockwave Ripples ──
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += rip.speed;
        rip.alpha -= 0.015;

        if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
          ripples.splice(r, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isLight
          ? `rgba(99, 102, 241, ${rip.alpha * 0.4})`
          : `rgba(168, 85, 247, ${rip.alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ── Process & Draw Particles & Constellation Links ──
      const particleLen = particles.length;
      for (let i = 0; i < particleLen; i++) {
        const p = particles[i];

        // Organic harmonic drift
        p.driftAngle += p.driftSpeed;
        p.x += p.vx + Math.cos(p.driftAngle) * 0.15;
        p.y += p.vy + Math.sin(p.driftAngle) * 0.15;

        // Boundary wrapping
        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;

        // ── Interactive Mouse Magnetic Push/Pull ──
        if (mouse.x > -500 && mouse.y > -500) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 1.8;
            p.x -= (dx / dist) * force;
            p.y -= (dy / dist) * force;
          }
        }

        // ── Ripple impulse interaction ──
        for (let r = 0; r < ripples.length; r++) {
          const rip = ripples[r];
          const rdx = p.x - rip.x;
          const rdy = p.y - rip.y;
          const rdist = Math.hypot(rdx, rdy);
          if (Math.abs(rdist - rip.radius) < 30 && rdist > 0) {
            const push = (1 - Math.abs(rdist - rip.radius) / 30) * 1.2;
            p.x += (rdx / rdist) * push;
            p.y += (rdy / rdist) * push;
          }
        }

        // Pulse Alpha
        p.pulseVal += p.pulseSpeed;
        const alpha = p.baseAlpha + Math.sin(p.pulseVal) * 0.14;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix} ${Math.max(0.08, alpha)})`;
        ctx.shadowColor = `${p.colorPrefix} 0.45)`;
        ctx.shadowBlur = isLight ? 6 : 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connecting constellation lines
        for (let j = i + 1; j < particleLen; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          const maxLinkDist = isLight ? 120 : 135;

          if (dist2 < maxLinkDist) {
            const linkAlpha = (1 - dist2 / maxLinkDist) * (isLight ? 0.16 : 0.22);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${p.colorPrefix} ${linkAlpha})`;
            ctx.lineWidth = 0.85;
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
      window.removeEventListener("click", handleClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLight, handleMouseMove, handleMouseLeave, handleClick]);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* ── 1. Interactive Cursor Parallax Glowing Spotlight ── */}
      {isHovering && mousePos.x > 0 && (
        <div
          className="absolute h-[520px] w-[520px] rounded-full blur-[140px] pointer-events-none transition-transform duration-150 ease-out will-change-transform"
          style={{
            transform: `translate3d(${mousePos.x - 260}px, ${mousePos.y - 260}px, 0)`,
            background: isLight
              ? "radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(168, 85, 247, 0.09) 45%, rgba(6, 182, 212, 0.04) 70%, transparent 85%)"
              : "radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(168, 85, 247, 0.14) 45%, rgba(6, 182, 212, 0.08) 70%, transparent 85%)",
          }}
        />
      )}

      {/* ── 2. Floating Ambient Fluid Gradient Nebula Orbs ── */}
      {/* Orb 1: Top-Left Indigo Nebula */}
      <motion.div
        className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full blur-[160px] will-change-transform"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(129, 140, 248, 0.1) 50%, transparent 75%)"
            : "radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 75%)",
        }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, 50, -30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orb 2: Top-Right Cyan/Blue Aurora */}
      <motion.div
        className="absolute -top-20 -right-40 h-[650px] w-[650px] rounded-full blur-[170px] will-change-transform"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 75%)"
            : "radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, rgba(14, 165, 233, 0.1) 50%, transparent 75%)",
        }}
        animate={{
          x: [0, -90, 40, 0],
          y: [0, 70, -40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Orb 3: Mid-Page Purple/Fuchsia Glow */}
      <motion.div
        className="absolute top-1/3 -left-32 h-[550px] w-[550px] rounded-full blur-[150px] will-change-transform"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(168, 85, 247, 0.14) 0%, rgba(217, 70, 239, 0.06) 50%, transparent 75%)"
            : "radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, rgba(217, 70, 239, 0.1) 50%, transparent 75%)",
        }}
        animate={{
          x: [0, 60, -60, 0],
          y: [0, -60, 50, 0],
          scale: [0.95, 1.2, 0.95, 0.95],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Orb 4: Lower-Mid Emerald/Teal Horizon */}
      <motion.div
        className="absolute top-2/3 -right-28 h-[520px] w-[520px] rounded-full blur-[150px] will-change-transform"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(20, 184, 166, 0.05) 50%, transparent 75%)"
            : "radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(20, 184, 166, 0.08) 50%, transparent 75%)",
        }}
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 50, -40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Orb 5: Bottom Rose/Violet Foundation */}
      <motion.div
        className="absolute -bottom-32 left-1/3 h-[580px] w-[580px] rounded-full blur-[160px] will-change-transform"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(244, 63, 94, 0.1) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 75%)"
            : "radial-gradient(circle, rgba(244, 63, 94, 0.16) 0%, rgba(139, 92, 246, 0.12) 50%, transparent 75%)",
        }}
        animate={{
          x: [0, 70, -70, 0],
          y: [0, -40, 30, 0],
          scale: [0.95, 1.1, 1, 0.95],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      {/* ── 3. Perspective Cyber-Grid Matrix with Radial Mask ── */}
      <div
        className={`absolute inset-0 ${isLight ? "opacity-[0.04]" : "opacity-[0.055]"}`}
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at 50% 50%, black 50%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 50%, transparent 90%)",
        }}
      />

      {/* ── 4. Interactive HTML5 Canvas (Particles & Neural Links) ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
      />

      {/* ── 5. Ambient Top-to-Bottom Light Balancer Sheen ── */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? "bg-gradient-to-b from-indigo-50/20 via-transparent to-slate-100/30"
            : "bg-gradient-to-b from-indigo-950/15 via-transparent to-[#05070d]/40"
        }`}
      />
    </div>
  );
}
