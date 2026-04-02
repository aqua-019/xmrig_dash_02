import { useState, useRef, useCallback, useEffect } from "react";
import { T, Icon, fmt } from "./tokens.jsx";
import { useUnits, useReveal, useMobile } from "./hooks.jsx";

/* ═══════════════════════════════════════════════════════════════
   XMRminer V3 — UI Components
   Glassmorphism · Perspective tilt (mouse + touch) · Stagger reveals
   Level 3-5 typography · Motion-first · Zero emoji
   V3: Touch tilt, spline charts, tooltips, HashrateSparkStrip
═══════════════════════════════════════════════════════════════ */

/* ── Glass Card (perspective tilt on hover + touch) ──── */

// Detect touch device once at module level (no per-component hooks)
const IS_TOUCH = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
const IS_NARROW = typeof window !== "undefined" && window.innerWidth < 480;

export function Card({ children, glow = T.xmr, pad = "16px 18px", style = {}, onClick, tilt = true, className = "" }) {
  const ref = useRef(null);
  const [st, setSt] = useState({ rx: 0, ry: 0, hover: false });

  const onMove = useCallback((e) => {
    if (!tilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setSt(s => ({ ...s, rx: y * -6, ry: x * 6 }));
  }, [tilt]);

  const onTouchMove = useCallback((e) => {
    if (!tilt || !ref.current) return;
    const touch = e.touches[0];
    const r = ref.current.getBoundingClientRect();
    const x = (touch.clientX - r.left) / r.width - 0.5;
    const y = (touch.clientY - r.top) / r.height - 0.5;
    setSt(s => ({ ...s, rx: y * -4, ry: x * 4 }));
  }, [tilt]);

  const enter = () => setSt(s => ({ ...s, hover: true }));
  const leave = () => setSt({ rx: 0, ry: 0, hover: false });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onTouchMove={onTouchMove}
      onTouchEnd={leave}
      onClick={onClick}
      className={className}
      style={{
        background: IS_NARROW ? T.s1 : T.glass,
        backdropFilter: IS_NARROW ? "none" : "blur(16px)",
        WebkitBackdropFilter: IS_NARROW ? "none" : "blur(16px)",
        border: `1px solid ${st.hover ? glow + "33" : T.glassB}`,
        borderRadius: T.r.lg,
        padding: pad,
        position: "relative",
        overflow: "hidden",
        transform: tilt
          ? `perspective(800px) rotateX(${st.rx}deg) rotateY(${st.ry}deg) ${st.hover ? "translateY(-2px)" : ""}`
          : st.hover ? "translateY(-2px)" : "none",
        transition: "border-color 0.2s, transform 0.25s ease-out, box-shadow 0.25s",
        boxShadow: st.hover ? `0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px ${glow}11` : "none",
        cursor: onClick ? "pointer" : "default",
        willChange: "transform",
        ...style,
      }}
    >
      {/* Ambient glow gradient */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: T.r.lg,
        background: `radial-gradient(ellipse at ${50 + st.ry * 8}% ${50 + st.rx * 8}%, ${glow}08, transparent 65%)`,
        pointerEvents: "none", transition: "background 0.3s",
      }} />
      {children}
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────── */

export function StatCard({ label, value, sub, sub2, color = T.t1, glow = T.xmr, icon, badge, trend, delay = 0 }) {
  return (
    <Card glow={glow} className="stagger-child" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2.5, color: T.t3, textTransform: "uppercase" }}>{label}</div>
        {icon && <Icon name={icon} size={13} color={T.t4} />}
      </div>
      <div style={{ fontFamily: T.display, fontSize: 24, fontWeight: 700, color, lineHeight: 1.1, letterSpacing: -0.4, marginBottom: 4 }}>{value}</div>
      {badge && (
        <div style={{
          display: "inline-block", padding: "1px 8px", borderRadius: 4, fontSize: 9,
          background: `${badge.color}22`, color: badge.color, fontFamily: T.mono, marginBottom: 4,
          letterSpacing: 1.5, fontWeight: 500,
        }}>{badge.text}</div>
      )}
      {sub && <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.t3, marginTop: 2 }}>{sub}</div>}
      {sub2 && <div style={{ fontFamily: T.mono, fontSize: 10, color: T.t4, marginTop: 2 }}>{sub2}</div>}
      {trend !== undefined && (
        <div style={{ marginTop: 8 }}>
          <MiniBar value={Math.abs(trend)} max={10} color={trend >= 0 ? T.grn : T.red} h={3} />
        </div>
      )}
    </Card>
  );
}

