# TechPandit — Vedic Astrology, done with real math

> No bluff. Just real stuff.

A modern web app for **Vedic (sidereal) astrology** built on the **Swiss Ephemeris**.
No canned text or random numbers — every chart, period and match is computed from
actual planetary positions using the **Lahiri ayanamsa**.

> ✨ Cinematic, multilingual UI · 🪐 real ephemeris · 🧮 classical Jyotish rules

## Features

- **Kundli (Birth Chart)** — Lagna, the nine grahas (sign, degree, nakshatra, pada,
  house, retrograde), whole-sign houses, and a **plain-English interpretation** of
  every placement (dignity + house type).
- **Vimshottari Dasha** — full Mahadasha/Antardasha timeline with the currently
  running period highlighted, explained in numbers.
- **Match Making (Guna Milan)** — the classical **Ashtakoota 36-point** system
  (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) **plus Mangal Dosha
  (Manglik)** analysis, with a compatibility %, confidence and dosha flags.
- **Palm Reading (Hast Rekha)** — upload or capture a photo of your palm for an
  AI-vision reading of the major lines, mounts and hand shape (needs `ANTHROPIC_API_KEY`).
- **Daily Panchang** — Tithi, Nakshatra, Yoga, Karana, Vaara for any date/place.
- **8 Indian languages** (English, हिन्दी, தமிழ், తెలుగు, বাংলা, मराठी, ગુજરાતী, ಕನ್ನಡ).
- **Cinematic 3D cosmos** (Three.js) with a pure-CSS fallback when WebGL is absent.
- **Optional accounts** via Supabase (phone OTP / email / Google) — the app runs fully
  without auth configured.

## Tech stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Astronomy | `swisseph-wasm` (Swiss Ephemeris, sidereal/Lahiri) |
| 3D | Three.js + react-three-fiber |
| Time/zones | Luxon (historical-accurate local→UT) |
| Geocoding | Open-Meteo (key-less) |
| Auth (optional) | Supabase |
| Deploy | Docker / Render (standalone output) |

## Getting started

```bash
npm install
npm run dev        # http://localhost:4321
```

Production:

```bash
npm run build
npm start
```

### Environment variables

All optional — see `.env.example`. With Supabase keys unset, login is simply skipped.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (enables login) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `DATABASE_URL` | Postgres (provisioned by `render.yaml`) |

## Project structure

```
app/            App Router pages + API routes (chart, match, tarot, panchang, geocode, health)
components/     UI (cosmic scene, results, match-making, tarot, login, place picker)
lib/            Calculation core — vedic, swe, interpret, matchmaking, manglik, tarot,
                panchang, time, cache, i18n, auth
Dockerfile      Standalone container build
render.yaml     Render blueprint (web service + Postgres)
```

## Deploy

This repo is Render-ready: **New → Blueprint → pick this repo**. `render.yaml` provisions
the web service + Postgres and wires the health check at `/api/health`. Set the Supabase
env vars in the dashboard to enable login.

## Accuracy & disclaimer

Calculations use the Swiss Ephemeris (Moshier model, sub-arc-second for modern dates) with
the Lahiri ayanamsa, and classical rule tables for interpretation, Guna Milan and Manglik.
These are offered as **guidance and reflection, not deterministic prediction**.

## License

© MSPalak. All rights reserved (proprietary) — not licensed for reuse at this time.
