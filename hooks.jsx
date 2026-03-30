import { useState, useRef, useCallback } from "react";
import { T, Icon, fmt } from "./tokens.jsx";
import { useUnits, useReveal } from "./hooks.jsx";

/* ═══════════════════════════════════════════════════════════════
   XMRminer V2 — UI Components
   Glassmorphism · Perspective tilt · Stagger reveals
   Level 3-5 typography · Motion-first · Zero emoji
═══════════════════════════════════════════════════════════════ */

/* ── Glass Card (perspective tilt on hover) ──────────── */

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

  const enter = () => setSt(s => ({ ...s, hover: true }));
  const leave = () => setSt({ rx: 0, ry: 0, hover: false });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={onClick}
      className={className}
      style={{
        background: T.glass,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
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
        <div style={{ fontFamily: T.mono, fontSize: 8.5, letterSpacing: 2, color: T.t4, textTransform: "uppercase" }}>{label}</div>
        {icon && <Icon name={icon} size={13} color={T.t4} />}
      </div>
      <div style={{ fontFamily: T.display, fontSize: 21, fontWeight: 600, color, lineHeight: 1.1, letterSpacing: -0.4, marginBottom: 4 }}>{value}</div>
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
          <div style={{ fontFamily: T.serif, fontSize: 18, fontStyle: "italic", color: T.t2, letterSpacing: -0.3 }}>{label}</div>
        ) : (
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 3, color: T.t4, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
        )}
        {sub && <div style={{ fontFamily: T.sans, fontSize: 11.5, color: T.t3 }}>{sub}</div>}
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
      <span style={{ fontFamily: mono ? T.mono : T.sans, fontSize: 12, color: valueColor, textAlign: "right" }}>{value}</span>
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

export function StaggerGrid({ children, cols = 4, gap = 10, mobile, style = {} }) {
  const [ref, visible] = useReveal(0.05);
  const n = mobile ? Math.min(cols, 2) : cols;
  return (
    <div ref={ref} style={{
      display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap,
      opacity: visible ? 1 : 0, transition: "opacity 0.3s", ...style,
    }}>
      {Array.isArray(children)
        ? children.map((c, i) => c ? (
          <div key={i} className="stagger-child" style={{ animationDelay: `${i * 60}ms` }}>{c}</div>
        ) : null)
        : children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SVG CHART COMPONENTS
═══════════════════════════════════════════════════════ */

export function SparkLine({ pts = [], w = 400, h = 60, color = T.xmr, fill = true, opacity = 0.22 }) {
  if (pts.length < 2) return null;
  const mn = Math.min(...pts), mx = Math.max(...pts), rg = mx - mn || 1;
  const x = i => i * (w / (pts.length - 1));
  const y = v => h - 4 - ((v - mn) / rg) * (h - 12);
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${path} L${x(pts.length - 1).toFixed(1)},${h} L0,${h} Z`;
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
        <path d={area} fill={`url(#${gid})`} />
      </>}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function HashChart({ data = [], zoom = 12 }) {
  const { units } = useUnits();
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - zoom * 3600;
  const pts = data.filter(d => d.date >= cutoff);
  if (!pts.length) return (
    <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: T.t4, fontFamily: T.mono, fontSize: 11 }}>
      No data for this window
    </div>
  );

  const W = 900, H_AREA = 108, H_BAR = 44, GAP = 6, HT = H_AREA + GAP + H_BAR;
  const shares = pts.map(p => p.shares);
  const mx = Math.max(...shares, 1);
  const x = i => i * ((W - 1) / (pts.length - 1 || 1));
  const y = v => H_AREA - 4 - (v / mx) * (H_AREA - 16);
  const linePts = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.shares).toFixed(1)}`).join(" ");
  const areaPts = `0,${H_AREA} ${linePts} ${W},${H_AREA}`;
  const bw = Math.max(1.5, (W / pts.length) * 0.68);

  const WINDOW = Math.round((2 * 60) / 10);
  const sma = pts.map((_, i) => {
    const s = pts.slice(Math.max(0, i - WINDOW), i + 1).map(p => p.shares);
    return s.reduce((a, b) => a + b, 0) / s.length;
  });
  const smaPts = sma.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const step = Math.max(1, Math.floor(pts.length / 8));
  const labels = pts
    .filter((_, i) => i % step === 0 || i === pts.length - 1)
    .map(p => {
      const idx = pts.indexOf(p);
      return { x: x(idx), label: new Date(p.date * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) };
    });

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => ({ v: Math.round(mx * pct), y: y(mx * pct) }));

  return (
    <svg width="100%" viewBox={`0 0 ${W + 40} ${HT + 28}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="sharesGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.xmr} stopOpacity="0.28" />
          <stop offset="100%" stopColor={T.xmr} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => (
        <line key={i} x1={36} y1={t.y} x2={W + 36} y2={t.y} stroke={T.s3} strokeWidth="0.5" strokeDasharray="3 3" />
      ))}
      {yTicks.map((t, i) => (
        <text key={`l${i}`} x="32" y={t.y + 3} fill={T.t5} fontSize="8.5" fontFamily={T.mono} textAnchor="end">{t.v}</text>
      ))}
      <g transform="translate(36,0)">
        <polygon points={areaPts} fill="url(#sharesGrad)" />
        <polyline points={linePts} fill="none" stroke={T.xmr} strokeWidth="2" strokeLinejoin="round" />
        <polyline points={smaPts} fill="none" stroke={T.t3} strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 3" opacity="0.6" />
        {pts.map((p, i) => {
          const bh = Math.max(2, (p.shares / mx) * (H_BAR - 3));
          return <rect key={i} x={x(i) - bw / 2} y={H_AREA + GAP + H_BAR - bh} width={bw} height={bh} fill={T.s5} rx="1" />;
        })}
        {labels.map((l, i) => (
          <text key={i} x={l.x} y={HT + 18} fill={T.t5} fontSize="8.5" fontFamily={T.mono} textAnchor="middle">{l.label}</text>
        ))}
      </g>
    </svg>
  );
}

