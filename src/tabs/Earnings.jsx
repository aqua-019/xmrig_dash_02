import { T, fmt } from "../tokens.jsx";
import { useUnits } from "../hooks.jsx";
import {
  Card, StatCard, SectionHead, UnitToggle,
  StaggerGrid, SparkLine,
} from "../components.jsx";

/* ══════════════ TAB: EARNINGS ════════════════════════ */

export default function TabEarnings({ np, prices, mobile, LoadingState }) {
  const { units } = useUnits();
  const u = np.data;
  const e = u?.earnings;
  if (!e) return <LoadingState />;

  const xmrUsd = prices?.xmrUsd || 0;
  const bal = u.balance;
  const earnDay = e.day?.coins || 0;
  const daysLeft = earnDay > 0 ? Math.max(0, (0.11 - bal) / earnDay).toFixed(1) : "\u2014";
  const h = (v) => fmt.hash(v, units.hashrate);
  const payments = u.payments || [];

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
          .map(([lbl, d], idx) => d && (
            <div key={lbl} style={{
              display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr", gap: 8,
              padding: "10px 16px", borderBottom: `1px solid ${T.s3}`, fontFamily: T.mono, fontSize: 12,
              background: lbl === "Day" ? T.xmrdd : idx % 2 === 0 ? "transparent" : T.s1,
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
            display: "grid", gridTemplateColumns: mobile ? "100px 1fr 1fr" : "100px 60px 1fr 1fr 1fr 1fr", gap: 8,
            fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 2, textTransform: "uppercase",
          }}>
            <span>Hashrate</span>
            {!mobile && <span>Rel.</span>}
            <span>Day XMR</span><span>Month USD</span>
            {!mobile && <><span>Year USD</span><span>Days to payout</span></>}
          </div>
          {[500, 1000, 2000, 3000, 3500, 5000, 7500, 10000, 15000].map(hr => {
            const d = earnDay * (hr / 3500);
            const mo = d * 30 * xmrUsd;
            const yr = d * 365 * xmrUsd;
            const dp = d > 0 ? Math.max(0, (0.11 - bal) / d).toFixed(0) : "\u2014";
            const isMe = Math.abs(hr - u.hashrate) < 400;
            const relPct = Math.min(100, (hr / 15000) * 100);
            return (
              <div key={hr} style={{
                display: "grid", gridTemplateColumns: mobile ? "100px 1fr 1fr" : "100px 60px 1fr 1fr 1fr 1fr", gap: 8,
                padding: "9px 14px", borderBottom: `1px solid ${T.s3}`, fontFamily: T.mono, fontSize: 12,
                background: isMe ? T.xmrdd : "transparent",
                borderLeft: isMe ? `3px solid ${T.xmr}` : "3px solid transparent",
              }}>
                <span style={{ color: isMe ? T.xmr : T.t3 }}>{h(hr)}{isMe ? " \u2190" : ""}</span>
                {!mobile && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: 44, height: 6, borderRadius: 3, background: T.s3, overflow: "hidden" }}>
                      <div style={{ width: `${relPct}%`, height: "100%", borderRadius: 3, background: isMe ? T.xmr : T.t5, transition: "width 0.5s" }} />
                    </div>
                  </div>
                )}
                <span style={{ color: T.t2 }}>{d.toFixed(8)}</span>
                <span style={{ color: T.t1 }}>{xmrUsd ? fmt.usd(mo) : "\u2014"}</span>
                {!mobile && <><span style={{ color: T.grn }}>{xmrUsd ? fmt.usd(yr) : "\u2014"}</span><span style={{ color: T.t3 }}>{dp}d</span></>}
              </div>
            );
          })}
        </Card>
      </Card>

      {/* Price scenarios — show all 10 */}
      <Card pad="20px 22px" glow={T.gold}>
        <SectionHead serif label="What if XMR moons?" sub="Monthly earnings at different prices" />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(5,1fr)", gap: 8 }}>
          {[100, 200, 350, 500, 1000, 1500, 2000, 3000, 5000, 10000]
            .filter((_, i) => mobile ? i < 6 : true)
            .map(p => {
              const isCurr = xmrUsd && Math.abs(p - xmrUsd) < 50;
              return (
                <div key={p} style={{
                  background: isCurr ? T.goldd : T.s2, borderRadius: T.r.md, padding: "12px 14px",
                  border: `1px solid ${isCurr ? T.gold + "44" : T.s3}`, textAlign: "center",
                }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.t4, marginBottom: 4 }}>{fmt.usd(p, 0)}</div>
                  <div style={{ fontFamily: T.display, fontSize: 16, fontWeight: 700, color: p >= (xmrUsd || 999999) ? T.grn : T.t2 }}>
                    {fmt.usd(earnDay * 30 * p)}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.t4, marginTop: 2 }}>{isCurr ? "current" : "mo."}</div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Earnings history (payments) */}
      {payments.length > 0 && (
        <Card pad="20px 22px" glow={T.grn}>
          <SectionHead serif label="Earnings history" sub={`${payments.length} payments received`} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 80 }}>
            {payments.slice(0, 30).map((pay, i) => {
              const maxAmt = Math.max(...payments.slice(0, 30).map(p => p.amount), 0.001);
              const h = Math.max(4, (pay.amount / maxAmt) * 72);
              return (
                <div key={i} style={{
                  flex: 1, height: h, borderRadius: "2px 2px 0 0",
                  background: `linear-gradient(to top, ${T.t5}, ${T.grn})`,
                  opacity: 0.8, minWidth: 3,
                }} title={`${fmt.xmr(pay.amount)} XMR`} />
              );
            })}
          </div>
          {payments.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: T.mono, fontSize: 9, color: T.t4 }}>
              <span>Oldest</span><span>Most recent</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
