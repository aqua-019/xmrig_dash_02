import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { T } from "./tokens.jsx";

/* ═══════════════════════════════════════════════════════════════
   XMRminer V3 — Pool Adapters + Data Hooks
   LIVE data: Nanopool (xmrboi) + PrivacyGateway + CoinGecko + xmrchain.net
   Tiered refresh: 30s pool / 60s community / 120s prices / 60s network
═══════════════════════════════════════════════════════════════ */

const ADDR = "46Xpikm4555LvUD4EjSXN1B6WWd8QxWJdFqJG9ghipmF8186YMdZ7UmfQAT84ZBovNc7Sg8HWuBSvhtrJ4yQxZARSoP1Bnp";
const NANOPOOL = "https://api.nanopool.org/v1/xmr";
const GECKO = "https://api.coingecko.com/api/v3";

/* ── Pool Adapter Interface ─────────────────────────── */

const NanopoolAdapter = {
  id: "nanopool",
  name: "Nanopool",
  featured: false,
  available: true,
  config: {
    fee: 1, scheme: "PPLNS", minPayout: 0.11, ssl: true,
    stratum: "xmr-eu1.nanopool.org",
    ports: [
      { port: 14433, difficulty: "auto", description: "SSL", tls: true },
      { port: 14444, difficulty: "auto", description: "Standard", tls: false },
    ],
    tagline: "Large established pool with global servers",
    website: "https://xmr.nanopool.org",
  },
  async fetchUserData(address) {
    const [user, earnings, chart, payments] = await Promise.all([
      fetch(`${NANOPOOL}/user/${address}`).then(r => r.json()),
      fetch(`${NANOPOOL}/approximated_earnings/3500`).then(r => r.json()),
      fetch(`${NANOPOOL}/hashratechart/${address}`).then(r => r.json()),
      fetch(`${NANOPOOL}/payments/${address}`).then(r => r.json()),
    ]);
    if (!user.status) throw new Error("Nanopool: " + (user.data || "API error"));
    const u = user.data;
    return {
      hashrate: parseFloat(u.hashrate || 0),
      avgHashrates: {
        h1:  parseFloat(u.avgHashrate?.h1 || 0),
        h3:  parseFloat(u.avgHashrate?.h3 || 0),
        h6:  parseFloat(u.avgHashrate?.h6 || 0),
        h12: parseFloat(u.avgHashrate?.h12 || 0),
        h24: parseFloat(u.avgHashrate?.h24 || 0),
      },
      balance: parseFloat(u.balance || 0),
      unconfirmedBalance: parseFloat(u.unconfirmed_balance || 0),
      workers: (u.workers || []).map(w => ({
        id: w.id,
        uid: w.uid,
        hashrate: parseFloat(w.hashrate || 0),
        lastShare: w.lastshare,
        rating: w.rating || 0,
        h1: parseFloat(w.h1 || 0),
        h3: parseFloat(w.h3 || 0),
        h6: parseFloat(w.h6 || 0),
        h12: parseFloat(w.h12 || 0),
        h24: parseFloat(w.h24 || 0),
      })),
      payments: (payments.data || []).map(p => ({
        amount: parseFloat(p.amount || 0),
        txHash: p.txHash || "",
        date: p.date || 0,
        confirmed: p.confirmed,
      })),
      earnings: earnings.data || null,
      chart: (chart.data || []).slice().reverse(),
    };
  },
  async fetchPoolStats() {
    try {
      const r = await fetch(`${NANOPOOL}/pool/hashrate`).then(r => r.json());
      const a = await fetch(`${NANOPOOL}/pool/activeminers`).then(r => r.json());
      return {
        poolHashrate: r.data || 0,
        miners: a.data || 0,
        fee: 1, minPayout: 0.11, paymentScheme: "PPLNS",
      };
    } catch { return null; }
  },
  generateXmrigConfig(address, port = 14433) {
    const p = this.config.ports.find(pp => pp.port === port) || this.config.ports[0];
    return {
      autosave: true, cpu: true, opencl: false, cuda: false,
      pools: [{ url: `${this.config.stratum}:${port}`, user: address, pass: "x", "rig-id": null, nicehash: false, keepalive: true, enabled: true, tls: p.tls, "tls-fingerprint": null, daemon: false, "socks5": null, "self-select": null }],
    };
  },
  getConnectCommand(address, port = 14433) {
    const p = this.config.ports.find(pp => pp.port === port) || this.config.ports[0];
    return `./xmrig -o ${p.tls ? "stratum+ssl" : "stratum+tcp"}://${this.config.stratum}:${port} -u ${address} -p x`;
  },
};

/* ── PrivacyGateway Adapter (LIVE) ─────────────────── */

