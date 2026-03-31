import { useState } from "react";
import { T, Icon, fmt } from "../tokens.jsx";
import { useUnits, ADDR } from "../hooks.jsx";
import {
  Card, StatCard, SectionHead, DataRow, CopyButton, DataPending,
  StaggerGrid, HashrateSparkStrip, DetailPanel,
} from "../components.jsx";

/* ══════════════ TAB: WORKERS ═════════════════════════ */

function WorkerDetailPanel({ worker, onClose }) {
  const { units } = useUnits();
  const h = (v) => fmt.hash(v, units.hashrate);
  const online = worker.hashrate > 0;

  return (
    <DetailPanel title={`Worker: ${worker.id}`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            ["Status", online ? "Online" : "Offline", online ? T.grn : T.red],
            ["Live hashrate", h(worker.hashrate), T.xmr],
            ["1h avg", h(worker.h1), T.t2],
            ["3h avg", h(worker.h3), T.t2],
            ["6h avg", h(worker.h6), T.t2],
            ["12h avg", h(worker.h12), T.t2],
            ["24h avg", h(worker.h24), T.t2],
            ["Shares", (worker.rating || 0).toLocaleString(), T.gold],
            ["Last share", worker.lastShare ? fmt.time(worker.lastShare) : "\u2014", T.t3],
          ].map(([k, v, c]) => (
            <div key={k} style={{ background: T.s2, borderRadius: T.r.sm, padding: "8px 10px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 2 }}>{k.toUpperCase()}</div>
              <div style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 500, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </DetailPanel>
  );
}

export default function TabWorkers({ np, mobile, LoadingState }) {
  const { units } = useUnits();
  const [selectedWorker, setSelectedWorker] = useState(null);
  const u = np.data;
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

      {/* Worker cards */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2,1fr)", gap: 10 }}>
        {workers.map(w => {
          const online = w.hashrate > 0;
          const stale = !online && w.lastShare && (Date.now() / 1000 - w.lastShare) < 3600;
          const statusColor = online ? T.grn : stale ? T.gold : T.red;
          const statusLabel = online ? "Online" : stale ? "Stale" : "Offline";
          // Uptime estimate: continuous if last share was within 10 min intervals
          const uptimeStr = w.lastShare ? (() => {
            const secAgo = Math.floor(Date.now() / 1000) - w.lastShare;
            if (secAgo < 600) return "Active now";
            if (secAgo < 3600) return `${Math.floor(secAgo / 60)}m since last share`;
            return `${Math.floor(secAgo / 3600)}h since last share`;
          })() : "\u2014";

          return (
            <Card key={w.id} glow={statusColor} pad="16px" onClick={() => setSelectedWorker(w)}
              style={{ borderLeft: `3px solid ${statusColor}`, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700 }}>{w.id}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.t4 }}>
                    {uptimeStr}
                  </div>
                </div>
                <span style={{
                  fontFamily: T.mono, fontSize: 9, padding: "2px 8px", borderRadius: 4,
                  background: `${statusColor}22`, color: statusColor,
                }}>{statusLabel}</span>
              </div>
              {/* HashrateSparkStrip — simulated from available averages */}
              <HashrateSparkStrip hashrates={[w.h24, w.h12, w.h6, w.h3, w.h1, w.hashrate]} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 8 }}>
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
            </Card>
          );
        })}
      </div>

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
            background: i % 2 === 0 ? "transparent" : T.s1,
          }}>
            <span style={{ color: T.grn }}>{fmt.xmr(pay.amount)} XMR</span>
            {!mobile && <span style={{ color: T.t4, fontSize: 10, wordBreak: "break-all" }}>{pay.txHash || "\u2014"}</span>}
            {!mobile && <span style={{ color: T.t4 }}>{pay.date ? fmt.time(pay.date) : "\u2014"}</span>}
            <span style={{ color: T.t4, textAlign: "right" }}>{pay.confirmed ? "Confirmed" : "Pending"}</span>
          </div>
        ))}
      </Card>

      {/* Worker detail panel */}
      {selectedWorker && <WorkerDetailPanel worker={selectedWorker} onClose={() => setSelectedWorker(null)} />}
    </div>
  );
}