export function PriceChart({ history = [], days = 7 }) {
  if (!history.length) return null;
  const cutoff = Date.now() - days * 86400000;
  const pts = history.filter(p => p.ts >= cutoff).map(p => p.v);
  if (pts.length < 2) return null;
  const mn = Math.min(...pts), mx = Math.max(...pts), rg = mx - mn || 1;
  const W = 800, H = 90;
  const x = i => i * ((W - 1) / (pts.length - 1 || 1));
  const y = v => H - 4 - ((v - mn) / rg) * (H - 12);
  const linePts = pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const areaPts = `0,${H} ${linePts} ${W},${H}`;
  const trend = pts.length > 1 ? pts[pts.length - 1] - pts[0] : 0;
  const col = trend >= 0 ? T.grn : T.red;
  const gid = `priceGr_${Math.random().toString(36).slice(2, 6)}`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 4}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.2" />
          <stop offset="100%" stopColor={col} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${gid})`} />
      <polyline points={linePts} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Detail Panel (expandable dropdown/popup) ─────── */

export function DetailPanel({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(8,8,16,0.82)", backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      animation: "fadeIn 0.2s ease",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "92%", maxWidth: 720, maxHeight: "85vh", overflow: "auto",
        background: T.s1, border: `1px solid ${T.s4}`,
        borderRadius: T.r.xl, padding: "24px 28px",
        animation: "fadeSlideUp 0.3s ease",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: T.display, fontSize: 18, fontWeight: 600, color: T.t1 }}>{title}</div>
            {subtitle && <div style={{ fontFamily: T.mono, fontSize: 10, color: T.t3, marginTop: 4, letterSpacing: 0.5 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: T.r.sm, border: `1px solid ${T.s4}`,
            background: "transparent", color: T.t3, cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s", flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.red; e.currentTarget.style.color = T.red; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.s4; e.currentTarget.style.color = T.t3; }}
          >&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Expand Button ───────────────────────────────── */

export function ExpandButton({ onClick, label = "Details" }) {
  return (
    <button onClick={onClick} className="btn-sweep press-compress" style={{
      fontFamily: T.mono, fontSize: 9, padding: "4px 10px", borderRadius: T.r.sm,
      border: `1px solid ${T.s4}`, background: "transparent", color: T.t3,
      cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
      transition: "all 0.15s", marginTop: 6,
    }}>
      {label} <Icon name="chevDown" size={9} />
    </button>
  );
}
