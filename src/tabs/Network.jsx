import { T, Icon, fmt } from "../tokens.jsx";
import { useUnits, POOL_ADAPTERS } from "../hooks.jsx";
import {
  Card, StatCard, SectionHead, DataRow, DataPending,
  StaggerGrid, PriceChart,
} from "../components.jsx";
import MoneroScene from "../MoneroScene.jsx";

/* ══════════════ POOL DISTRIBUTION BARS ═══════════════ */

const POOL_DIST = [
  { name: "P2Pool (all)",     pct: 38.2, color: T.grn,  decentralized: true },
  { name: "MoneroOcean",      pct: 14.1, color: T.blue },
  { name: "Nanopool",         pct: 12.3, color: T.xmr,  yours: true },
  { name: "HashVault",        pct: 8.4,  color: T.gold },
  { name: "SupportXMR",       pct: 6.1,  color: T.t3 },
  { name: "PrivacyGateway",   pct: 0.8,  color: T.xmr },
  { name: "Others / Unknown", pct: 20.1, color: T.t5 },
];

function PoolDistribution() {
  return (
    <div>
      {POOL_DIST.map(p => (
        <div key={p.name} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
          borderBottom: `1px solid ${T.s3}`,
        }}>
          <span style={{
            fontFamily: T.mono, fontSize: 10, width: 120, flexShrink: 0,
            color: p.yours ? T.xmr : T.t2,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {p.name}
          </span>
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: T.s3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4, background: p.color,
              width: `${p.pct}%`, transition: "width 0.8s ease",
              opacity: p.yours ? 1 : 0.7,
            }} />
          </div>
          <span style={{
            fontFamily: T.mono, fontSize: 10, width: 48, textAlign: "right", flexShrink: 0,
            color: p.yours ? T.xmr : T.t3,
          }}>{p.pct}%</span>
        </div>
      ))}
      <div style={{ display: "flex", gap: 14, marginTop: 10, fontFamily: T.mono, fontSize: 9, color: T.t4, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: T.grn, display: "inline-block" }} />
          Decentralized (P2Pool)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: T.xmr, display: "inline-block" }} />
          Your pools
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: T.t5, display: "inline-block" }} />
          Other
        </span>
      </div>
    </div>
  );
}

/* ══════════════ TAB: NETWORK ═════════════════════════ */

