/* ═══════════════════════════════════════════════════════════════
   XMRminer V2 — Design Tokens
   Indigofera-anchored dark palette · Level 3-5 typography
   Background: perceptible dark navy, NOT pitch black
═══════════════════════════════════════════════════════════════ */

export const T = {
  // Backgrounds — perceptible dark navy spectrum (NOT #010103)
  bg:   "#0E0F18",   // void — dark navy, visible contrast
  s1:   "#141520",   // surface 1 — card base
  s2:   "#1A1B28",   // surface 2 — elevated
  s3:   "#212232",   // surface 3 — borders, dividers
  s4:   "#2A2B3D",   // surface 4 — hover states
  s5:   "#343548",   // surface 5 — active states
  s6:   "#3E3F55",   // surface 6 — strong borders

  // Accent — XMR Orange (sacred, canonical)
  xmr:   "#FF6600",
  xmrl:  "#FF8840",
  xmrd:  "rgba(255,102,0,0.11)",
  xmrdd: "rgba(255,102,0,0.06)",

  // Semantic
  grn:   "#00D395",  grnd:  "rgba(0,211,149,0.10)",
  red:   "#FF4757",  redd:  "rgba(255,71,87,0.09)",
  gold:  "#FFD700",  goldd: "rgba(255,215,0,0.10)",
  blue:  "#4A9EFF",  blued: "rgba(74,158,255,0.10)",
  cyan:  "#00CED1",

  // Text — offset for perceptible background
  t1: "#F0F0F5",   // primary — bright, high contrast on #0E0F18
  t2: "#C8C8D8",   // secondary — muted but readable
  t3: "#9898AC",   // tertiary — labels, hints (bumped from #848494 for AA)
  t4: "#5E5E72",   // quaternary — disabled, decorative
  t5: "#3A3A4E",   // ghost — grid lines, deep borders

  // Glass
  glass:   "rgba(20,21,32,0.78)",
  glassB:  "rgba(255,255,255,0.05)",
  glassBH: "rgba(255,255,255,0.10)",

  // Typography — Level 3-5 complexity
  // Geologica: variable weight 100-900, display headers
  // Instrument Serif: italic editorial accents, hero numbers
  // DM Mono: data, labels, technical readouts
  // Sora: body text, UI labels
  mono:    "'DM Mono', monospace",
  sans:    "'Sora', system-ui, sans-serif",
  serif:   "'Instrument Serif', Georgia, serif",
  display: "'Geologica', 'Helvetica Neue', sans-serif",

  // Radii
  r: { sm: 6, md: 10, lg: 14, xl: 20, pill: 100 },

  // Motion durations
  motion: {
    fast: "0.15s",
    med:  "0.25s",
    slow: "0.5s",
    xslow:"1.2s",
  },

  // Refresh intervals (ms)
  refresh: {
    nanopool:  30000,   // 30s — pool data
    gecko:    120000,   // 2 min — price data (free tier safe)
    network:   60000,   // 60s — network stats
  },
};

// SVG icon paths (no emoji anywhere)
export const Icons = {
  bolt:     `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9h4l-1 6 6-8H8l1-6z" fill="currentColor"/></svg>`,
  coin:     `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 4v8M5.5 6.5h5M5.5 9.5h5" stroke="currentColor" stroke-width="1.2"/></svg>`,
  clock:    `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.5V8l2.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  trend:    `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 12l4-4 3 2 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 4h4v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  pick:     `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 13l4-4M7 9l5-7 1 1-5 7-2 1 1-2z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  globe:    `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/><ellipse cx="8" cy="8" rx="3" ry="6.5" stroke="currentColor" stroke-width="1"/><path d="M1.5 8h13M2.5 4.5h11M2.5 11.5h11" stroke="currentColor" stroke-width="0.8"/></svg>`,
  target:   `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1"/><circle cx="8" cy="8" r="1" fill="currentColor"/></svg>`,
  refresh:  `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2.5 8a5.5 5.5 0 019.5-3.5M13.5 8a5.5 5.5 0 01-9.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 1v3.5h-3.5M4 15v-3.5h3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  layers:   `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L1.5 5.5 8 9.5l6.5-4L8 1.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M1.5 8l6.5 4 6.5-4" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M1.5 10.5l6.5 4 6.5-4" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
  shield:   `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l5.5 2v4c0 3.5-2.5 5.5-5.5 7-3-1.5-5.5-3.5-5.5-7v-4L8 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
  server:   `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="4" rx="1.5" stroke="currentColor" stroke-width="1.2"/><rect x="2" y="10" width="12" height="4" rx="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="5" cy="4" r="0.8" fill="currentColor"/><circle cx="5" cy="12" r="0.8" fill="currentColor"/></svg>`,
  chevDown: `<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  star:     `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8L8 1z"/></svg>`,
  check:    `<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  alert:    `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L1 14h14L8 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 6v3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="12" r="0.8" fill="currentColor"/></svg>`,
  copy:     `<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" stroke-width="1.3"/></svg>`,
  ext:      `<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M5 1h6v6M11 1L5 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

// Icon component
export function Icon({ name, size=14, color="currentColor", style={} }) {
  const svg = Icons[name];
  if (!svg) return null;
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:size,height:size,color,...style}} dangerouslySetInnerHTML={{__html:svg.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`)}} />;
}

