import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   ParticleRain — High-density Monero orange particle rainfall
   Canvas-based for 60fps at 420+ particles
   Each particle: slow descent, gentle sine sway, opacity pulse
   Background layer behind all content
═══════════════════════════════════════════════════════════════ */

const COUNT = 420;

export default function ParticleRain() {
  const ref = useRef(null);
  const frame = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let W = window.innerWidth, H = window.innerHeight;
    c.width = W; c.height = H;

    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.12 + Math.random() * 0.28,
      swayOff: Math.random() * Math.PI * 2,
      swaySp: 0.002 + Math.random() * 0.005,
      pulseOff: Math.random() * Math.PI * 2,
      pulseSp: 0.006 + Math.random() * 0.008,
      baseA: 0.025 + Math.random() * 0.14,
    }));

    let t = 0;
    const draw = () => {
      frame.current = requestAnimationFrame(draw);
      t++;
      ctx.clearRect(0, 0, W, H);

      for (const p of pts) {
        p.y += p.vy;
        p.x += Math.sin(t * p.swaySp + p.swayOff) * 0.35;
        if (p.y > H + 5) { p.y = -5; p.x = Math.random() * W; }
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;

        const pulse = Math.sin(t * p.pulseSp + p.pulseOff);
        const a = p.baseA * (0.55 + pulse * 0.45);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(255,102,0,${a.toFixed(3)})`;
        ctx.fill();

        if (a > 0.08) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, 6.283);
          ctx.fillStyle = `rgba(255,102,0,${(a * 0.12).toFixed(3)})`;
          ctx.fill();
        }
      }
    };
    draw();

    const onResize = () => { W = window.innerWidth; H = window.innerHeight; c.width = W; c.height = H; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(frame.current); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}
