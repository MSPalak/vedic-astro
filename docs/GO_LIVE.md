# TechPandit — Go-Live Guide

Three accounts, ~30 minutes, no code changes needed. Everything in the app
degrades gracefully: with no keys set, readings still work — sign-in and
storage simply stay off.

---

## 1. Supabase — database + login (free tier)

1. Go to https://supabase.com → **New project** (name: `techpandit`, pick the
   Mumbai region for India-first traffic, set a strong DB password).
2. When it's ready: **SQL Editor → New query** → paste the entire contents of
   [`db/schema.sql`](../db/schema.sql) → **Run**. This creates the `readings`
   and `questions` tables with row-level security (each user can only ever
   see their own rows).
3. **Authentication → Providers**:
   - **Email**: on by default — leave on.
   - **Google**: toggle on, follow the inline guide (needs a Google Cloud
     OAuth client — ~5 min).
   - **Phone (OTP)**: toggle on and connect an SMS provider (Twilio/MessageBird).
     Skip this at launch if you don't want SMS costs; email+Google is enough.
4. **Project Settings → API** — copy two values:
   - `Project URL`  → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

That's the whole database: questions asked to the astrologer and every
generated reading (kundli / match / palm) are stored per-user the moment
these keys are set.

## 2. Anthropic — the AI astrologer + palm reading (optional but recommended)

1. https://console.anthropic.com → API Keys → create one.
2. That's `ANTHROPIC_API_KEY`. Without it the astrologer chat falls back to
   the built-in rule engine and palm reading explains it needs the key —
   nothing breaks.

## 3. Render — hosting

1. Push is already done — the repo is at `github.com/MSPalak/vedic-astro`
   with `render.yaml` + `Dockerfile` ready.
2. https://render.com → **New + → Blueprint** → connect GitHub → pick
   `vedic-astro`. Render reads `render.yaml` and creates the web service
   (+ a Postgres you can ignore or delete — Supabase is the app DB).
3. In the service → **Environment**, add:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from step 1.4 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from step 1.4 |
   | `ANTHROPIC_API_KEY` | from step 2 |

4. Deploy. Health check is `/api/health`. First build ~5 min. You get
   `https://techpandit.onrender.com` (rename the service to change the slug).
5. **Auth redirect**: back in Supabase → Authentication → URL Configuration →
   set Site URL to your Render URL (and later your custom domain).

## 4. Custom domain (when ready)

Render service → Settings → Custom Domains → add `techpandit.in` (or your
pick) → point the DNS CNAME as shown → HTTPS is automatic.

---

## Launch checklist

- [ ] `db/schema.sql` ran without errors in Supabase
- [ ] Providers enabled (email at minimum)
- [ ] Three env vars set on Render
- [ ] Supabase Site URL = live URL
- [ ] Open the live site: video plays → language → menu
- [ ] Generate a kundli as guest (works, nothing stored)
- [ ] Sign in → generate a kundli + ask a question → check Supabase
      Table Editor: rows in `readings` and `questions`
- [ ] Match making returns a score; palm reading returns an AI reading

## What's stored, exactly

| Table | When | What |
|---|---|---|
| `questions` | Signed-in user asks the astrologer | question, answer, chart name/date |
| `readings` | Signed-in user generates any reading | kind (kundli/match/palm), title, full result JSON |

Guests are never blocked and never tracked — storage is a benefit of signing
in, not a wall.