/* ── Section Header (Level 4 editorial typography) ──── */

export function SectionHead({ label, sub, right, serif = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
      <div>
        {serif ? (
          <div style={{ fontFamily: T.serif, fontSize: 20, fontStyle: "italic", color: T.t2, letterSpacing: -0.3 }}>{label}</div>
        ) : (
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 3, color: T.t3, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
        )}
        {sub && <div style={{ fontFamily: T.sans, fontSize: 11.5, color: T.t3, fontWeight: 500 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ── Mini Progress Bar ───────────────────────────────── */

export function MiniBar({ value = 0, max = 100, color = T.xmr, h = 5 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ height: h, borderRadius: h / 2, background: T.s3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: h / 2, transition: "width 0.7s ease" }} />
    </div>
  );
}

/* ── Zoom Pills ──────────────────────────────────────── */

export function ZoomPills({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", gap: 2, borderRadius: T.r.sm, overflow: "hidden", border: `1px solid ${T.s3}` }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          fontFamily: T.mono, fontSize: 10, padding: "3px 10px", cursor: "pointer",
          border: "none", background: value === o ? T.xmrd : "transparent",
          color: value === o ? T.xmr : T.t4, transition: "all 0.15s",
        }}>{o}h</button>
      ))}
    </div>
  );
}

/* ── Unit Toggle ─────────────────────────────────────── */

export function UnitToggle({ type = "hashrate", options, style = {} }) {
  const { units, setUnit } = useUnits();
  const opts = options || (type === "hashrate" ? ["auto", "h", "kh", "mh"] : ["usd", "xmr", "btc"]);
  const labels = { auto: "Auto", h: "H/s", kh: "KH/s", mh: "MH/s", gh: "GH/s", usd: "USD", xmr: "XMR", btc: "BTC" };
  return (
    <div style={{ display: "inline-flex", borderRadius: T.r.sm, overflow: "hidden", border: `1px solid ${T.s3}`, ...style }}>
      {opts.map(o => (
        <button key={o} onClick={() => setUnit(type, o)} style={{
          fontFamily: T.mono, fontSize: 9, padding: "3px 9px", cursor: "pointer",
          border: "none", background: units[type] === o ? T.xmrd : "transparent",
          color: units[type] === o ? T.xmr : T.t4, transition: "all 0.15s",
        }}>{labels[o] || o}</button>
      ))}
    </div>
  );
}

/* ── Live Dot ────────────────────────────────────────── */

export function LiveDot({ on = true, size = 7 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      background: on ? T.grn : T.red, marginRight: 5, flexShrink: 0,
      animation: on ? "livePulse 2s ease-in-out infinite" : "none",
      transition: "background 0.3s",
    }} />
  );
}

/* ── Data Row ────────────────────────────────────────── */

export function DataRow({ label, value, valueColor = T.t2, mono = true }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "7px 0", borderBottom: `1px solid ${T.s3}`, gap: 12,
    }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.t4, letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontFamily: mono ? T.mono : T.sans, fontSize: 12, fontWeight: 500, color: valueColor, textAlign: "right" }}>{value}</span>
    </div>
  );
}

/* ── Copy Button ─────────────────────────────────────── */