const PGBASE = "https://api.pool.xmr.privacygateway.io";

const PrivacyGatewayAdapter = {
  id: "privacygateway",
  name: "PrivacyGateway.io",
  featured: false,
  available: true,
  liveStats: null,
  config: {
    fee: 0.5, scheme: "PPLNS", minPayout: 0.01, ssl: true,
    stratum: "pool.xmr.privacygateway.io",
    ports: [
      { port: 3333, difficulty: "low", description: "Low difficulty", tls: false },
      { port: 5555, difficulty: "mid", description: "Medium difficulty", tls: false },
      { port: 7777, difficulty: "high", description: "High difficulty", tls: false },
      { port: 9000, difficulty: "auto", description: "SSL", tls: true },
    ],
    tagline: "Not for profit, but for privacy.",
    description: "Independent community pool. Zero-log, no tracking, no registration.",
    website: "https://pool.xmr.privacygateway.io",
  },
  async fetchPoolStats() {
    try {
      const r = await fetch(`${PGBASE}/pool/stats`).then(r => r.json());
      const stats = r.pool_statistics || {};
      this.liveStats = stats;
      return {
        poolHashrate: stats.hashRate || 0,
        miners: stats.miners || stats.minerCount || 0,
        workers: stats.workers || 0,
        totalHashes: stats.totalHashes || 0,
        lastBlockFoundTime: stats.lastBlockFoundTime || null,
        fee: 0.5, minPayout: 0.01, paymentScheme: "PPLNS",
      };
    } catch { return null; }
  },
  async fetchUserData(address) {
    try {
      const r = await fetch(`${PGBASE}/miner/${address}/stats`).then(r => r.json());
      if (!r || r.error) return null;
      return {
        hashrate: r.hash || 0,
        balance: (r.amtDue || 0) / 1e12,
        paid: (r.amtPaid || 0) / 1e12,
        totalHashes: r.totalHashes || 0,
      };
    } catch { return null; }
  },
  generateXmrigConfig(address, port = 3333) {
    const p = this.config.ports.find(pp => pp.port === port) || this.config.ports[0];
    return {
      autosave: true, cpu: true, opencl: false, cuda: false,
      pools: [{ url: `${this.config.stratum}:${port}`, user: address, pass: "x", "rig-id": null, nicehash: false, keepalive: true, enabled: true, tls: p.tls, "tls-fingerprint": null, daemon: false, "socks5": null, "self-select": null }],
    };
  },
  getConnectCommand(address, port = 3333) {
    const p = this.config.ports.find(pp => pp.port === port) || this.config.ports[0];
    return `./xmrig -o ${p.tls ? "stratum+ssl" : "stratum+tcp"}://${this.config.stratum}:${port} -u ${address} -p x`;
  },
};

/* ── Placeholder adapters for pending pools ──────────── */

const PendingAdapter = (id, name, config) => ({
  id, name, featured: false, available: false, config,
  async fetchUserData() { return null; },
  async fetchPoolStats() { return null; },
  generateXmrigConfig(address, port) {
    const p = (config.ports || []).find(pp => (typeof pp === "object" ? pp.port : pp) === port) || config.ports?.[0] || {};
    const pPort = typeof p === "object" ? p.port : p;
    const tls = typeof p === "object" ? p.tls : false;
    return {
      autosave: true, cpu: true, opencl: false, cuda: false,
      pools: [{ url: `${config.stratum}:${pPort || port || 3333}`, user: address, pass: "x", tls, keepalive: true, enabled: true }],
    };
  },
  getConnectCommand(address, port) {
    const p = (config.ports || []).find(pp => (typeof pp === "object" ? pp.port : pp) === port) || config.ports?.[0] || {};
    const pPort = typeof p === "object" ? p.port : (p || port || 3333);
    const tls = typeof p === "object" ? p.tls : false;
    return `./xmrig -o ${tls ? "stratum+ssl" : "stratum+tcp"}://${config.stratum}:${pPort} -u ${address} -p x`;
  },
});

const P2PoolMiniAdapter = PendingAdapter("p2pool-mini", "P2Pool Mini", {
  fee: 0, scheme: "PPLNS (p2p)", minPayout: 0.0004, ssl: false,
  stratum: "localhost",
  ports: [{ port: 3333, difficulty: "auto", description: "Local sidechain", tls: false }],
  tagline: "Decentralized, no admin, no custody. Mini sidechain for <100 KH/s.",
  description: "Run your own P2Pool mini node. No central server. Direct payouts.",
  website: "https://p2pool.io",
});

