import { useState, useEffect, useRef } from "react";
import { T, Icon, fmt, GlobalCSS } from "./tokens.jsx";
import {
  useNanopool, usePrices, useNetwork, usePoolStats, usePrivacyGatewayStats, useMoneroRPC,
  useUnits, UnitProvider, useMobile,
  POOL_ADAPTERS, ADDR,
} from "./hooks.jsx";
import {
  Card, UnitToggle, LiveDot, RefreshRing,
} from "./components.jsx";

/* Tab imports */
import TabOverview from "./tabs/Overview.jsx";
import TabPools from "./tabs/Pools.jsx";
import TabEarnings from "./tabs/Earnings.jsx";
import TabWorkers from "./tabs/Workers.jsx";
import TabNetwork from "./tabs/Network.jsx";

/* ═══════════════════════════════════════════════════════════════
   XMRminer V3 — Main Application
   Multi-pool command center · LIVE Nanopool + PrivacyGateway data
   Level 3-5 typography · Motion-first · Zero emoji
   Vercel-ready SPA
═══════════════════════════════════════════════════════════════ */

const TABS = [
  { id: "overview", label: "Overview",  icon: "bolt" },
  { id: "pools",    label: "Pools",     icon: "layers" },
  { id: "earnings", label: "Earnings",  icon: "coin" },
  { id: "workers",  label: "Workers",   icon: "server" },
  { id: "network",  label: "Network",   icon: "globe" },
];

/* ══════════════ LOADING STATE ════════════════════════ */

function LoadingState() {
  return (
    <div style={{
      padding: "80px 0", textAlign: "center", color: T.t4, fontFamily: T.mono, fontSize: 12,
    }}>
      <div style={{ marginBottom: 16 }}>
        <Icon name="pick" size={36} color={T.t5} />
      </div>
      <div className="shimmer-placeholder" style={{ width: 200, height: 12, margin: "0 auto 8px" }} />
      <div style={{ letterSpacing: 2 }}>Connecting to pool...</div>
    </div>
  );
}

/* ══════════════ MOUSE-FOLLOW GLOW ═══════════════════ */

function MouseGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current) {
        ref.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(255,102,0,0.03), transparent 60%)`;
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div ref={ref} style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
      transition: "background 0.3s ease",
    }} />
  );
}

/* ══════════════ ROOT APP ═════════════════════════════ */

function AppShell() {
  const np = useNanopool();
  const prices = usePrices();
  const net = useNetwork();
  const poolStats = usePoolStats();
  const pgStats = usePrivacyGatewayStats();
  const rpcData = useMoneroRPC();
  const { units } = useUnits();
  const [tab, setTab] = useState("overview");
  const mobile = useMobile();

  const hrNow = np.data?.hashrate || 0;
  const PAD = mobile ? 14 : 28;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.t1, fontFamily: T.sans, fontSize: 14, fontWeight: 500 }}>
      <style>{GlobalCSS}</style>

      {/* Ambient glow blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-20%", left: "-10%", width: "50vw", height: "50vw",
          borderRadius: "50%", background: T.xmr, opacity: 0.025, filter: "blur(100px)",
          animation: "gradientDrift 20s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "-5%", width: "35vw", height: "35vw",
          borderRadius: "50%", background: T.blue, opacity: 0.018, filter: "blur(80px)",
          animation: "gradientDrift 25s ease-in-out infinite reverse",
        }} />
      </div>

      <MouseGlow />

      {/* Navigation */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(14,15,24,0.92)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${T.s3}`,
      }}>
        {/* Top strip */}
        <div style={{ padding: `10px ${PAD}px`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: T.xmr,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 14px ${T.xmr}44`,
              animation: "shadowPulse 4s ease-in-out infinite",
            }}>
              <Icon name="pick" size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: T.serif, fontSize: 17, letterSpacing: -0.4, fontStyle: "italic" }}>
                <span style={{ color: T.xmr, fontStyle: "normal", fontFamily: T.display, fontWeight: 700 }}>xmr</span>
                <span style={{ color: T.t2 }}>miner</span>
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 7.5, color: T.t4, letterSpacing: 2.5 }}>V3 COMMAND CENTER</div>
            </div>
          </div>

          {/* Live hashrate pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7, padding: "5px 14px",
            borderRadius: T.r.pill, border: `1px solid ${hrNow > 0 ? T.grn + "33" : T.red + "33"}`,
            background: hrNow > 0 ? T.grnd : T.redd, flexShrink: 0,
          }}>
            <LiveDot on={hrNow > 0} />
            <span style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, color: hrNow > 0 ? T.grn : T.red }}>
              {np.loading ? "..." : hrNow > 0 ? fmt.hash(hrNow, units.hashrate) : "offline"}
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 7, color: T.t4, letterSpacing: 2 }}>LIVE</span>
          </div>

          <UnitToggle type="hashrate" />

          {/* Price ticker */}
          {prices && !mobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 11, color: T.t3 }}>
              <span style={{ color: T.xmr, fontWeight: 600, fontSize: 13 }}>{fmt.usd(prices.xmrUsd)}</span>
              <span style={{ color: prices.xmrChg24h >= 0 ? T.grn : T.red }}>{fmt.pct(prices.xmrChg24h)}</span>
              <span style={{ color: T.t5 }}>/</span>
              <span style={{ color: T.t4 }}>BTC</span>
              <span>{fmt.usd(prices.btcUsd, 0)}</span>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {np.lastUpdate && !mobile && (
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.t5, flexShrink: 0 }}>
              {np.lastUpdate.toLocaleTimeString()}
            </div>
          )}

          <RefreshRing intervalMs={T.refresh.nanopool} />

          <button onClick={np.reload} className="btn-sweep press-compress" style={{
            fontFamily: T.mono, fontSize: 10, padding: "5px 13px", borderRadius: T.r.sm,
            border: `1px solid ${T.s4}`, background: "transparent", color: T.t4,
            cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 4,
          }}
            onMouseEnter={e => { e.currentTarget.style.color = T.xmr; e.currentTarget.style.borderColor = T.xmr; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.t4; e.currentTarget.style.borderColor = T.s4; }}>
            <Icon name="refresh" size={11} /> Refresh
          </button>
        </div>

        {/* Tab bar */}
        <div style={{
          padding: `0 ${PAD}px`, display: "flex", gap: 0, overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          maskImage: mobile ? "linear-gradient(to right, transparent 0px, black 12px, black calc(100% - 12px), transparent 100%)" : "none",
          WebkitMaskImage: mobile ? "linear-gradient(to right, transparent 0px, black 12px, black calc(100% - 12px), transparent 100%)" : "none",
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="press-compress" style={{
              padding: mobile ? "9px 12px" : "9px 18px",
              border: "none", borderRadius: 0, cursor: "pointer",
              fontFamily: T.mono, fontSize: mobile ? 10 : 11, letterSpacing: 0.5,
              background: "transparent",
              color: tab === t.id ? T.xmr : T.t4,
              borderBottom: tab === t.id ? `2px solid ${T.xmr}` : "2px solid transparent",
              transition: "color 0.15s, border-color 0.15s",
              whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Icon name={t.icon} size={12} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {np.err && (
        <div style={{
          margin: `14px ${PAD}px`, padding: "10px 16px", borderRadius: T.r.md,
          border: `1px solid ${T.red}44`, background: T.redd,
          color: T.red, fontFamily: T.mono, fontSize: 12,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon name="alert" size={14} color={T.red} />
          {np.err}
        </div>
      )}

      {/* Loading */}
      {np.loading && !np.data && <LoadingState />}

      {/* Main content */}
      <main style={{ position: "relative", zIndex: 1, padding: `22px ${PAD}px ${PAD}px`, maxWidth: 1380, margin: "0 auto" }}>
        <div key={tab} className="tab-content">
          {tab === "overview" && <TabOverview np={np} prices={prices} net={net} poolStats={poolStats} mobile={mobile} onNavigate={setTab} LoadingState={LoadingState} />}
          {tab === "pools" && <TabPools np={np} poolStats={poolStats} mobile={mobile} />}
          {tab === "earnings" && <TabEarnings np={np} prices={prices} mobile={mobile} LoadingState={LoadingState} />}
          {tab === "workers" && <TabWorkers np={np} mobile={mobile} LoadingState={LoadingState} />}
          {tab === "network" && <TabNetwork np={np} net={net} prices={prices} rpcData={rpcData} mobile={mobile} />}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 1, padding: `16px ${PAD}px`,
        borderTop: `1px solid ${T.s3}`, marginTop: 32,
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
        fontFamily: T.mono, fontSize: 10, color: T.t5,
      }}>
        <span>
          <span style={{ fontFamily: T.serif, fontStyle: "italic", color: T.t4 }}>xmr</span>
          <span style={{ color: T.t4 }}>miner</span> V3 /
          <span style={{ color: T.xmr }}> xmrboi</span> / {POOL_ADAPTERS.filter(a => a.available).length} live pools / RandomX
        </span>
        <span>Nanopool {T.refresh.nanopool / 1000}s / CoinGecko {T.refresh.gecko / 1000}s / xmrchain {T.refresh.network / 1000}s</span>
      </footer>
    </div>
  );
}

/* ══════════════ EXPORT WITH PROVIDERS ════════════════ */

export default function App() {
  return (
    <UnitProvider>
      <AppShell />
    </UnitProvider>
  );
}
