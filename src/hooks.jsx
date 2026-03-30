import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { T } from "./tokens.jsx";

/* ═══════════════════════════════════════════════════════════════
   Pool Adapter Pattern + Data Hooks
   LIVE data: Nanopool (xmrboi) + CoinGecko + xmrchain.net
   Tiered refresh: 30s pool / 120s prices / 60s network
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
    stratum: "xmr-eu1.nanopool.org", ports: [14433,14444],
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
};

// Placeholder adapters for pools with pending API integration
const PendingAdapter = (id, name, config) => ({
  id, name, featured: id === "privacygateway", available: false, config,
  async fetchUserData() { return null; },
  async fetchPoolStats() { return null; },
});

const PrivacyGatewayAdapter = PendingAdapter("privacygateway", "PrivacyGateway.io", {
  fee: 0.5, scheme: "PPLNS", minPayout: 0.01, ssl: true,
  stratum: "pool.xmr.privacygateway.io",
  ports: [3333, 5555, 7777, 9000],
  tagline: "Not for profit, but for privacy.",
  description: "Independent community pool. Zero-log, no tracking, no registration. Swap services available.",
});

const P2PoolAdapter = PendingAdapter("p2pool", "P2Pool Mini", {
  fee: 0, scheme: "PPLNS (p2p)", minPayout: 0.0004, ssl: false,
  stratum: "localhost:3333", ports: [3333],
  tagline: "Decentralized, no admin, no custody",
  description: "No central server. All pool blocks pay out to miners directly.",
});

const MoneroOceanAdapter = PendingAdapter("moneroocean", "MoneroOcean", {
  fee: 0, scheme: "PPLNS", minPayout: 0.003, ssl: true,
  stratum: "gulf.moneroocean.stream", ports: [10128, 20128],
  tagline: "Algo-switching for max profit",
});

const HashVaultAdapter = PendingAdapter("hashvault", "HashVault", {
  fee: 0.9, scheme: "PPLNS/SOLO", minPayout: 0.07, ssl: true,
  stratum: "pool.hashvault.pro", ports: [80, 443, 3333, 9000],
  tagline: "Data-rich, global servers, predictable rewards",
});

export const POOL_ADAPTERS = [
  NanopoolAdapter,
  PrivacyGatewayAdapter,
  P2PoolAdapter,
  MoneroOceanAdapter,
  HashVaultAdapter,
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
      } catch (_) {
        // Keep existing data or null
      }
    };
    load();
    const id = setInterval(load, T.refresh.network);
    return () => clearInterval(id);
  }, []);
  return net;
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
    progress: elapsed / intervalMs, // 0..1
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