const P2PoolMainAdapter = PendingAdapter("p2pool-main", "P2Pool Main", {
  fee: 0, scheme: "PPLNS (p2p)", minPayout: 0.0004, ssl: false,
  stratum: "localhost",
  ports: [{ port: 3333, difficulty: "auto", description: "Local main chain", tls: false }],
  tagline: "Decentralized mining. Main sidechain for high hashrate miners.",
  description: "Full P2Pool node. Higher difficulty. For miners >100 KH/s.",
  website: "https://p2pool.io",
});

const MoneroOceanAdapter = PendingAdapter("moneroocean", "MoneroOcean", {
  fee: 0, scheme: "PPLNS", minPayout: 0.003, ssl: true,
  stratum: "gulf.moneroocean.stream",
  ports: [
    { port: 10128, difficulty: "auto", description: "Standard", tls: false },
    { port: 20128, difficulty: "auto", description: "SSL", tls: true },
  ],
  tagline: "Algo-switching for maximum profit",
  description: "Automatically switches between profitable RandomX coins. Zero fee.",
  website: "https://moneroocean.stream",
});

const HashVaultAdapter = PendingAdapter("hashvault", "HashVault", {
  fee: 0.9, scheme: "PPLNS/SOLO", minPayout: 0.07, ssl: true,
  stratum: "pool.hashvault.pro",
  ports: [
    { port: 80, difficulty: "auto", description: "Web-friendly", tls: false },
    { port: 443, difficulty: "auto", description: "HTTPS port", tls: true },
    { port: 3333, difficulty: "low", description: "Standard", tls: false },
    { port: 9000, difficulty: "auto", description: "SSL", tls: true },
  ],
  tagline: "Data-rich, global servers, predictable rewards",
  description: "PPLNS and SOLO modes. Multiple global servers. Detailed worker stats.",
  website: "https://monero.hashvault.pro",
});

const XMRPoolEuAdapter = PendingAdapter("xmrpool-eu", "XMRPool.eu", {
  fee: 0.5, scheme: "PPLNS", minPayout: 0.01, ssl: true,
  stratum: "xmrpool.eu",
  ports: [
    { port: 3333, difficulty: "low", description: "Low difficulty", tls: false },
    { port: 5555, difficulty: "mid", description: "Medium", tls: false },
    { port: 9999, difficulty: "auto", description: "SSL", tls: true },
  ],
  tagline: "European community pool with low fees",
  website: "https://web.xmrpool.eu",
});

const SupportXMRAdapter = PendingAdapter("supportxmr", "SupportXMR", {
  fee: 0.6, scheme: "PPLNS", minPayout: 0.01, ssl: true,
  stratum: "pool.supportxmr.com",
  ports: [
    { port: 3333, difficulty: "low", description: "Low difficulty", tls: false },
    { port: 5555, difficulty: "mid", description: "Medium", tls: false },
    { port: 7777, difficulty: "high", description: "High", tls: false },
    { port: 9000, difficulty: "auto", description: "SSL", tls: true },
  ],
  tagline: "Reliable pool with transparent stats",
  website: "https://supportxmr.com",
});

export const POOL_ADAPTERS = [
  NanopoolAdapter,
  PrivacyGatewayAdapter,
  P2PoolMiniAdapter,
  P2PoolMainAdapter,
  MoneroOceanAdapter,
  HashVaultAdapter,
  XMRPoolEuAdapter,
  SupportXMRAdapter,
];

/* ── Unit Context ────────────────────────────────────── */

const defaultUnits = { hashrate: "auto", currency: "usd" };

const UnitContext = createContext({
  units: defaultUnits,
  setUnit: () => {},
});

export function UnitProvider({ children }) {
  const [units, setUnits] = useState(() => {
    try { return JSON.parse(localStorage.getItem("xmrminer:units")) || defaultUnits; }
    catch { return defaultUnits; }
  });
  const setUnit = useCallback((key, val) => {
    setUnits(prev => {
      const next = { ...prev, [key]: val };
      localStorage.setItem("xmrminer:units", JSON.stringify(next));
      return next;
    });
  }, []);
  return <UnitContext.Provider value={{ units, setUnit }}>{children}</UnitContext.Provider>;
}

export function useUnits() { return useContext(UnitContext); }

/* ── Nanopool Hook (LIVE) ────────────────────────────── */

export function useNanopool() {
  const [state, setState] = useState({
    data: null, err: null, loading: true, lastUpdate: null
  });

  const load = useCallback(async () => {
    try {
      const data = await NanopoolAdapter.fetchUserData(ADDR);
      setState({ data, err: null, loading: false, lastUpdate: new Date() });
    } catch (e) {
      setState(s => ({ ...s, err: e.message, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, T.refresh.nanopool);
    return () => clearInterval(id);
  }, [load]);

  return { ...state, reload: load, address: ADDR, adapter: NanopoolAdapter };
}

/* ── Pool Stats Hook ─────────────────────────────────── */

export function usePoolStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const load = async () => {
      const s = await NanopoolAdapter.fetchPoolStats();
      if (s) setStats(s);
    };
    load();
    const id = setInterval(load, T.refresh.nanopool);
    return () => clearInterval(id);
  }, []);
  return stats;
}

