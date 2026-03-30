# XMRminer V2 — Mining Command Center

Multi-pool Monero mining dashboard with live data, fleet management, and 3D network visualization.

## Features

- **Live data** — Nanopool API (30s), CoinGecko (120s), xmrchain.net (60s)
- **Pool Adapter Pattern** — Nanopool live, PrivacyGateway/P2Pool/MoneroOcean/HashVault ready
- **Unit toggle** — H/s / KH/s / MH/s / Auto switching across all displays
- **15-30s auto-refresh** — tiered by API rate limits, visual countdown ring
- **5 tabs** — Overview, Pools, Earnings, Workers, Network
- **3D visualization** — Three.js Monero network topology with ring signature metaphor
- **Motion design** — Perspective tilt cards, stagger reveals, gradient drift, glassmorphism
- **Level 3-5 typography** — Geologica variable weight, Instrument Serif editorial, DM Mono data
- **Zero emoji** — SVG icon system throughout
- **Vercel-ready** — Single command deploy

## Stack

- React 18 + Vite 5
- Three.js (3D scene)
- Google Fonts (Geologica, Instrument Serif, DM Mono, Sora)
- No backend — client-side only, localStorage for preferences

## Quick Start

```bash
npm install
npm run dev
```

## Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo — Vercel auto-detects Vite framework.

## Architecture

```
src/
  tokens.jsx      # Design system (colors, fonts, icons, formatters)
  hooks.jsx       # Pool adapters, data hooks, unit context, refresh timers
  components.jsx  # UI primitives (Card, StatCard, charts, toggles)
  MoneroScene.jsx # Three.js 3D network visualization
  App.jsx         # Shell, navigation, all 5 tab pages
  main.jsx        # Entry point
```

## Adding a Pool Adapter

1. Create adapter object matching the `PoolAdapter` interface in `hooks.jsx`
2. Add to `POOL_ADAPTERS` array
3. Pool appears in Pools tab automatically

## Refresh Intervals

| Source | Interval | Reason |
|--------|----------|--------|
| Nanopool | 30s | Pool data, worker stats |
| CoinGecko | 120s | Free tier rate limit |
| xmrchain.net | 60s | Network stats |

## Worker

- **ID**: xmrboi
- **Pool**: Nanopool (PPLNS, 1% fee, 0.11 XMR min payout)
- **Algorithm**: RandomX (CPU)

---

Built by Aqua / SJB83
