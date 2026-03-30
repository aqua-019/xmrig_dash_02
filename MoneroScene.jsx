import { useState, useEffect, useRef } from "react";
import { T, Icon, fmt, GlobalCSS } from "./tokens.jsx";
import {
  useNanopool, usePrices, useNetwork, usePoolStats,
  useUnits, UnitProvider, useMobile,
  POOL_ADAPTERS, ADDR,
} from "./hooks.jsx";
import {
  Card, StatCard, SectionHead, MiniBar, ZoomPills, UnitToggle,
  LiveDot, DataRow, CopyButton, RefreshRing, DataPending,
  StaggerGrid, HashChart, PriceChart,
  DetailPanel, ExpandButton,
} from "./components.jsx";
import MoneroScene from "./MoneroScene.jsx";
import ParticleRain from "./ParticleRain.jsx";

/* ═══════════════════════════════════════════════════════════════
   XMRminer V2 — Main Application
   Multi-pool command center · LIVE Nanopool data
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

/* ══════════════ TAB: OVERVIEW ════════════════════════ */

function TabOverview({ np, prices, net, mobile }) {
  const { units } = useUnits();
  const [zoom, setZoom] = useState(12);
  const [detail, setDetail] = useState(null); // "hashrate" | "balance" | "market" | null
  const u = np.data;
  if (!u) return <LoadingState />;

  const hrNow = u.hashrate;
  const bal = u.balance;
  const unconf = u.unconfirmedBalance;
  const xmrUsd = prices?.xmrUsd || 0;
  const e = u.earnings;
  const earnDay = e?.day?.coins || 0;
  const pctPayout = Math.min(100, (bal / 0.11) * 100);
  const daysLeft = earnDay > 0 ? ((0.11 - bal) / earnDay).toFixed(1) : "\u2014";
  const h = (v) => fmt.hash(v, units.hashrate);
  const totalBal = bal + unconf;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Hero stats — clickable for detail panels */}
      <StaggerGrid cols={4} mobile={mobile}>
        <Card glow={hrNow > 0 ? T.xmr : T.red} onClick={() => setDetail("hashrate")} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8.5, letterSpacing: 2, color: T.t4, textTransform: "uppercase" }}>Live hashrate</div>
            <Icon name="bolt" size={13} color={T.t4} />
          </div>
          <div style={{ fontFamily: T.display, fontSize: 21, fontWeight: 600, color: hrNow > 0 ? T.xmr : T.red, lineHeight: 1.1, letterSpacing: -0.4, marginBottom: 4 }}>{hrNow ? h(hrNow) : "offline"}</div>
          <div style={{ display: "inline-block", padding: "1px 8px", borderRadius: 4, fontSize: 9, background: hrNow > 0 ? `${T.grn}22` : `${T.red}22`, color: hrNow > 0 ? T.grn : T.red, fontFamily: T.mono, marginBottom: 4, letterSpacing: 1.5, fontWeight: 500 }}>{hrNow > 0 ? "MINING" : "OFFLINE"}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.t3, marginTop: 2 }}>{`1h avg: ${h(u.avgHashrates.h1)}`}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.t4, marginTop: 2 }}>{`24h avg: ${h(u.avgHashrates.h24)}`}</div>
          <ExpandButton label="Full stats" onClick={e => { e.stopPropagation(); setDetail("hashrate"); }} />
        </Card>
        <Card glow={T.grn} onClick={() => setDetail("balance")} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8.5, letterSpacing: 2, color: T.t4, textTransform: "uppercase" }}>Confirmed balance</div>
            <Icon name="coin" size={13} color={T.t4} />
          </div>
          <div style={{ fontFamily: T.display, fontSize: 21, fontWeight: 600, color: T.grn, lineHeight: 1.1, letterSpacing: -0.4, marginBottom: 4 }}>{fmt.xmr(bal) + " XMR"}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.t3, marginTop: 2 }}>{xmrUsd ? fmt.usd(bal * xmrUsd) : "\u2014"}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.t4, marginTop: 2 }}>{`${pctPayout.toFixed(1)}% to payout`}</div>
          <ExpandButton label="Balance info" onClick={e => { e.stopPropagation(); setDetail("balance"); }} />
        </Card>
        <StatCard label="Unconfirmed" value={fmt.xmr(unconf) + " XMR"}
          sub={xmrUsd ? fmt.usd(unconf * xmrUsd) : "\u2014"} sub2="Awaiting confirmation"
          color={T.gold} glow={T.gold} icon="clock" />
        <Card glow={T.blue} onClick={() => setDetail("market")} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8.5, letterSpacing: 2, color: T.t4, textTransform: "uppercase" }}>XMR / USD</div>
            <Icon name="trend" size={13} color={T.t4} />
          </div>
          <div style={{ fontFamily: T.display, fontSize: 21, fontWeight: 600, color: prices?.xmrChg24h >= 0 ? T.grn : T.red, lineHeight: 1.1, letterSpacing: -0.4, marginBottom: 4 }}>{xmrUsd ? fmt.usd(xmrUsd) : "\u2014"}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.t3, marginTop: 2 }}>{prices ? fmt.pct(prices.xmrChg24h) + " 24h" : "\u2014"}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.t4, marginTop: 2 }}>{prices ? `MCap ${fmt.usd(prices.xmrMcap / 1e9, 0)}B` : "\u2014"}</div>
          {prices?.xmrChg24h !== undefined && <div style={{ marginTop: 8 }}><MiniBar value={Math.abs(prices.xmrChg24h)} max={10} color={prices.xmrChg24h >= 0 ? T.grn : T.red} h={3} /></div>}
          <ExpandButton label="Market data" onClick={e => { e.stopPropagation(); setDetail("market"); }} />
        </Card>
      </StaggerGrid>

      {/* HASHRATE DETAIL PANEL */}
      <DetailPanel open={detail === "hashrate"} onClose={() => setDetail(null)}
        title="Hashrate Details" subtitle={`Worker: xmrboi / Pool: Nanopool / Algorithm: RandomX`}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div style={{ background: T.s2, borderRadius: T.r.md, padding: "14px 16px" }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 4 }}>LIVE HASHRATE</div>
            <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 600, color: T.xmr }}>{h(hrNow)}</div>
          </div>
          <div style={{ background: T.s2, borderRadius: T.r.md, padding: "14px 16px" }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 4 }}>STATUS</div>
            <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 600, color: hrNow > 0 ? T.grn : T.red }}>{hrNow > 0 ? "Online" : "Offline"}</div>
          </div>
        </div>
        <SectionHead label="Rolling averages" sub="All time windows from Nanopool API" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 16 }}>
          {[["1h", u.avgHashrates.h1], ["3h", u.avgHashrates.h3], ["6h", u.avgHashrates.h6], ["12h", u.avgHashrates.h12], ["24h", u.avgHashrates.h24]].map(([lbl, v]) => (
            <div key={lbl} style={{ background: T.s2, borderRadius: T.r.sm, padding: "10px", textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1, marginBottom: 3 }}>{lbl.toUpperCase()}</div>
              <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 500, color: T.t1 }}>{h(v)}</div>
            </div>
          ))}
        </div>
        <SectionHead label="Worker inventory" />
        {u.workers.map(w => (
          <DataRow key={w.id} label={w.id} value={`${h(w.hashrate)} / last share ${w.lastShare ? fmt.time(w.lastShare) : "\u2014"}`} valueColor={w.hashrate > 0 ? T.xmr : T.red} />
        ))}
        <DataRow label="Total workers" value={String(u.workers.length)} valueColor={T.t1} />
        <DataRow label="Combined hashrate" value={h(u.workers.reduce((a, w) => a + w.hashrate, 0))} valueColor={T.xmr} />
        <DataRow label="Cumulative shares" value={u.workers.reduce((a, w) => a + (w.rating || 0), 0).toLocaleString()} valueColor={T.gold} />
        {net && <>
          <SectionHead label="Network context" />
          <DataRow label="Network hashrate" value={fmt.hash(net.hashrate)} valueColor={T.xmr} />
          <DataRow label="Your network share" value={(hrNow / net.hashrate * 100).toFixed(6) + "%"} />
          <DataRow label="Difficulty" value={fmt.diff(net.difficulty)} />
        </>}
      </DetailPanel>

      {/* BALANCE DETAIL PANEL */}
      <DetailPanel open={detail === "balance"} onClose={() => setDetail(null)}
        title="Balance Details" subtitle={`Nanopool / Min payout: 0.11 XMR`}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            ["CONFIRMED", fmt.xmr(bal) + " XMR", T.grn],
            ["UNCONFIRMED", fmt.xmr(unconf) + " XMR", T.gold],
            ["TOTAL", fmt.xmr(totalBal) + " XMR", T.t1],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: T.s2, borderRadius: T.r.md, padding: "14px 16px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 4 }}>{l}</div>
              <div style={{ fontFamily: T.display, fontSize: 18, fontWeight: 600, color: c }}>{v}</div>
            </div>
          ))}
        </div>
        <SectionHead label="Payout progress" sub={`${pctPayout.toFixed(1)}% of 0.11 XMR threshold`} />
        <MiniBar value={bal} max={0.11} color={bal >= 0.11 ? T.grn : T.xmr} h={12} />
        <div style={{ marginTop: 12 }} />
        <DataRow label="Balance" value={fmt.xmr(bal) + " XMR"} valueColor={T.xmr} />
        <DataRow label="Remaining to payout" value={fmt.xmr(Math.max(0, 0.11 - bal)) + " XMR"} />
        <DataRow label="USD value (confirmed)" value={xmrUsd ? fmt.usd(bal * xmrUsd) : "\u2014"} valueColor={T.grn} />
        <DataRow label="USD value (unconfirmed)" value={xmrUsd ? fmt.usd(unconf * xmrUsd) : "\u2014"} valueColor={T.gold} />
        <DataRow label="USD to go" value={xmrUsd ? fmt.usd(Math.max(0, 0.11 - bal) * xmrUsd) : "\u2014"} valueColor={T.gold} />
        <DataRow label="Est. days to payout" value={daysLeft + " days"} valueColor={T.blue} />
        <DataRow label="Min payout" value="0.11 XMR" />
        <DataRow label="Pool fee" value="1% PPLNS" />
        {e && <>
          <SectionHead label="Earnings rate" />
          <DataRow label="Per day" value={`${fmt.xmr(e.day?.coins)} XMR (${xmrUsd ? fmt.usd(e.day?.dollars || 0) : "\u2014"})`} valueColor={T.xmr} />
          <DataRow label="Per month" value={`${fmt.xmr(e.month?.coins)} XMR (${xmrUsd ? fmt.usd(e.month?.dollars || 0) : "\u2014"})`} valueColor={T.grn} />
          <DataRow label="Per year" value={`${fmt.xmr((e.month?.coins || 0) * 12)} XMR (${xmrUsd ? fmt.usd((e.month?.dollars || 0) * 12) : "\u2014"})`} valueColor={T.blue} />
        </>}
      </DetailPanel>

      {/* MARKET DETAIL PANEL */}
      <DetailPanel open={detail === "market"} onClose={() => setDetail(null)}
        title="Market Data" subtitle="CoinGecko / Monero + Bitcoin">
        {prices ? <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: T.s2, borderRadius: T.r.md, padding: "14px 16px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 4 }}>XMR PRICE</div>
              <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 600, color: T.xmr }}>{fmt.usd(prices.xmrUsd)}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: prices.xmrChg24h >= 0 ? T.grn : T.red, marginTop: 4 }}>{fmt.pct(prices.xmrChg24h)} 24h</div>
            </div>
            <div style={{ background: T.s2, borderRadius: T.r.md, padding: "14px 16px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 4 }}>BTC PRICE</div>
              <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 600, color: T.gold }}>{fmt.usd(prices.btcUsd, 0)}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: prices.btcChg24h >= 0 ? T.grn : T.red, marginTop: 4 }}>{fmt.pct(prices.btcChg24h)} 24h</div>
            </div>
          </div>
          <SectionHead label="Monero market" />
          <DataRow label="Price" value={fmt.usd(prices.xmrUsd)} valueColor={T.xmr} />
          <DataRow label="24h change" value={fmt.pct(prices.xmrChg24h)} valueColor={prices.xmrChg24h >= 0 ? T.grn : T.red} />
          <DataRow label="Market cap" value={fmt.usd(prices.xmrMcap / 1e9, 2) + " B"} />
          <DataRow label="24h volume" value={fmt.usd(prices.xmrVol / 1e6, 1) + " M"} />
          <DataRow label="BTC/XMR ratio" value={prices.btcXmrRatio.toFixed(1) + "x"} />
          <SectionHead label="Your holdings at current price" />
          <DataRow label="Confirmed balance" value={xmrUsd ? fmt.usd(bal * xmrUsd) : "\u2014"} valueColor={T.grn} />
          <DataRow label="Total balance" value={xmrUsd ? fmt.usd(totalBal * xmrUsd) : "\u2014"} valueColor={T.t1} />
          <DataRow label="Monthly earnings value" value={e?.month?.dollars ? fmt.usd(e.month.dollars) : "\u2014"} valueColor={T.gold} />
          {prices.priceHistory?.length > 0 && <>
            <SectionHead label="7-day price chart" />
            <PriceChart history={prices.priceHistory} days={7} />
            <div style={{ display: "flex", gap: 16, marginTop: 8, fontFamily: T.mono, fontSize: 10, color: T.t3 }}>
              <span>Low: <span style={{ color: T.red }}>{fmt.usd(Math.min(...prices.priceHistory.slice(-168).map(p => p.v)))}</span></span>
              <span>High: <span style={{ color: T.grn }}>{fmt.usd(Math.max(...prices.priceHistory.slice(-168).map(p => p.v)))}</span></span>
            </div>
          </>}
        </> : <DataPending label="Market data loading..." h={80} />}
      </DetailPanel>

      {/* Average hashrates */}
      <StaggerGrid cols={5} mobile={mobile}>
        {[["1h", u.avgHashrates.h1], ["3h", u.avgHashrates.h3], ["6h", u.avgHashrates.h6],
          ["12h", u.avgHashrates.h12], ["24h", u.avgHashrates.h24]].map(([lbl, v]) => (
          <StatCard key={lbl} label={`${lbl} avg`} value={h(v)} color={T.t1} glow={T.xmr} />
        ))}
      </StaggerGrid>

      {/* Payout progress */}
      <Card glow={T.xmr} pad="20px 22px">
        <SectionHead label="Payout progress" sub="Nanopool min payout: 0.11 XMR" />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <MiniBar value={bal} max={0.11} color={bal >= 0.11 ? T.grn : T.xmr} h={10} />
          </div>
          <span style={{ fontFamily: T.display, fontSize: 20, fontWeight: 600, color: bal >= 0.11 ? T.grn : T.xmr, minWidth: 56, textAlign: "right" }}>
            {pctPayout.toFixed(1)}%
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10 }}>
          {[
            ["Balance", fmt.xmr(bal) + " XMR", T.xmr],
            ["Remaining", fmt.xmr(Math.max(0, 0.11 - bal)) + " XMR", T.t2],
            ["USD to go", xmrUsd ? fmt.usd(Math.max(0, 0.11 - bal) * xmrUsd) : "\u2014", T.gold],
            ["Days to payout", daysLeft + " days", T.blue],
          ].map(([l, v, c]) => (
            <div key={l} style={{ background: T.s2, borderRadius: T.r.md, padding: "10px 12px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 4 }}>{l.toUpperCase()}</div>
              <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 500, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Hashrate chart */}
      <Card glow={T.xmr} pad="20px 22px">
        <SectionHead label="Share activity" sub={`${u.chart.length} data points`}
          right={<ZoomPills value={zoom} onChange={setZoom} options={[1, 3, 6, 12, 24]} />} />
        <HashChart data={u.chart} zoom={zoom} />
        <div style={{ display: "flex", gap: 16, marginTop: 10, fontFamily: T.mono, fontSize: 10, color: T.t4, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 2, background: T.xmr, display: "inline-block", borderRadius: 1 }} />Shares / 10 min
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 1.5, background: T.t3, display: "inline-block", borderRadius: 1, opacity: 0.7 }} />2h SMA
          </span>
        </div>
      </Card>

      {/* Earnings snapshot */}
      {e && (
        <StaggerGrid cols={3} mobile={mobile}>
          <StatCard label="Est. daily" value={xmrUsd ? fmt.usd(e.day?.dollars || 0) : "\u2014"}
            sub={fmt.xmr(e.day?.coins) + " XMR/day"} sub2="At current hashrate"
            color={T.gold} glow={T.gold} icon="trend" />
          <StatCard label="Est. monthly" value={xmrUsd ? fmt.usd(e.month?.dollars || 0) : "\u2014"}
            sub={fmt.xmr(e.month?.coins) + " XMR/month"} color={T.grn} glow={T.grn} />
          <StatCard label="Est. annual" value={xmrUsd ? fmt.usd((e.month?.dollars || 0) * 12) : "\u2014"}
            sub={fmt.xmr((e.month?.coins || 0) * 12) + " XMR/year"} color={T.blue} glow={T.blue} />
        </StaggerGrid>
      )}

      {/* Featured Pool Banner */}
      <Card glow={T.xmr} pad="16px 20px" className="outline-reveal" style={{ border: `1px solid ${T.xmr}22`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: T.xmr, opacity: 0.04, filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Icon name="star" size={12} color={T.xmr} />
          <span style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 2, color: T.xmr }}>FEATURED POOL</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontFamily: T.serif, fontSize: 16, fontStyle: "italic", color: T.t1 }}>PrivacyGateway.io Mining Pool</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.t3, marginTop: 3 }}>Not for profit, but for privacy. Every hash makes Monero stronger.</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.t4, marginTop: 6 }}>pool.xmr.privacygateway.io / Ports 3333, 5555, 7777, 9000</div>
          </div>
          <div className="btn-sweep press-compress" style={{
            padding: "8px 18px", borderRadius: T.r.sm, border: `1px solid ${T.xmr}`,
            background: T.xmrd, color: T.xmr, fontFamily: T.mono, fontSize: 11,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.15s",
          }}>
            View pool <Icon name="ext" size={10} />
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════ TAB: POOLS ═══════════════════════════ */

