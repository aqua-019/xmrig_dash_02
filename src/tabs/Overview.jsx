import { useState } from "react";
import { T, Icon, fmt } from "../tokens.jsx";
import { useUnits, ADDR } from "../hooks.jsx";
import {
  Card, StatCard, SectionHead, MiniBar, ZoomPills, UnitToggle,
  StaggerGrid, HashChart, DataRow,
} from "../components.jsx";

/* ══════════════ TAB: OVERVIEW ════════════════════════ */

export default function TabOverview({ np, prices, net, poolStats, mobile, onNavigate, LoadingState }) {
  const { units } = useUnits();
  const [zoom, setZoom] = useState(12);
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Hero stats */}
      <StaggerGrid cols={4} mobile={mobile} heroCards>
        <StatCard label="Live hashrate" value={hrNow ? h(hrNow) : "offline"}
          sub={`1h avg: ${h(u.avgHashrates.h1)}`} sub2={`24h avg: ${h(u.avgHashrates.h24)}`}
          color={hrNow > 0 ? T.xmr : T.red} glow={hrNow > 0 ? T.xmr : T.red} icon="bolt"
          badge={hrNow > 0 ? { text: "MINING", color: T.grn } : { text: "OFFLINE", color: T.red }} />
        <StatCard label="Confirmed balance" value={fmt.xmr(bal) + " XMR"}
          sub={xmrUsd ? fmt.usd(bal * xmrUsd) : "\u2014"} sub2={`${pctPayout.toFixed(1)}% to payout`}
          color={T.grn} glow={T.grn} icon="coin" />
        <StatCard label="Unconfirmed" value={fmt.xmr(unconf) + " XMR"}
          sub={xmrUsd ? fmt.usd(unconf * xmrUsd) : "\u2014"} sub2="Awaiting confirmation"
          color={T.gold} glow={T.gold} icon="clock" />
        <StatCard label="XMR / USD" value={xmrUsd ? fmt.usd(xmrUsd) : "\u2014"}
          sub={prices ? fmt.pct(prices.xmrChg24h) + " 24h" : "\u2014"}
          sub2={prices ? `MCap ${fmt.usd(prices.xmrMcap / 1e9, 0)}B` : "\u2014"}
          color={prices?.xmrChg24h >= 0 ? T.grn : T.red} glow={T.blue} icon="trend"
          trend={prices?.xmrChg24h} />
      </StaggerGrid>

      {/* Secondary metrics row */}
      <StaggerGrid cols={4} mobile={mobile}>
        <StatCard label="Pool hashrate" value={poolStats ? fmt.hash(poolStats.poolHashrate) : "\u2014"}
          sub="Nanopool global" color={T.xmr} glow={T.xmr} />
        <StatCard label="Active miners" value={poolStats ? poolStats.miners?.toLocaleString() : "\u2014"}
          sub="Nanopool pool" color={T.t1} />
        <StatCard label="Your pool share"
          value={poolStats?.poolHashrate ? (hrNow / poolStats.poolHashrate * 100).toFixed(4) + "%" : "\u2014"}
          sub={`at ${h(hrNow)}`} color={T.blue} />
        <StatCard label="Network difficulty" value={net ? fmt.diff(net.difficulty) : "\u2014"}
          sub={net ? `Height ${net.height.toLocaleString()}` : "\u2014"} color={T.t1} />
      </StaggerGrid>

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
          <span style={{ fontFamily: T.display, fontSize: 24, fontWeight: 700, color: bal >= 0.11 ? T.grn : T.xmr, minWidth: 56, textAlign: "right" }}>
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
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.t3, letterSpacing: 2.5, marginBottom: 4 }}>{l.toUpperCase()}</div>
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
            <span style={{ width: 14, height: 1.5, background: T.xmr, display: "inline-block", borderRadius: 1 }} />Shares / 10 min
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 1, background: T.t3, display: "inline-block", borderRadius: 1, opacity: 0.5, borderBottom: `1px dotted ${T.t3}` }} />2h SMA
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

      {/* Pool navigation banner */}
      <Card glow={T.xmr} pad="16px 20px" className="outline-reveal" style={{ border: `1px solid ${T.xmr}22`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: T.xmr, opacity: 0.04, filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontFamily: T.serif, fontSize: 16, fontStyle: "italic", color: T.t1 }}>Explore mining pools</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.t3, marginTop: 3 }}>Compare fees, payouts, and connect to your preferred pool</div>
          </div>
          <div onClick={() => onNavigate && onNavigate("pools")} className="btn-sweep press-compress" style={{
            padding: "8px 18px", borderRadius: T.r.sm, border: `1px solid ${T.xmr}`,
            background: T.xmrd, color: T.xmr, fontFamily: T.mono, fontSize: 11,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.15s",
          }}>
            View pools <Icon name="ext" size={10} />
          </div>
        </div>
      </Card>
    </div>
  );
}
