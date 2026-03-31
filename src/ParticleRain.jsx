import { useEffect, useRef } from "react";
import { T } from "./tokens.jsx";

/* ═══════════════════════════════════════════════════════════════
   ParticleRain — Canvas-based ambient particle animation
   Performance-guarded: reduced count on mobile devices
═══════════════════════════════════════════════════════════════ */

export default function ParticleRain({ height = 320, opacity = 0.6 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const isMobile = navigator.maxTouchPoints > 0;
    const COUNT = isMobile ? 150 : 420;

    let w = canvas.parentElement?.clientWidth || window.innerWidth;
    let h = height;
    canvas.width = w;
    canvas.height = h;

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vy: 0.15 + Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.15,
      r: 0.5 + Math.random() * 1.2,
      a: 0.1 + Math.random() * 0.35,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y > h) { p.y = -2; p.x = Math.random() * w; }
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,102,0,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      w = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [height]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
        zIndex: 0,
      }}
    />
  );
}
