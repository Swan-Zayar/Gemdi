import React, { useRef, useEffect } from 'react';

// ── Same aurora canvas used in Landing.tsx ────────────────────────────────────
const AuroraCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Gemdi palette: blue, cyan, indigo, sky, violet
    const PALETTE = [
      { r: 59,  g: 130, b: 246 }, // blue-500
      { r: 34,  g: 211, b: 238 }, // cyan-400
      { r: 99,  g: 102, b: 241 }, // indigo-500
      { r: 56,  g: 189, b: 248 }, // sky-400
      { r: 139, g: 92,  b: 246 }, // violet-500
    ];

    interface Orb {
      x: number; y: number; r: number;
      color: { r: number; g: number; b: number };
      vx: number; vy: number;
      phase: number; speed: number;
    }

    const orbs: Orb[] = Array.from({ length: 7 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 260 + Math.random() * 180,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      phase: Math.random() * Math.PI * 2,
      speed: 0.00025 + Math.random() * 0.00025,
    }));

    let time = 0;
    const isDark = () => document.documentElement.classList.contains('dark');

    const animate = () => {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alpha = isDark() ? 0.20 : 0.09;

      for (const orb of orbs) {
        orb.x += orb.vx + Math.sin(time * orb.speed + orb.phase) * 0.38;
        orb.y += orb.vy + Math.cos(time * orb.speed + orb.phase * 1.4) * 0.38;

        // Wrap seamlessly at edges
        if (orb.x < -orb.r) orb.x = canvas.width + orb.r;
        else if (orb.x > canvas.width + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = canvas.height + orb.r;
        else if (orb.y > canvas.height + orb.r) orb.y = -orb.r;

        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        g.addColorStop(0, `rgba(${orb.color.r},${orb.color.g},${orb.color.b},${alpha})`);
        g.addColorStop(1, `rgba(${orb.color.r},${orb.color.g},${orb.color.b},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', display: 'block' }}
    />
  );
};

// ── Matte glass overlay — light/dark aware ────────────────────────────────────
const GlassOverlay: React.FC = () => (
  <div
    aria-hidden="true"
    className="bg-slate-50/55 dark:bg-slate-900/55"
    style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      backdropFilter: 'blur(80px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(80px) saturate(1.5)',
    }}
  />
);

// ── Composed background ───────────────────────────────────────────────────────
const DashboardBackground: React.FC = () => (
  <>
    <AuroraCanvas />
    <GlassOverlay />
  </>
);

export default DashboardBackground;