export function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  const go = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setDone(true); setTimeout(() => setDone(false), 1500);
  };
  return (
    <button onClick={go} style={{
      fontFamily: T.mono, fontSize: 9, padding: "4px 12px", borderRadius: T.r.sm, cursor: "pointer",
      border: `1px solid ${done ? T.grn : T.s5}`, background: "transparent",
      color: done ? T.grn : T.t4, transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      <Icon name={done ? "check" : "copy"} size={10} />
      {done ? "Copied" : "Copy"}
    </button>
  );
}

/* ── Divider ─────────────────────────────────────────── */

export function Divider() {
  return <div style={{ height: 1, background: T.s3, margin: "22px 0" }} />;
}

/* ── Data Pending Placeholder ────────────────────────── */

export function DataPending({ label = "Data en route", h = 60 }) {
  return (
    <div style={{
      height: h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      borderRadius: T.r.md, border: `1px dashed ${T.s4}`, background: T.s1, gap: 6,
    }}>
      <div className="shimmer-placeholder" style={{ width: "60%", height: 8 }} />
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.t4, letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

/* ── Refresh Ring ────────────────────────────────────── */

export function RefreshRing({ intervalMs = 30000 }) {
  return (
    <div style={{
      width: 26, height: 26, borderRadius: "50%", position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} title={`Auto-refresh ${intervalMs / 1000}s`}>
      <svg width="26" height="26" viewBox="0 0 26 26">
        <circle cx="13" cy="13" r="12" fill="none" stroke={T.s3} strokeWidth="1.5" />
        <circle
          cx="13" cy="13" r="12" fill="none" stroke={T.xmr} strokeWidth="1.5"
          strokeDasharray="75.4" strokeLinecap="round"
          transform="rotate(-90 13 13)"
          style={{ animation: `countdownSpin ${intervalMs / 1000}s linear infinite` }}
        />
      </svg>
      <span style={{ position: "absolute", fontFamily: T.mono, fontSize: 7.5, color: T.t4 }}>
        {Math.round(intervalMs / 1000)}s
      </span>
    </div>
  );
}

/* ── Stagger Wrapper ─────────────────────────────────── */

export function StaggerGrid({ children, cols = 4, gap = 10, mobile, heroCards = false, style = {} }) {
  const [ref, visible] = useReveal(0.05);
  const n = mobile ? Math.min(cols, 2) : cols;
  return (
    <div ref={ref} style={{
      display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap,
      opacity: visible ? 1 : 0, transition: "opacity 0.3s", ...style,
    }}>
      {Array.isArray(children)
        ? children.map((c, i) => c ? (
          <div key={i} className="stagger-child" style={{
            animationDelay: `${i * 40}ms`,
            ...(heroCards ? { minHeight: 160, display: "flex", flexDirection: "column" } : {}),
          }}>{c}</div>
        ) : null)
        : children}
    </div>
  );
}

/* ── Detail Panel (overlay) ──────────────────────────── */

export function DetailPanel({ title, children, onClose }) {
  const mobile = useMobile(768);
  const [touchStartY, setTouchStartY] = useState(null);

  const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY);
  const handleTouchEnd = (e) => {
    if (touchStartY != null && mobile) {
      const delta = e.changedTouches[0].clientY - touchStartY;
      if (delta > 80) onClose();
    }
    setTouchStartY(null);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: mobile ? "flex-end" : "center", justifyContent: "center",
      animation: "fadeIn 0.2s ease",
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          background: T.s1, border: `1px solid ${T.s3}`,
          borderRadius: mobile ? "16px 16px 0 0" : T.r.xl,
          padding: "20px 22px",
          width: mobile ? "100%" : "min(580px, 90vw)",
          maxHeight: mobile ? "92vh" : "80vh",
          overflow: "auto",
          animation: mobile ? "slideUp 0.3s ease" : "fadeSlideUp 0.3s ease",
          position: "relative",
        }}>
        {/* Swipe indicator on mobile */}
        {mobile && (
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.s4, margin: "0 auto 12px" }} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: T.display, fontSize: 16, fontWeight: 700, color: T.t1 }}>{title}</div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: "50%", border: `1px solid ${T.s4}`,
            background: "transparent", color: T.t4, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── HashrateSparkStrip ──────────────────────────────── */

export function HashrateSparkStrip({ hashrates = [], height = 32 }) {
  if (!hashrates.length) return null;
  const max = Math.max(...hashrates, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height }}>
      {hashrates.map((hr, i) => {
        const h = Math.max(2, (hr / max) * (height - 4));
        const pct = hr / max;
        return (
          <div key={i} style={{
            flex: 1, height: h, borderRadius: "1px 1px 0 0", minWidth: 2,
            background: `linear-gradient(to top, ${T.t5}, ${pct > 0.5 ? T.xmr : T.t4})`,
            opacity: 0.8, transition: "height 0.3s ease",
          }} />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SVG CHART COMPONENTS — V3: Catmull-Rom splines, tooltips
═══════════════════════════════════════════════════════ */

/* ── Catmull-Rom spline utility ─────────────────────── */

function catmullRomToPath(points, tension = 0.5) {
  if (points.length < 2) return "";
  if (points.length === 2) return `M${points[0][0]},${points[0][1]}L${points[1][0]},${points[1][1]}`;
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / (6 * tension);
    const cp1y = p1[1] + (p2[1] - p0[1]) / (6 * tension);
    const cp2x = p2[0] - (p3[0] - p1[0]) / (6 * tension);
    const cp2y = p2[1] - (p3[1] - p1[1]) / (6 * tension);
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export function SparkLine({ pts = [], w = 400, h = 60, color = T.xmr, fill = true, opacity = 0.22 }) {
  if (pts.length < 2) return null;
  const mn = Math.min(...pts), mx = Math.max(...pts), rg = mx - mn || 1;
  const xp = i => i * (w / (pts.length - 1));
  const yp = v => h - 4 - ((v - mn) / rg) * (h - 12);
  const points = pts.map((v, i) => [xp(i), yp(v)]);
  const path = catmullRomToPath(points);
  const areaPath = `${path} L${xp(pts.length - 1).toFixed(1)},${h} L0,${h} Z`;
  const gid = `gl_${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      {fill && <>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <stop offset="85%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gid})`} />
      </>}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function HashChart({ data = [], zoom = 12 }) {
  const { units } = useUnits();
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - zoom * 3600;
  const pts = data.filter(d => d.date >= cutoff);
  if (!pts.length) return (
    <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: T.t4, fontFamily: T.mono, fontSize: 11 }}>
      No data for this window
    </div>
  );

  const W = 900, H_AREA = 108;
  const shares = pts.map(p => p.shares);
  const mx = Math.max(...shares, 1);
  const x = i => i * ((W - 1) / (pts.length - 1 || 1));
  const y = v => H_AREA - 4 - (v / mx) * (H_AREA - 16);

  // Catmull-Rom spline for main line
  const linePoints = pts.map((p, i) => [x(i), y(p.shares)]);
  const linePath = catmullRomToPath(linePoints);
  const areaPath = `${linePath} L${x(pts.length - 1).toFixed(1)},${H_AREA} L0,${H_AREA} Z`;

  // SMA
  const WINDOW = Math.round((2 * 60) / 10);
  const sma = pts.map((_, i) => {
    const s = pts.slice(Math.max(0, i - WINDOW), i + 1).map(p => p.shares);
    return s.reduce((a, b) => a + b, 0) / s.length;
  });
  const smaPoints = sma.map((v, i) => [x(i), y(v)]);
  const smaPath = catmullRomToPath(smaPoints);

  const step = Math.max(1, Math.floor(pts.length / 6));
  const labels = pts
    .filter((_, i) => i % step === 0 || i === pts.length - 1)
    .map(p => {
      const idx = pts.indexOf(p);
      return { x: x(idx), label: new Date(p.date * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) };
    });

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => ({ v: Math.round(mx * pct), y: y(mx * pct) }));

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx2 = e.clientX - rect.left;
    const ratio = mx2 / rect.width;
    const idx = Math.round(ratio * (pts.length - 1));
    if (idx >= 0 && idx < pts.length) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 50,
        shares: pts[idx].shares,
        time: new Date(pts[idx].date * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      });
    }
  };

  return (
    <div style={{ position: "relative" }} onMouseLeave={() => setTooltip(null)}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W + 40} ${H_AREA + 28}`} style={{ display: "block", overflow: "visible" }}
        onMouseMove={handleMouseMove}>
        <defs>
          <linearGradient id="sharesGrad3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.xmr} stopOpacity="0.22" />
            <stop offset="100%" stopColor={T.xmr} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <line key={i} x1={36} y1={t.y} x2={W + 36} y2={t.y} stroke={T.s3} strokeWidth="0.5" strokeDasharray="3 3" />
        ))}
        {yTicks.map((t, i) => (
          <text key={`l${i}`} x="32" y={t.y + 3} fill={T.t4} fontSize="8" fontFamily="'DM Mono', monospace" textAnchor="end">{t.v}</text>
        ))}
        <g transform="translate(36,0)">
          <path d={areaPath} fill="url(#sharesGrad3)" />
          <path d={linePath} fill="none" stroke={T.xmr} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d={smaPath} fill="none" stroke={T.t3} strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
          {/* Hover dots — subtle at each point */}
          {pts.map((p, i) => (
            <circle key={i} cx={x(i)} cy={y(p.shares)} r="2" fill={T.t5} opacity={tooltip && Math.abs(tooltip.x / (W + 40) * (pts.length - 1) - i) < 1 ? 1 : 0} />
          ))}
          {labels.map((l, i) => (
            <text key={i} x={l.x} y={H_AREA + 18} fill={T.t4} fontSize="8" fontFamily="'DM Mono', monospace" textAnchor="middle">{l.label}</text>
          ))}
        </g>
      </svg>
      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute", left: tooltip.x, top: tooltip.y,
          transform: "translateX(-50%)", pointerEvents: "none",
          background: "rgba(20,21,32,0.88)", backdropFilter: "blur(12px)",
          border: `1px solid ${T.s4}`, borderRadius: T.r.sm,
          padding: "6px 10px", fontFamily: T.mono, fontSize: 10,
          whiteSpace: "nowrap", zIndex: 10,
        }}>
          <div style={{ color: T.xmr, fontWeight: 500 }}>{tooltip.shares} shares</div>
          <div style={{ color: T.t4, fontSize: 9 }}>{tooltip.time}</div>
        </div>
      )}
    </div>
  );
}

export function PriceChart({ history = [], days = 7 }) {
  if (!history.length) return null;
  const cutoff = Date.now() - days * 86400000;
  const pts = history.filter(p => p.ts >= cutoff).map(p => p.v);
  if (pts.length < 2) return null;
  const mn = Math.min(...pts), mx = Math.max(...pts), rg = mx - mn || 1;
  const W = 800, H = 90;
  const xp = i => i * ((W - 1) / (pts.length - 1 || 1));
  const yp = v => H - 4 - ((v - mn) / rg) * (H - 12);
  const points = pts.map((v, i) => [xp(i), yp(v)]);
  const linePath = catmullRomToPath(points);
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;
  const trend = pts[pts.length - 1] - pts[0];
  const col = trend >= 0 ? T.grn : T.red;
  const gid = `priceGr_${Math.random().toString(36).slice(2, 6)}`;
  const lastX = xp(pts.length - 1);
  const lastY = yp(pts[pts.length - 1]);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.2" />
          <stop offset="100%" stopColor={col} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Min/max reference lines */}
      <line x1="0" y1={yp(mn)} x2={W} y2={yp(mn)} stroke={T.t5} strokeWidth="0.5" strokeDasharray="4 4" />
      <line x1="0" y1={yp(mx)} x2={W} y2={yp(mx)} stroke={T.t5} strokeWidth="0.5" strokeDasharray="4 4" />
      <text x={W - 4} y={yp(mn) - 3} fill={T.t4} fontSize="8" fontFamily="'DM Mono', monospace" textAnchor="end">${mn.toFixed(0)}</text>
      <text x={W - 4} y={yp(mx) + 10} fill={T.t4} fontSize="8" fontFamily="'DM Mono', monospace" textAnchor="end">${mx.toFixed(0)}</text>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Current price pulsing dot */}
      <circle cx={lastX} cy={lastY} r="4" fill={col} opacity="0.4">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={lastX} cy={lastY} r="2.5" fill={col} />
      <text x={lastX - 6} y={lastY - 8} fill={col} fontSize="8" fontFamily="'DM Mono', monospace" textAnchor="end">${pts[pts.length - 1].toFixed(0)}</text>
    </svg>
  );
}
