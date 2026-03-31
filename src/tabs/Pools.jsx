import { useState } from "react";
import { T, Icon, fmt } from "../tokens.jsx";
import { POOL_ADAPTERS } from "../hooks.jsx";
import {
  Card, SectionHead, DataRow, DataPending, CopyButton,
  StaggerGrid, DetailPanel,
} from "../components.jsx";

/* ══════════════ TAB: POOLS ═══════════════════════════ */

function PoolConnectPanel({ pool, onClose }) {
  const [walletAddr, setWalletAddr] = useState("YOUR_MONERO_WALLET_ADDRESS");
  const [selectedPort, setSelectedPort] = useState(
    pool.config.ports?.[0]?.port || pool.config.ports?.[0] || 3333
  );

  const ports = (pool.config.ports || []).map(p =>
    typeof p === "number" ? { port: p, difficulty: "auto", description: "", tls: false } : p
  );
  const port = ports.find(p => p.port === selectedPort) || ports[0] || {};
  const isTls = port.tls || (selectedPort === 9000 || selectedPort === 443 || selectedPort === 14433 || selectedPort === 20128);
  const stratum = pool.config.stratum || "pool.example.com";

  const xmrigConfig = JSON.stringify({
    autosave: true,
    cpu: true,
    opencl: false,
    cuda: false,
    pools: [{
      url: `${stratum}:${selectedPort}`,
      user: walletAddr,
      pass: "x",
      "rig-id": null,
      nicehash: false,
      keepalive: true,
      enabled: true,
      tls: isTls,
      "tls-fingerprint": null,
      daemon: false,
      "socks5": null,
      "self-select": null,
    }],
  }, null, 2);

  const connectCmd = `./xmrig -o ${isTls ? "stratum+ssl" : "stratum+tcp"}://${stratum}:${selectedPort} -u ${walletAddr} -p x`;

  return (
    <DetailPanel title={`Connect to ${pool.name}`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Pool info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            ["Fee", `${pool.config.fee}% ${pool.config.scheme}`],
            ["Min payout", `${pool.config.minPayout} XMR`],
            ["SSL", pool.config.ssl ? "Available" : "N/A"],
            ["Stratum", stratum],
          ].map(([k, v]) => (
            <div key={k} style={{ background: T.s2, borderRadius: T.r.sm, padding: "8px 10px" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, marginBottom: 2 }}>{k.toUpperCase()}</div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.t2 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Port selection */}
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2.5, color: T.t3, marginBottom: 8 }}>SELECT PORT</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ports.map(p => (
              <button key={p.port} onClick={() => setSelectedPort(p.port)} style={{
                fontFamily: T.mono, fontSize: 11, padding: "6px 14px", borderRadius: T.r.sm,
                border: `1px solid ${selectedPort === p.port ? T.xmr : T.s4}`,
                background: selectedPort === p.port ? T.xmrd : "transparent",
                color: selectedPort === p.port ? T.xmr : T.t3,
                cursor: "pointer", transition: "all 0.15s",
              }}>
                {p.port}{p.tls ? " (SSL)" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Wallet input */}
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2.5, color: T.t3, marginBottom: 6 }}>WALLET ADDRESS</div>
          <input
            type="text" value={walletAddr}
            onChange={e => setWalletAddr(e.target.value)}
            style={{
              width: "100%", fontFamily: T.mono, fontSize: 10, padding: "8px 12px",
              borderRadius: T.r.sm, border: `1px solid ${T.s4}`, background: T.s2,
              color: T.t1, outline: "none",
            }}
            onFocus={e => { if (e.target.value === "YOUR_MONERO_WALLET_ADDRESS") e.target.select(); }}
          />
        </div>

        {/* Command line */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2.5, color: T.t3 }}>COMMAND LINE</span>
            <CopyButton text={connectCmd} />
          </div>
          <div style={{
            fontFamily: T.mono, fontSize: 10, padding: "10px 14px", borderRadius: T.r.sm,
            background: T.s1, border: `1px solid ${T.s3}`, color: T.xmr,
            wordBreak: "break-all", lineHeight: 1.7,
          }}>{connectCmd}</div>
        </div>

        {/* xmrig config */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2.5, color: T.t3 }}>XMRIG CONFIG.JSON</span>
            <CopyButton text={xmrigConfig} />
          </div>
          <pre style={{
            fontFamily: T.mono, fontSize: 9.5, padding: "12px 14px", borderRadius: T.r.sm,
            background: T.s1, border: `1px solid ${T.s3}`, color: T.t2,
            overflow: "auto", maxHeight: 240, lineHeight: 1.6, margin: 0,
          }}>{xmrigConfig}</pre>
        </div>

        {/* Pool notes */}
        {pool.config.tagline && (
          <div style={{
            padding: "10px 14px", borderRadius: T.r.sm, background: T.xmrdd,
            border: `1px solid ${T.xmr}22`, fontFamily: T.mono, fontSize: 10, color: T.t3,
          }}>
            {pool.config.tagline}
            {pool.config.description && <div style={{ marginTop: 4, color: T.t4 }}>{pool.config.description}</div>}
          </div>
        )}
      </div>
    </DetailPanel>
  );
}