export default function TabNetwork({ np, net, prices, rpcData, mobile }) {
  const { units } = useUnits();
  const xmrUsd = prices?.xmrUsd || 0;
  const userHr = np.data?.hashrate || 0;
  const h = (v) => fmt.hash(v, units.hashrate);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 3D Scene */}
      <Card glow={T.xmr} pad="0" tilt={false} style={{ overflow: "hidden", animation: "floatAmbient 6s ease-in-out infinite" }}>
        <MoneroScene height={300} hashrate={net?.hashrate || 0} difficulty={net?.difficulty || 0} />
      </Card>

      <StaggerGrid cols={3} mobile={mobile}>
        <StatCard label="Network hashrate" value={net ? fmt.hash(net.hashrate) : "\u2014"}
          sub="Monero RandomX" sub2="ASIC-resistant (CPU)" color={T.xmr} glow={T.xmr} icon="globe" />
        <StatCard label="Difficulty" value={net ? fmt.diff(net.difficulty) : "\u2014"}
          sub="Adjusts every block" color={T.t1} />
        <StatCard label="Block height" value={net ? net.height.toLocaleString() : "\u2014"}
          sub="~2 min block time" color={T.t1} />
      </StaggerGrid>

      <StaggerGrid cols={4} mobile={mobile}>
        <StatCard label="Block reward" value={net ? net.reward.toFixed(4) + " XMR" : "\u2014"}
          sub={net && xmrUsd ? fmt.usd(net.reward * xmrUsd) : "\u2014"}
          sub2="Tail emission: forever" color={T.gold} glow={T.gold} icon="coin" />
        <StatCard label="Your pool share"
          value={net?.hashrate ? (userHr / net.hashrate * 100).toFixed(5) + "%" : "\u2014"}
          sub={`at ${h(userHr)}`} color={T.t1} icon="target" />
        <StatCard label="Mempool"
          value={rpcData?.txPoolSize != null ? rpcData.txPoolSize + " tx" : "\u2014"}
          sub="Pending transactions" color={T.blue} />
        <StatCard label="Annual inflation" value="~0.85%" sub="Decreasing" sub2="Post-tail emission" color={T.blue} />
      </StaggerGrid>

      {/* Live block feed */}
      {rpcData?.lastBlock && (
        <Card pad="20px 22px" glow={T.xmr}>
          <SectionHead label="Latest block" sub={`Height ${rpcData.lastBlock.height?.toLocaleString()}`} />
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 8 }}>
            {[
              ["Height", rpcData.lastBlock.height?.toLocaleString(), T.xmr],
              ["Reward", ((rpcData.lastBlock.reward || 0) / 1e12).toFixed(4) + " XMR", T.gold],
              ["Transactions", rpcData.lastBlock.numTxes?.toString() || "0", T.t2],
              ["Difficulty", fmt.diff(rpcData.lastBlock.difficulty), T.t3],
            ].map(([k, v, c]) => (
              <div key={k} style={{ background: T.s2, borderRadius: T.r.sm, padding: "8px 10px" }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 2 }}>{k.toUpperCase()}</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 500, color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pool hashrate distribution */}
      <Card glow={T.xmr} pad="20px 22px">
        <SectionHead label="Pool hashrate distribution" sub="Known Monero mining pools by estimated network share" />
        <PoolDistribution />
      </Card>

      {/* Mining calculator */}
      <Card pad="20px 22px" glow={T.gold}>
        <SectionHead serif label="Your mining footprint" sub="Fleet contribution to network security" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: 8 }}>
          {[
            ["YOUR FLEET HASHRATE", h(userHr), `${(np.data?.workers||[]).length} worker${(np.data?.workers||[]).length!==1?"s":""}`, T.xmr],
            ["NETWORK SHARE", net?.hashrate ? (userHr/net.hashrate*100).toFixed(5)+"%" : "\u2014", `of ${net?fmt.hash(net.hashrate):"\u2014"} global`, T.t1],
            ["EST. POWER DRAW", `~${Math.max(5,Math.round(userHr/233))}W`, `${Math.round(userHr/Math.max(1,Math.round(userHr/233)))} H/W efficiency`, T.t2],
          ].map(([l,v,s,c])=>(
            <div key={l} style={{ background:T.s2, borderRadius:T.r.md, padding:"12px 14px" }}>
              <div style={{ fontFamily:T.mono, fontSize:8, color:T.t4, letterSpacing:1.5, marginBottom:4 }}>{l}</div>
              <div style={{ fontFamily:T.display, fontSize:18, fontWeight:700, color:c }}>{v}</div>
              <div style={{ fontFamily:T.mono, fontSize:9, color:T.t4, marginTop:3 }}>{s}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10 }}>
        <Card pad="20px 22px" glow={T.blue}>
          <SectionHead label="Market data" />
          {prices ? [
            ["XMR price", fmt.usd(prices.xmrUsd), T.xmr],
            ["24h change", fmt.pct(prices.xmrChg24h), prices.xmrChg24h >= 0 ? T.grn : T.red],
            ["Market cap", fmt.usd(prices.xmrMcap / 1e9, 2) + "B", T.t1],
            ["24h volume", fmt.usd(prices.xmrVol / 1e6, 1) + "M", T.t2],
            ["BTC price", fmt.usd(prices.btcUsd, 0), T.gold],
            ["BTC/XMR ratio", prices.btcXmrRatio.toFixed(1) + "x", T.t2],
          ].map(([k, v, c]) => <DataRow key={k} label={k} value={v} valueColor={c} />) : <DataPending />}
          {prices?.priceHistory?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <PriceChart history={prices.priceHistory} days={7} />
            </div>
          )}
        </Card>

        <Card pad="20px 22px" glow={T.grn}>
          <SectionHead label="Monero protocol" />
          {[
            ["Algorithm", "RandomX (CPU-optimized)", T.xmr],
            ["Privacy", "Ring + Stealth + RingCT", T.grn],
            ["Ring size", "16 (15 decoys + 1 real)", T.t1],
            ["Fungibility", "All coins identical", T.grn],
            ["Block time", "~2 minutes", T.t1],
            ["Tail emission", "0.614 XMR/block forever", T.gold],
            ["FCMP++", "Incoming: ~100M anon set", T.cyan],
            ["Nanopool fee", "1% (PPLNS)", T.t1],
          ].map(([k, v, c]) => <DataRow key={k} label={k} value={v} valueColor={c} />)}
        </Card>
      </div>
    </div>
  );
}