function TabPools({ np, poolStats, mobile }) {
  const featured = POOL_ADAPTERS.find(a => a.featured);
  const others = POOL_ADAPTERS.filter(a => !a.featured);
  const [openPool, setOpenPool] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Featured: PrivacyGateway */}
      {featured && (
        <Card glow={T.xmr} pad="22px" style={{ border: `1px solid ${T.xmr}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Icon name="star" size={12} color={T.xmr} />
            <span style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 2, color: T.xmr }}>FEATURED COMMUNITY POOL</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontFamily: T.serif, fontSize: 22, fontStyle: "italic", color: T.t1, letterSpacing: -0.4 }}>
                PrivacyGateway.io
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.xmr, margin: "4px 0" }}>
                {featured.config.tagline}
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.t3, lineHeight: 1.7, marginTop: 8 }}>
                {featured.config.description}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {["Community", "No-log", "XMR Swap"].map(tag => (
                  <span key={tag} style={{
                    fontFamily: T.mono, fontSize: 8, padding: "2px 8px", borderRadius: 4,
                    background: T.xmrd, color: T.xmr, letterSpacing: 1,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ minWidth: 200 }}>
              {[
                ["Stratum", featured.config.stratum, T.xmr],
                ...featured.config.ports.map((p, i) => [`Port ${["low", "mid", "high", "SSL"][i]}`, String(p), T.t2]),
                ["Fee", `~${featured.config.fee}%`, T.grn],
              ].map(([k, v, c]) => <DataRow key={k} label={k} value={v} valueColor={c} />)}
              <DataPending label="Pool stats en route" h={40} />
            </div>
          </div>
        </Card>
      )}

      {/* Pool grid */}
      <StaggerGrid cols={3} mobile={mobile}>
        {others.map(adapter => {
          const active = adapter.id === "nanopool";
          return (
            <Card key={adapter.id} glow={active ? T.grn : T.xmr} pad="16px"
              onClick={() => setOpenPool(adapter)}
              style={{ ...(active ? { borderColor: T.grn + "44" } : {}), cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontFamily: T.display, fontSize: 14, fontWeight: 600 }}>
                  {adapter.name}
                  {active && <Icon name="check" size={12} color={T.grn} style={{ marginLeft: 6 }} />}
                </div>
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.t3, marginBottom: 10 }}>
                {adapter.config.tagline || adapter.config.scheme}
              </div>
              {[
                ["Fee", `${adapter.config.fee}% ${adapter.config.scheme}`, T.t2],
                ["Min payout", `${adapter.config.minPayout} XMR`, T.t2],
                ["SSL", adapter.config.ssl ? "Yes" : "No", adapter.config.ssl ? T.grn : T.t4],
              ].map(([k, v, c]) => <DataRow key={k} label={k} value={v} valueColor={c} />)}
              {active && poolStats && <>
                <DataRow label="Pool hashrate" value={fmt.hash(poolStats.poolHashrate)} valueColor={T.xmr} />
                <DataRow label="Miners" value={poolStats.miners?.toLocaleString() || "\u2014"} valueColor={T.t2} />
              </>}
              {!active && !adapter.available && (
                <DataPending label="Data en route" h={36} />
              )}
              <div style={{
                marginTop: 12, padding: "7px 0", textAlign: "center", borderRadius: T.r.sm, fontSize: 10,
                fontFamily: T.mono, letterSpacing: 1,
                border: `1px solid ${active ? T.grn + "44" : T.s4}`,
                color: active ? T.grn : T.t4,
                background: active ? T.grnd : "transparent",
              }}>
                {active ? "ACTIVE" : adapter.available ? "CONNECT" : "COMING SOON"}
              </div>
            </Card>
          );
        })}
      </StaggerGrid>

      {/* Pool Detail Popup */}
      {openPool && (
        <DetailPanel open={!!openPool} onClose={() => setOpenPool(null)}
          title={openPool.name} subtitle={`Pool ID: ${openPool.id} / ${openPool.config.scheme}`}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: T.s2, borderRadius: T.r.md, padding: "14px 16px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 4 }}>FEE</div>
              <div style={{ fontFamily: T.display, fontSize: 18, fontWeight: 600, color: openPool.config.fee === 0 ? T.grn : T.t1 }}>
                {openPool.config.fee}%
              </div>
            </div>
            <div style={{ background: T.s2, borderRadius: T.r.md, padding: "14px 16px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 4 }}>MIN PAYOUT</div>
              <div style={{ fontFamily: T.display, fontSize: 18, fontWeight: 600, color: T.xmr }}>
                {openPool.config.minPayout} XMR
              </div>
            </div>
          </div>
          <SectionHead label="Connection details" />
          <DataRow label="Stratum" value={openPool.config.stratum} valueColor={T.xmr} />
          {openPool.config.ports.map((p, i) => (
            <DataRow key={p} label={`Port ${i + 1}`} value={String(p)} />
          ))}
          <DataRow label="Payment scheme" value={openPool.config.scheme} />
          <DataRow label="SSL" value={openPool.config.ssl ? "Yes" : "No"} valueColor={openPool.config.ssl ? T.grn : T.t4} />
          {openPool.config.tagline && <DataRow label="Description" value={openPool.config.tagline} valueColor={T.t2} />}
          {openPool.config.description && (
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.t3, marginTop: 12, lineHeight: 1.7, padding: "12px 0", borderTop: `1px solid ${T.s3}` }}>
              {openPool.config.description}
            </div>
          )}
          {openPool.id === "nanopool" && poolStats && <>
            <SectionHead label="Live pool stats" sub="From Nanopool API" />
            <DataRow label="Pool hashrate" value={fmt.hash(poolStats.poolHashrate)} valueColor={T.xmr} />
            <DataRow label="Active miners" value={poolStats.miners?.toLocaleString() || "\u2014"} valueColor={T.t2} />
            <DataRow label="Fee" value={`${poolStats.fee}%`} />
            <DataRow label="Min payout" value={`${poolStats.minPayout} XMR`} />
          </>}
          {!openPool.available && openPool.id !== "nanopool" && (
            <div style={{ marginTop: 16 }}>
              <DataPending label="Live pool stats en route -- API integration pending" h={60} />
            </div>
          )}
        </DetailPanel>
      )}

      {/* Comparison matrix */}
      <Card pad="0" style={{ overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "100px repeat(5,1fr)", gap: 8,
          padding: "10px 16px", background: T.s2, borderBottom: `1px solid ${T.s3}`,
          fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, textTransform: "uppercase",
        }}>
          <span>Metric</span>
          {POOL_ADAPTERS.map(a => (
            <span key={a.id} style={{ color: a.id === "nanopool" ? T.xmr : a.featured ? T.gold : T.t4 }}>{a.name.split(" ")[0]}</span>
          ))}
        </div>
        {[
          { label: "Fee", vals: POOL_ADAPTERS.map(a => ({ v: `${a.config.fee}%`, c: a.config.fee === 0 ? T.grn : T.t2 })) },
          { label: "Min payout", vals: POOL_ADAPTERS.map(a => ({ v: `${a.config.minPayout}`, c: a.config.minPayout <= 0.01 ? T.grn : T.t2 })) },
          { label: "Scheme", vals: POOL_ADAPTERS.map(a => ({ v: a.config.scheme, c: T.t2 })) },
          { label: "SSL", vals: POOL_ADAPTERS.map(a => ({ v: a.config.ssl ? "Yes" : "N/A", c: a.config.ssl ? T.grn : T.t4 })) },
        ].map(row => (
          <div key={row.label} style={{
            display: "grid", gridTemplateColumns: "100px repeat(5,1fr)", gap: 8,
            padding: "8px 16px", borderBottom: `1px solid ${T.s3}`, fontFamily: T.mono, fontSize: 11,
          }}>
            <span style={{ color: T.t4, fontSize: 10 }}>{row.label}</span>
            {row.vals.map((v, i) => <span key={i} style={{ color: v.c }}>{v.v}</span>)}
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ══════════════ TAB: EARNINGS ════════════════════════ */

function TabEarnings({ np, prices, mobile }) {
  const { units } = useUnits();
  const u = np.data;
  const e = u?.earnings;
  if (!e) return <LoadingState />;

  const xmrUsd = prices?.xmrUsd || 0;
  const bal = u.balance;
  const earnDay = e.day?.coins || 0;
  const daysLeft = earnDay > 0 ? Math.max(0, (0.11 - bal) / earnDay).toFixed(1) : "\u2014";
  const h = (v) => fmt.hash(v, units.hashrate);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <StaggerGrid cols={3} mobile={mobile}>
        <StatCard label="Days to payout" value={daysLeft + " days"} sub="0.11 XMR min (Nanopool)"
          sub2={`Current: ${fmt.xmr(bal)} XMR`} color={T.gold} glow={T.gold} icon="target" />
        <StatCard label="Monthly projection" value={xmrUsd ? fmt.usd(e.month?.dollars || 0) : "\u2014"}
          sub={fmt.xmr(e.month?.coins) + " XMR"} color={T.grn} glow={T.grn} />
        <StatCard label="Annual projection" value={xmrUsd ? fmt.usd((e.month?.dollars || 0) * 12) : "\u2014"}
          sub={fmt.xmr((e.month?.coins || 0) * 12) + " XMR"} color={T.blue} glow={T.blue} />
      </StaggerGrid>

      {/* Earnings table */}
      <Card pad="0" style={{ overflow: "hidden" }}>
        <div style={{
          padding: "10px 16px", background: T.s2, borderBottom: `1px solid ${T.s3}`,
          display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr", gap: 8,
          fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 2, textTransform: "uppercase",
        }}>
          <span>Period</span><span>XMR</span><span>USD</span><span>BTC</span>
        </div>
        {[["Minute", e.minute], ["Hour", e.hour], ["Day", e.day], ["Week", e.week], ["Month", e.month]]
          .map(([lbl, d]) => d && (
            <div key={lbl} style={{
              display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr", gap: 8,
              padding: "10px 16px", borderBottom: `1px solid ${T.s3}`, fontFamily: T.mono, fontSize: 12,
              background: lbl === "Day" ? T.xmrdd : "transparent",
              borderLeft: lbl === "Day" ? `3px solid ${T.xmr}` : "3px solid transparent",
            }}>
              <span style={{ color: lbl === "Day" ? T.xmr : T.t4, fontSize: 10, textTransform: "uppercase" }}>{lbl}</span>
              <span style={{ color: T.t2 }}>{(+d.coins).toFixed(8)}</span>
              <span style={{ color: T.t1 }}>{fmt.usd(d.dollars, 4)}</span>
              <span style={{ color: T.t3, fontSize: 11 }}>{(+d.bitcoins).toFixed(10)}</span>
            </div>
          ))}
      </Card>

      {/* Hashrate sensitivity */}
      <Card pad="20px 22px">
        <SectionHead label="Hashrate sensitivity" sub="Projected earnings at different hashrates"
          right={<UnitToggle type="hashrate" />} />
        <Card pad="0" style={{ overflow: "hidden", boxShadow: "none", border: `1px solid ${T.s3}` }}>
          <div style={{
            padding: "8px 14px", background: T.s2, borderBottom: `1px solid ${T.s3}`,
            display: "grid", gridTemplateColumns: mobile ? "100px 1fr 1fr" : "100px 1fr 1fr 1fr 1fr", gap: 8,
            fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 2, textTransform: "uppercase",
          }}>
            <span>Hashrate</span><span>Day XMR</span><span>Month USD</span>
            {!mobile && <><span>Year USD</span><span>Days to payout</span></>}
          </div>
          {[500, 1000, 2000, 3000, 3500, 5000, 7500, 10000, 15000].map(hr => {
            const d = earnDay * (hr / 3500);
            const mo = d * 30 * xmrUsd;
            const yr = d * 365 * xmrUsd;
            const dp = d > 0 ? Math.max(0, (0.11 - bal) / d).toFixed(0) : "\u2014";
            const isMe = Math.abs(hr - u.hashrate) < 400;
            return (
              <div key={hr} style={{
                display: "grid", gridTemplateColumns: mobile ? "100px 1fr 1fr" : "100px 1fr 1fr 1fr 1fr", gap: 8,
                padding: "9px 14px", borderBottom: `1px solid ${T.s3}`, fontFamily: T.mono, fontSize: 12,
                background: isMe ? T.xmrdd : "transparent",
                borderLeft: isMe ? `3px solid ${T.xmr}` : "3px solid transparent",
              }}>
                <span style={{ color: isMe ? T.xmr : T.t3 }}>{h(hr)}{isMe ? " \u2190" : ""}</span>
                <span style={{ color: T.t2 }}>{d.toFixed(8)}</span>
                <span style={{ color: T.t1 }}>{xmrUsd ? fmt.usd(mo) : "\u2014"}</span>
                {!mobile && <><span style={{ color: T.grn }}>{xmrUsd ? fmt.usd(yr) : "\u2014"}</span><span style={{ color: T.t3 }}>{dp}d</span></>}
              </div>
            );
          })}
        </Card>
      </Card>

      {/* Price scenarios */}
      <Card pad="20px 22px" glow={T.gold}>
        <SectionHead serif label="What if XMR moons?" sub="Monthly earnings at different prices" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(5,1fr)", gap: 8 }}>
          {[100, 200, 350, 500, 1000, 1500, 2000, 3000, 5000, 10000]
            .filter((_, i) => mobile ? i < 4 : i < 5)
            .map(p => {
              const isCurr = xmrUsd && Math.abs(p - xmrUsd) < 50;
              return (
                <div key={p} style={{
                  background: isCurr ? T.goldd : T.s2, borderRadius: T.r.md, padding: "12px 14px",
                  border: `1px solid ${isCurr ? T.gold + "44" : T.s3}`, textAlign: "center",
                }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.t4, marginBottom: 4 }}>{fmt.usd(p, 0)}</div>
                  <div style={{ fontFamily: T.display, fontSize: 16, fontWeight: 600, color: p >= (xmrUsd || 999999) ? T.grn : T.t2 }}>
                    {fmt.usd(earnDay * 30 * p)}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.t4, marginTop: 2 }}>{isCurr ? "current" : "mo."}</div>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════ TAB: WORKERS ═════════════════════════ */

function TabWorkers({ np, mobile }) {
  const { units } = useUnits();
  const u = np.data;
  const [openWorker, setOpenWorker] = useState(null);
  if (!u) return <LoadingState />;

  const workers = u.workers;
  const payments = u.payments || [];
  const h = (v) => fmt.hash(v, units.hashrate);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <StaggerGrid cols={3} mobile={mobile}>
        <StatCard label="Active workers" value={workers.length || "0"} sub="Nanopool" icon="server"
          color={T.xmr} glow={T.xmr} />
        <StatCard label="Total hashrate" value={h(u.hashrate)} sub="Combined all workers"
          color={T.grn} glow={T.grn} icon="bolt" />
        <StatCard label="Total shares" value={(workers.reduce((a, w) => a + (w.rating || 0), 0)).toLocaleString()}
          sub="Cumulative accepted" color={T.gold} glow={T.gold} />
      </StaggerGrid>

      {/* Stale/offline worker alerts */}
      {workers.some(w => w.hashrate === 0) && (
        <div style={{
          padding: "12px 16px", borderRadius: `0 ${T.r.md}px ${T.r.md}px 0`,
          borderLeft: `3px solid ${T.gold}`, background: T.goldd,
          display: "flex", alignItems: "flex-start", gap: 10,
          animation: "fadeSlideUp 0.4s ease forwards",
        }}>
          <Icon name="alert" size={14} color={T.gold} style={{ marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.gold }}>
              {workers.filter(w => w.hashrate === 0).map(w => `"${w.id}"`).join(", ")} {workers.filter(w => w.hashrate === 0).length === 1 ? "has" : "have"} 0 hashrate -- may need attention
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.t4, marginTop: 3 }}>
              Workers with no shares in 30+ minutes trigger this alert
            </div>
          </div>
        </div>
      )}

      {/* Worker cards — click to expand */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2,1fr)", gap: 10 }}>
        {workers.map(w => {
          const online = w.hashrate > 0;
          const stale = !online && w.lastShare && (Date.now() / 1000 - w.lastShare) < 3600;
          const statusColor = online ? T.grn : stale ? T.gold : T.red;
          const statusLabel = online ? "Online" : stale ? "Stale" : "Offline";
          return (
            <Card key={w.id} glow={statusColor} pad="16px" onClick={() => setOpenWorker(w)}
              style={{ borderLeft: `3px solid ${statusColor}`, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: T.display, fontSize: 14, fontWeight: 600 }}>{w.id}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.t4 }}>
                    Nanopool / Last share: {w.lastShare ? fmt.time(w.lastShare) : "\u2014"}
                  </div>
                </div>
                <span style={{
                  fontFamily: T.mono, fontSize: 9, padding: "2px 8px", borderRadius: 4,
                  background: `${statusColor}22`, color: statusColor,
                }}>{statusLabel}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                {[
                  ["HASHRATE", h(w.hashrate), T.xmr],
                  ["24H AVG", h(w.h24), T.t1],
                  ["SHARES", (w.rating || 0).toLocaleString(), T.gold],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ background: T.s2, borderRadius: T.r.sm, padding: "6px 8px" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 7, color: T.t4, letterSpacing: 1, marginBottom: 2 }}>{l}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 500, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, marginTop: 8, letterSpacing: 1, opacity: 0.7 }}>
                CLICK FOR FULL METRICS
              </div>
            </Card>
          );
        })}
      </div>

      {/* Worker Detail Popup */}
      {openWorker && (
        <DetailPanel open={!!openWorker} onClose={() => setOpenWorker(null)}
          title={openWorker.id} subtitle={`Worker UID: ${openWorker.uid || "\u2014"} / Pool: Nanopool`}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: T.s2, borderRadius: T.r.md, padding: "14px 16px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 4 }}>STATUS</div>
              <div style={{ fontFamily: T.display, fontSize: 18, fontWeight: 600, color: openWorker.hashrate > 0 ? T.grn : T.red }}>
                {openWorker.hashrate > 0 ? "Online" : "Offline"}
              </div>
            </div>
            <div style={{ background: T.s2, borderRadius: T.r.md, padding: "14px 16px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 4 }}>LIVE HASHRATE</div>
              <div style={{ fontFamily: T.display, fontSize: 18, fontWeight: 600, color: T.xmr }}>{h(openWorker.hashrate)}</div>
            </div>
          </div>
          <SectionHead label="Hashrate averages" sub="Rolling windows from Nanopool" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 16 }}>
            {[["1h", openWorker.h1], ["3h", openWorker.h3], ["6h", openWorker.h6], ["12h", openWorker.h12], ["24h", openWorker.h24]].map(([lbl, v]) => (
              <div key={lbl} style={{ background: T.s2, borderRadius: T.r.sm, padding: "10px", textAlign: "center" }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1, marginBottom: 3 }}>{lbl.toUpperCase()}</div>
                <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 500, color: T.t1 }}>{h(v)}</div>
              </div>
            ))}
          </div>
          <SectionHead label="Worker details" />
          <DataRow label="Worker name" value={openWorker.id} valueColor={T.xmr} />
          <DataRow label="Worker UID" value={openWorker.uid || "\u2014"} />
          <DataRow label="Last share" value={openWorker.lastShare ? fmt.time(openWorker.lastShare) : "\u2014"} />
          <DataRow label="Last share (UTC)" value={openWorker.lastShare ? new Date(openWorker.lastShare * 1000).toISOString().replace("T", " ").slice(0, 19) : "\u2014"} />
          <DataRow label="Cumulative shares" value={(openWorker.rating || 0).toLocaleString()} valueColor={T.gold} />
          <DataRow label="Pool" value="Nanopool" valueColor={T.xmr} />
          <DataRow label="Algorithm" value="RandomX (CPU)" />
          <DataRow label="Payout address" value={ADDR.slice(0, 12) + "..." + ADDR.slice(-8)} valueColor={T.t3} />
        </DetailPanel>
      )}

      {/* PrivacyGateway workers placeholder */}
      <Card glow={T.xmr} pad="16px" style={{ border: `1px dashed ${T.s4}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Icon name="star" size={12} color={T.xmr} />
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.xmr, letterSpacing: 1 }}>PRIVACYGATEWAY WORKERS</span>
        </div>
        <DataPending label="Connect pool to see workers" h={50} />
      </Card>

      {/* Wallet + Payments */}
      <Card pad="20px 22px">
        <SectionHead label="Wallet address" sub="Nanopool payout address" />
        <div style={{ background: T.s2, borderRadius: T.r.md, padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ fontFamily: T.mono, fontSize: mobile ? 9 : 10.5, color: T.t3, wordBreak: "break-all", lineHeight: 1.8 }}>{ADDR}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <CopyButton text={ADDR} />
          <a href={`https://xmr.nanopool.org/account/${ADDR}`} target="_blank" rel="noopener"
            style={{
              fontFamily: T.mono, fontSize: 10, padding: "4px 12px", borderRadius: T.r.sm,
              border: `1px solid ${T.s5}`, color: T.xmr, display: "inline-flex", alignItems: "center", gap: 4,
            }}>
            Open on Nanopool <Icon name="ext" size={10} />
          </a>
        </div>
      </Card>

      {/* Payments */}
      <Card pad="0" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", background: T.s2, borderBottom: `1px solid ${T.s3}` }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2.5, color: T.t4, textTransform: "uppercase" }}>
            Payment history ({payments.length})
          </span>
        </div>
        {payments.length === 0 ? (
          <div style={{ padding: "20px 16px", fontFamily: T.mono, fontSize: 12, color: T.t4 }}>
            No payments yet -- balance accumulating toward 0.11 XMR threshold.
          </div>
        ) : payments.slice(0, 10).map((pay, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: mobile ? "1fr 80px" : "140px 1fr 100px 80px", gap: 8,
            padding: "9px 16px", borderBottom: `1px solid ${T.s3}`, fontFamily: T.mono, fontSize: 12,
          }}>
            <span style={{ color: T.grn }}>{fmt.xmr(pay.amount)} XMR</span>
            {!mobile && <span style={{ color: T.t4, fontSize: 10, wordBreak: "break-all" }}>{pay.txHash || "\u2014"}</span>}
            {!mobile && <span style={{ color: T.t4 }}>{pay.date ? fmt.time(pay.date) : "\u2014"}</span>}
            <span style={{ color: T.t4, textAlign: "right" }}>{pay.confirmed ? "Confirmed" : "Pending"}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ══════════════ POOL DISTRIBUTION BARS ═══════════════ */

const POOL_DIST = [
  { name: "P2Pool (all)",     pct: 38.2, color: T.grn,  featured: false, decentralized: true },
  { name: "MoneroOcean",      pct: 14.1, color: T.blue, featured: false },
  { name: "Nanopool",         pct: 12.3, color: T.xmr,  featured: false, yours: true },
  { name: "HashVault",        pct: 8.4,  color: T.gold, featured: false },
  { name: "SupportXMR",       pct: 6.1,  color: T.t3,   featured: false },
  { name: "PrivacyGateway",   pct: 0.8,  color: T.xmr,  featured: true },
  { name: "Others / Unknown", pct: 20.1, color: T.t5,   featured: false },
];

function PoolDistribution({ userHr, netHr, poolStats }) {
  return (
    <div>
      {POOL_DIST.map(p => (
        <div key={p.name} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
          borderBottom: `1px solid ${T.s3}`,
          ...(p.featured ? { background: T.xmrdd, borderLeft: `2px solid ${T.xmr}`, paddingLeft: 10, borderRadius: 0, marginLeft: -2 } : {}),
        }}>
          <span style={{
            fontFamily: T.mono, fontSize: 10, width: 120, flexShrink: 0,
            color: p.featured ? T.xmr : p.yours ? T.xmr : T.t2,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {p.featured && <Icon name="star" size={10} color={T.xmr} />}
            {p.name}
          </span>
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: T.s3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4, background: p.color,
              width: `${p.pct}%`, transition: "width 0.8s ease",
              opacity: p.featured || p.yours ? 1 : 0.7,
            }} />
          </div>
          <span style={{
            fontFamily: T.mono, fontSize: 10, width: 48, textAlign: "right", flexShrink: 0,
            color: p.featured ? T.xmr : p.yours ? T.xmr : T.t3,
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

/* ══════════════ MOUSE-FOLLOW GLOW (200 doc #45) ═════ */

function MouseGlow() {
  const ref = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
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

/* ══════════════ TAB: NETWORK ═════════════════════════ */

function TabNetwork({ np, net, prices, mobile }) {
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

      <StaggerGrid cols={3} mobile={mobile}>
        <StatCard label="Block reward" value={net ? net.reward.toFixed(4) + " XMR" : "\u2014"}
          sub={net && xmrUsd ? fmt.usd(net.reward * xmrUsd) : "\u2014"}
          sub2="Tail emission: forever" color={T.gold} glow={T.gold} icon="coin" />
        <StatCard label="Your pool share"
          value={net?.hashrate ? (userHr / net.hashrate * 100).toFixed(5) + "%" : "\u2014"}
          sub={`at ${h(userHr)}`} color={T.t1} icon="target" />
        <StatCard label="Annual inflation" value="~0.85%" sub="Decreasing" sub2="Post-tail emission" color={T.blue} />
      </StaggerGrid>

      {/* Pool hashrate distribution */}
      <Card glow={T.xmr} pad="20px 22px">
        <SectionHead label="Pool hashrate distribution" sub="Known Monero mining pools by estimated network share" />
        <PoolDistribution userHr={userHr} netHr={net?.hashrate} poolStats={null} />
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
              <div style={{ fontFamily:T.display, fontSize:16, fontWeight:600, color:c }}>{v}</div>
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

/* ══════════════ ROOT APP ═════════════════════════════ */

function AppShell() {
  const np = useNanopool();
  const prices = usePrices();
  const net = useNetwork();
  const poolStats = usePoolStats();
  const { units } = useUnits();
  const [tab, setTab] = useState("overview");
  const mobile = useMobile();

  const hrNow = np.data?.hashrate || 0;
  const PAD = mobile ? 14 : 28;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.t1, fontFamily: T.sans, fontSize: 14 }}>
      <style>{GlobalCSS}</style>

      {/* Ambient glow blobs (gradient drift animation) */}
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

      {/* Mouse-follow glow (200 doc complexity 3: cursor spotlight) */}
      <MouseGlow />

      {/* Particle rain — high-density Monero orange falling particles */}
      <ParticleRain />

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
              <div style={{ fontFamily: T.mono, fontSize: 7.5, color: T.t4, letterSpacing: 2.5 }}>V2 COMMAND CENTER</div>
            </div>
          </div>

          {/* Live hashrate pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7, padding: "5px 14px",
            borderRadius: T.r.pill, border: `1px solid ${hrNow > 0 ? T.grn + "33" : T.red + "33"}`,
            background: hrNow > 0 ? T.grnd : T.redd, flexShrink: 0,
          }}>
            <LiveDot on={hrNow > 0} />
            <span style={{ fontFamily: T.display, fontSize: 15, fontWeight: 600, color: hrNow > 0 ? T.grn : T.red }}>
              {np.loading ? "..." : hrNow > 0 ? fmt.hash(hrNow, units.hashrate) : "offline"}
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 7, color: T.t4, letterSpacing: 2 }}>LIVE</span>
          </div>

          {/* Unit toggle */}
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

          {/* Last update */}
          {np.lastUpdate && !mobile && (
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.t5, flexShrink: 0 }}>
              {np.lastUpdate.toLocaleTimeString()}
            </div>
          )}

          {/* Refresh ring */}
          <RefreshRing intervalMs={T.refresh.nanopool} />

          {/* Manual refresh */}
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
        <div style={{ padding: `0 ${PAD}px`, display: "flex", gap: 0, overflowX: "auto" }}>
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
          {tab === "overview" && <TabOverview np={np} prices={prices} net={net} mobile={mobile} />}
          {tab === "pools" && <TabPools np={np} poolStats={poolStats} mobile={mobile} />}
          {tab === "earnings" && <TabEarnings np={np} prices={prices} mobile={mobile} />}
          {tab === "workers" && <TabWorkers np={np} mobile={mobile} />}
          {tab === "network" && <TabNetwork np={np} net={net} prices={prices} mobile={mobile} />}
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
          <span style={{ color: T.t4 }}>miner</span> V2 /
          <span style={{ color: T.xmr }}> xmrboi</span> / Nanopool / RandomX
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