/* ── Formatters (unit-aware) ─────────────────────────── */
export const fmt = {
  hash(h, unit="auto") {
    if (!h || isNaN(h)) return "0 H/s";
    if (unit === "auto") {
      if (h >= 1e9) return (h/1e9).toFixed(2) + " GH/s";
      if (h >= 1e6) return (h/1e6).toFixed(2) + " MH/s";
      if (h >= 1e3) return (h/1e3).toFixed(2) + " KH/s";
      return Math.round(h) + " H/s";
    }
    const map = { h:[1,"H/s",0], kh:[1e3,"KH/s",2], mh:[1e6,"MH/s",4], gh:[1e9,"GH/s",2] };
    const [d,s,p] = map[unit] || map.h;
    return (h/d).toFixed(p) + " " + s;
  },
  xmr:  v => parseFloat(v||0).toFixed(8),
  usd:  (v,d=2) => "$" + (+v).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d+2}),
  pct:  v => (v>0?"+":"") + parseFloat(v).toFixed(2) + "%",
  k:    v => v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(1)+"K":String(v),
  time(ts) {
    const d = Math.floor(Date.now()/1000) - ts;
    if (d < 60)    return d + "s ago";
    if (d < 3600)  return Math.floor(d/60) + "m ago";
    if (d < 86400) return Math.floor(d/3600) + "h ago";
    return Math.floor(d/86400) + "d ago";
  },
  diff(d) {
    if (!d) return "\u2014";
    if (d >= 1e12) return (d/1e12).toFixed(2) + "T";
    if (d >= 1e9)  return (d/1e9).toFixed(2) + "B";
    if (d >= 1e6)  return (d/1e6).toFixed(2) + "M";
    return d.toLocaleString();
  },
};

/* ── CSS reset + global styles (injected once) ───────── */
export const GlobalCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: ${T.bg};
    color: ${T.t1};
    font-family: ${T.sans};
    font-size: 14px;
    line-height: 1.5;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  a { color: inherit; text-decoration: none; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: ${T.s1}; }
  ::-webkit-scrollbar-thumb { background: ${T.s4}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${T.s5}; }

  /* Motion: stagger reveal */
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes gradientDrift {
    0%   { transform: translate(0, 0) scale(1); }
    33%  { transform: translate(30px, -20px) scale(1.05); }
    66%  { transform: translate(-20px, 15px) scale(0.95); }
    100% { transform: translate(0, 0) scale(1); }
  }
  @keyframes countdownSpin {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: 75.4; }
  }
  @keyframes livePulse {
    0%, 100% { box-shadow: 0 0 0 3px rgba(0,211,149,0.15), 0 0 8px rgba(0,211,149,0.3); }
    50%      { box-shadow: 0 0 0 5px rgba(0,211,149,0.08), 0 0 14px rgba(0,211,149,0.2); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  .stagger-child {
    opacity: 0;
    animation: fadeSlideUp 0.5s ease forwards;
  }
  .shimmer-placeholder {
    background: linear-gradient(90deg, ${T.s2} 25%, ${T.s3} 50%, ${T.s2} 75%);
    background-size: 400px 100%;
    animation: shimmer 1.8s ease-in-out infinite;
    border-radius: ${T.r.md}px;
  }
`;