export default function TabPools({ np, poolStats, mobile }) {
  const [connectPool, setConnectPool] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Pool grid — all pools equal */}
      <StaggerGrid cols={3} mobile={mobile}>
        {POOL_ADAPTERS.map(adapter => {
          const active = adapter.id === "nanopool";
          return (
            <Card key={adapter.id} glow={active ? T.grn : T.xmr} pad="16px"
              style={active ? { borderColor: T.grn + "44" } : {}}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700 }}>
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
              {adapter.id === "privacygateway" && adapter.liveStats && <>
                <DataRow label="Pool hashrate" value={fmt.hash(adapter.liveStats.hashRate)} valueColor={T.xmr} />
                <DataRow label="Miners" value={adapter.liveStats.miners?.toString() || "\u2014"} valueColor={T.t2} />
              </>}
              {!active && !adapter.available && adapter.id !== "privacygateway" && (
                <DataPending label="Data en route" h={36} />
              )}
              <div
                onClick={() => setConnectPool(adapter)}
                className="btn-sweep press-compress"
                style={{
                  marginTop: 12, padding: "7px 0", textAlign: "center", borderRadius: T.r.sm, fontSize: 10,
                  fontFamily: T.mono, letterSpacing: 1, cursor: "pointer",
                  border: `1px solid ${active ? T.grn + "44" : T.s4}`,
                  color: active ? T.grn : T.t3,
                  background: active ? T.grnd : "transparent",
                  transition: "all 0.15s",
                }}>
                {active ? "ACTIVE / CONNECT" : "CONNECT"}
              </div>
            </Card>
          );
        })}
      </StaggerGrid>

      {/* Comparison matrix */}
      <Card pad="0" style={{ overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: `100px repeat(${POOL_ADAPTERS.length},1fr)`, gap: 8,
          padding: "10px 16px", background: T.s2, borderBottom: `1px solid ${T.s3}`,
          fontFamily: T.mono, fontSize: 8, color: T.t4, letterSpacing: 1.5, textTransform: "uppercase",
        }}>
          <span>Metric</span>
          {POOL_ADAPTERS.map(a => (
            <span key={a.id} style={{ color: a.id === "nanopool" ? T.xmr : T.t4 }}>{a.name.split(" ")[0]}</span>
          ))}
        </div>
        {[
          { label: "Fee", vals: POOL_ADAPTERS.map(a => ({ v: `${a.config.fee}%`, c: a.config.fee === 0 ? T.grn : T.t2 })) },
          { label: "Min payout", vals: POOL_ADAPTERS.map(a => ({ v: `${a.config.minPayout}`, c: a.config.minPayout <= 0.01 ? T.grn : T.t2 })) },
          { label: "Scheme", vals: POOL_ADAPTERS.map(a => ({ v: a.config.scheme, c: T.t2 })) },
          { label: "SSL", vals: POOL_ADAPTERS.map(a => ({ v: a.config.ssl ? "Yes" : "N/A", c: a.config.ssl ? T.grn : T.t4 })) },
        ].map((row, ri) => (
          <div key={row.label} style={{
            display: "grid", gridTemplateColumns: `100px repeat(${POOL_ADAPTERS.length},1fr)`, gap: 8,
            padding: "8px 16px", borderBottom: `1px solid ${T.s3}`, fontFamily: T.mono, fontSize: 11,
            background: ri % 2 === 0 ? "transparent" : T.s1,
          }}>
            <span style={{ color: T.t4, fontSize: 10 }}>{row.label}</span>
            {row.vals.map((v, i) => <span key={i} style={{ color: v.c }}>{v.v}</span>)}
          </div>
        ))}
      </Card>

      {/* Connect panel */}
      {connectPool && <PoolConnectPanel pool={connectPool} onClose={() => setConnectPool(null)} />}
    </div>
  );
}
