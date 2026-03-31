# XMRminer V2 — Mining Command Center

Multi-pool Monero mining dashboard with live data, fleet management, and 3D network visualization.

## Features

- **Live data** — Nanopool API (30s), CoinGecko (120s), xmrchain.net (60s)
- **Pool Adapter Pattern** — Nanopool live, PrivacyGateway/P2Pool/MoneroOcean/HashVault ready
- **Unit toggle** — H/s / KH/s / MH/s / Auto switching across all displays
- **Tiered auto-refresh** — 30s pool / 120s prices / 60s network, visual countdown ring
- **5 tabs** — Overview, Pools, Earnings, Workers, Network (crossfade transitions)
- **3D visualization** — Three.js Monero network: icosahedron core, ring signature torus bands, 80 orbiting miner nodes, connection lines, background dust, mouse-responsive camera
- **PrivacyGateway featured** — Hero card on Pools tab, banner on Overview, "data en route" placeholders for pending API
- **Worker fleet** — Per-worker status cards with stale/offline alerts
- **Zero emoji** — 22 SVG icons replace all emoji throughout

## Motion Design (from 200 Design Document)

| Effect | Complexity | Where used |
|--------|-----------|------------|
| Stagger reveal (fadeSlideUp) | 3 | All stat card grids |
| Gradient drift | 2 | Ambient background blobs |
| Live pulse | 2 | Online status dot |
| Shadow pulse | 2 | Logo icon |
| Floating hero | 2 | 3D scene container |
| Countdown spin | 2 | Refresh ring |
| Shimmer loading | 2 | Data pending placeholders |
| Tab content crossfade | 3 | Tab switching |
| Button fill sweep | 2 | Refresh button, pool CTAs |
| Press compression | 2 | Tab buttons, action buttons |
| Outline reveal | 1 | Featured pool card hover |
| Perspective tilt (3D card) | 4 | All glass cards (mouse tracking) |
| Cursor spotlight | 3 | Mouse-follow glow overlay |
| Glassmorphism | 3 | All card surfaces (backdrop-filter) |
| Number tick | 4 | Value updates |
| Section reveal | 3 | Section entry via IntersectionObserver |
| Reduced motion | — | @media prefers-reduced-motion respected |

## Typography (Level 3–5)

- **Geologica** (variable 100–900) — Display headers, stat values, hero numbers
- **Instrument Serif** (italic) — Editorial section labels ("What if XMR moons?"), logo wordmark
- **DM Mono** — All data readouts, labels, timestamps, technical copy
- **Sora** — Body text, descriptions, UI labels

## Stack

- React 18 + Vite 5
- Three.js r160 (3D scene, code-split chunk)
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

Or connect GitHub repo — Vercel auto-detects Vite framework via `vercel.json`.

## Architecture

```
src/
  tokens.jsx      # Design tokens, SVG icons, formatters, GlobalCSS (304 lines)
  hooks.jsx       # Pool adapters, data hooks, unit context, timers (302 lines)
  components.jsx  # Glass cards, charts, toggles, UI primitives (389 lines)
  MoneroScene.jsx # Three.js 3D network visualization (263 lines)
  App.jsx         # Shell, nav, all 5 tab pages, MouseGlow (909 lines)
  main.jsx        # Entry point (9 lines)
```

Total: ~2,176 source lines. Production bundle: ~206 KB app + ~458 KB Three.js (code-split).

## Adding a Pool Adapter

1. Create adapter object matching the interface in `hooks.jsx`:
   - `id`, `name`, `featured`, `available`, `config`
   - `fetchUserData(address)` → `PoolUserData | null`
   - `fetchPoolStats()` → `PoolStats | null`
2. Add to `POOL_ADAPTERS` array
3. Pool appears in Pools tab automatically (with "data en route" until `available: true`)

## Refresh Intervals

| Source | Interval | Reason |
|--------|----------|--------|
| Nanopool | 30s | Pool data, worker stats |
| CoinGecko | 120s | Free tier rate limit (10-30 calls/min) |
| xmrchain.net | 60s | Network stats |

Configurable in `tokens.jsx` → `T.refresh`. If CoinGecko rate limits hit, bump to 300s (5 min).

## Live Data

- **Worker**: xmrboi
- **Pool**: Nanopool (PPLNS, 1% fee, 0.11 XMR min payout)
- **Algorithm**: RandomX (CPU)
- **Wallet**: `46Xpikm4555LvUD...SoP1Bnp`

## V3 Roadmap

- PrivacyGateway API integration (pending endpoint documentation)
- P2Pool mini/nano public API
- PWA / offline support
- Push notifications (worker down, payout received)
- Multi-fiat currency display
- Backend proxy for API aggregation

---

Built by Aqua / SJB83 ;)