/* ── PrivacyGateway Pool Stats Hook (LIVE) ───────────── */

export function usePrivacyGatewayStats() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const load = async () => {
      const s = await PrivacyGatewayAdapter.fetchPoolStats();
      if (s) setStats(s);
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);
  return stats;
}

/* ── Price Hook (LIVE) ───────────────────────────────── */

export function usePrices() {
  const [p, setP] = useState(null);
  const load = useCallback(async () => {
    try {
      const [spot, hist] = await Promise.all([
        fetch(`${GECKO}/simple/price?ids=monero,bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`).then(r => r.json()),
        fetch(`${GECKO}/coins/monero/market_chart?vs_currency=usd&days=7&interval=hourly`).then(r => r.json()),
      ]);
      setP({
        xmrUsd:    spot.monero?.usd || 0,
        xmrChg24h: spot.monero?.usd_24h_change || 0,
        xmrMcap:   spot.monero?.usd_market_cap || 0,
        xmrVol:    spot.monero?.usd_24h_vol || 0,
        btcUsd:    spot.bitcoin?.usd || 0,
        btcChg24h: spot.bitcoin?.usd_24h_change || 0,
        btcXmrRatio: (spot.bitcoin?.usd || 1) / (spot.monero?.usd || 1),
        priceHistory: (hist.prices || []).map(([ts, v]) => ({ ts, v })),
      });
    } catch (_) {}
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, T.refresh.gecko);
    return () => clearInterval(id);
  }, [load]);
  return p;
}

/* ── Network Hook (LIVE) ─────────────────────────────── */

export function useNetwork() {
  const [net, setNet] = useState(null);
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("https://xmrchain.net/api/networkinfo").then(r => r.json());
        setNet({
          height:     r.data?.height || 0,
          difficulty:  r.data?.difficulty || 0,
          hashrate:    r.data?.hash_rate || 0,
          reward:      (r.data?.base_reward || 0) / 1e12,
          fee:         (r.data?.fee_per_kb || 0) / 1e9,
        });
      } catch (_) {}
    };
    load();
    const id = setInterval(load, T.refresh.network);
    return () => clearInterval(id);
  }, []);
  return net;
}

/* ── Monero RPC Hook (enhanced network data) ─────────── */

export function useMoneroRPC() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const load = async () => {
      // Try multiple RPC nodes, fall back gracefully
      const nodes = [
        "https://node.monerodevs.org:18089",
        "https://xmr-node.cakewallet.com:18081",
      ];
      for (const node of nodes) {
        try {
          const [info, blockHeader] = await Promise.all([
            fetch(`${node}/json_rpc`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jsonrpc: "2.0", id: "0", method: "get_info" }),
            }).then(r => r.json()),
            fetch(`${node}/json_rpc`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jsonrpc: "2.0", id: "0", method: "get_last_block_header" }),
            }).then(r => r.json()),
          ]);
          const i = info.result || {};
          const bh = blockHeader.result?.block_header || {};
          setData({
            height: i.height || 0,
            txPoolSize: i.tx_pool_size || 0,
            incomingConnections: i.incoming_connections_count || 0,
            outgoingConnections: i.outgoing_connections_count || 0,
            databaseSize: i.database_size || 0,
            blockWeightLimit: i.block_weight_limit || 0,
            lastBlock: {
              height: bh.height || 0,
              reward: bh.reward || 0,
              numTxes: bh.num_txes || 0,
              difficulty: bh.difficulty || 0,
              hash: bh.hash || "",
              timestamp: bh.timestamp || 0,
            },
          });
          return; // success, stop trying nodes
        } catch (_) {
          continue;
        }
      }
      // All nodes failed, keep null
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);
  return data;
}

/* ── Refresh Timer Hook ──────────────────────────────── */

export function useRefreshTimer(intervalMs = 30000) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const start = Date.now();
    ref.current = setInterval(() => {
      const e = Date.now() - start;
      setElapsed(e % intervalMs);
    }, 200);
    return () => clearInterval(ref.current);
  }, [intervalMs]);

  return {
    progress: elapsed / intervalMs,
    remaining: Math.ceil((intervalMs - elapsed) / 1000),
    intervalMs,
  };
}

/* ── Intersection Observer for reveal animations ─────── */

export function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ── Window size ─────────────────────────────────────── */

export function useMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < breakpoint
  );
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [breakpoint]);
  return mobile;
}

export { ADDR };
