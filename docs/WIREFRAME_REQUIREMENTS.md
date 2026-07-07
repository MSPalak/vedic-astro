# TechPandit — Website Wireframe Requirements

**Product:** TechPandit — Vedic astrology, done with real math.
**Tagline:** *No bluff. Just real stuff.*
**Goal of this document:** a single source of truth a designer (or an AI UI
tool like Figma AI / v0 / Uizard) can use to produce **consistent** wireframes
for the website (desktop + mobile). Consistency comes from Sections 3–5 (design
tokens + grid + component library): define those once, build every screen from
them.

**Scope of this release:** website first, responsive (mobile + desktop). Ship
the flow below; everything else is later.

---

## 1. What the product does (one paragraph)

A person picks a language, then chooses a service. **Kundli & Dasha** takes
birth date/time/place and returns a real sidereal birth chart, planetary
positions, Vimshottari dasha timeline, a plain-English reading, and an "Ask the
Astrologer" chat. **Match Making** takes two people's birth details and returns
a 36-point Ashtakoota compatibility score + Manglik check. **Palm Reading**
takes a photo of a palm and returns a reading of the lines. Calculations are
genuine (Swiss Ephemeris); readings are framed as guidance, not fixed fate.

---

## 2. Users, devices, principles

- **Primary user:** everyday people (India-first) curious about their chart,
  compatibility, or palm. Not astrologers.
- **Devices:** mobile-first in practice (most traffic), but design at **two
  breakpoints — 375px (mobile) and 1440px (desktop)**. Everything must reflow to
  a single column on mobile.
- **Tone:** cinematic and premium, but trustworthy and plain-spoken (the tagline
  is the north star — no mystical jargon walls, no fake certainty).
- **Reading level:** simple English; explain any Sanskrit term inline.

**Design principles (put these on the cover of the wireframe file):**
1. One screen = one job. Don't crowd.
2. Same component, same place, every screen (nav, back button, primary action).
3. Progressive disclosure — show the summary first, details on tap.
4. Every screen has 4 states designed: **default, loading, empty, error.**
5. Honest framing visible on every "reading" screen (guidance, not fate).

---

## 3. Design tokens (the consistency backbone — define ONCE)

> These already exist in the live app. Reuse the exact values so wireframes match
> the build.

### Color
| Token | Value | Use |
|---|---|---|
| `bg` | `#FFFFFF` | App background (light) |
| `ink` | `#1A1726` | Primary text |
| `muted` | `#6B6580` | Secondary text, labels |
| `line` | `#E9E5F2` | Borders, dividers |
| `card` | `rgba(255,255,255,0.72)` | Glass card fill |
| `accent` | `#F4820F` | Primary (saffron/orange) |
| `accent-2` | `#E0457B` | Secondary (pink) |
| `gradient` | `linear-gradient(110deg,#F4820F,#E0457B 55%,#8B3DF0)` | Primary buttons, brand text, score ring |
| **Cosmic (welcome only)** | bg `#020308`, warm accents `#FFB86E`, text `#FFF6EA` | Landing screen |
| Status: good | `#1FAA6B` (green) | Positive placement |
| Status: okay | `#F0A020` (amber) | Neutral placement |
| Status: challenging | `#E0457B` (pink) | Needs-effort placement |

### Typography
- **UI font:** Inter / system sans.
- **Brand wordmark only:** "Great Vibes" cursive (TechPandit logo). Used **once**,
  on the landing screen. Do not use cursive anywhere else.
- **Type scale (px):** 11 (micro-label, uppercase) · 12–13 (caption/meta) ·
  14–15 (body) · 17–19 (card title) · 22 (section prompt) · clamp 28–46 (page
  H1) · clamp 34–60 (brand wordmark).
- Labels: 11–12px, UPPERCASE, letter-spacing ~1px, `muted`.

### Spacing & shape
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40 (use these only).
- **Radius:** inputs/chips 14px · cards 18–22px · panels 26px · buttons/pills 999px.
- **Shadow:** soft, purple-tinted — `0 24px 60px -28px rgba(40,20,80,0.35)`.
- **Card hover:** lift 3px + deepen shadow.

### Motion (note on wireframes, build in hi-fi)
- Cards rise/stagger in. Score ring counts up. Chat shows typing dots.
- Landing: video plays first (~2.5s solo) → brand → tagline → prompt → language
  cards fade in in sequence.
- Respect `prefers-reduced-motion`.

---

## 4. Global layout & grid

- **Stage:** centered column on a full-height background. Content padding 20–32px.
- **Content widths:** single-step screens `max 560px`; results/wide screens
  `max 1080px`. Two-column areas collapse to one column below **760px**.
- **Grid for wireframes:** 12-col desktop (1440, ~1120 content, 24px gutters);
  4-col mobile (375, 16px margins).
- **No persistent top nav bar** in this release. Navigation is: brand kicker
  (top-left of a screen) + a **Back / ← Menu** ghost button per screen. Keep it
  in the same spot everywhere.
- **Footer:** minimal (optional): tiny disclaimer line + link to About/Privacy.

---

## 5. Component library (draw each ONCE, reuse everywhere)

Build these as reusable components/symbols. Every screen is assembled from them.

1. **Primary button** — gradient pill, white text, 16px, rounded 999px. States:
   default / hover (lift + light-sweep) / disabled / loading (label swaps to
   "…").
2. **Ghost button** — transparent, `line` border, `muted` text. Used for
   Back / secondary.
3. **Glass card (`.glass`)** — white translucent, `line` border, radius 22px,
   soft shadow, 24px padding. The universal container.
4. **Text input** — radius 14px, `line` border, focus = accent ring. Variants:
   text, date, time, file.
5. **Label** — 11–12px uppercase muted, sits above each input.
6. **Chip / pill** — small rounded tag. Two kinds: *info chip* (fact display,
   accent bold value) and *action chip* (selectable, "on" state = gradient fill).
7. **Language card** — native name (large) + English name (small caption). Grid.
8. **Service card** — title (gradient text) + one-line description. Whole card
   is the tap target. (Coming-soon variant = dimmed + "Coming soon" — not needed
   this release since all three are live.)
9. **Section heading** — uppercase, letter-spaced, `accent-2` color, inside cards.
10. **Data table** — for planetary positions & kootas. Header row muted uppercase;
    row hover tint; a "status" cell can be colored.
11. **Score ring** — circular progress (conic gradient), big number in center,
    "/ 36" below; color = good/okay/challenging by percent.
12. **Chat panel** — scrollable message list, user bubble (gradient, right),
    assistant bubble (light, left), typing indicator (3 dots), input row
    (rounded input + send button), suggestion chips above the empty state.
13. **Autocomplete dropdown** — used for "place of birth"; list of results with
    a secondary meta line (lat/lon · timezone).
14. **Upload dropzone** — dashed rounded box with 🖐️ icon + prompt; becomes an
    image preview after a photo is chosen.
15. **North-Indian chart** — a fixed diamond grid (square with an X and a
    rotated square) with 12 house cells; house number + planet abbreviations per
    cell. Used for both D1 (Lagna) and D9 (Navamsa).
16. **Status dot** — small colored dot (good/okay/challenging) preceding a line
    of reading text.
17. **"Running period" banner** — highlighted gradient strip with a small label
    + one bold line (current dasha).
18. **Disclaimer line** — 12px muted, italic, at the bottom of any reading card.

---

## 6. Screens (wireframe each at mobile 375 + desktop 1440)

For every screen, produce the **default** state, plus the applicable
loading/empty/error states listed. Keep the back/menu control in the same place.

### S0 — Landing / Welcome
- **Purpose:** first impression + language pick.
- **Layout:** full-bleed looping background video (black hole). Centered over it:
  brand wordmark **TechPandit** (cursive), tagline *No bluff. Just real stuff.*,
  prompt **"Select your language"**, then a grid of **8 language cards**
  (English, हिन्दी, தமிழ், తెలుగు, বাংলা, मराठी, ગુજરાતી, ಕನ್ನಡ).
- **Behavior notes for wireframe annotations:** video autoplays muted, loops,
  **no controls, cannot be paused**; overlay content fades in in sequence after
  the video starts.
- **Responsive:** language grid 4-up desktop → 2-up mobile.
- **States:** default only (a CSS cosmic fallback exists if video fails — note it,
  no separate wireframe needed).

### S1 — Login *(optional, only if accounts are enabled)*
- **Purpose:** sign in to save readings.
- **Layout:** single card. Tabs/segments: **Phone OTP** | **Email & password**.
  Phone: number field → "Send code" → OTP field → "Verify". Email: email +
  password → "Sign in" / "Create account". Divider "— or —" → **Continue with
  Google**.
- **States:** default, code-sent, error (invalid/expired), loading.
- **Note:** if accounts are off, this screen is skipped entirely (language → menu).

### S2 — Services Menu
- **Purpose:** choose what to do.
- **Layout:** brand kicker "TechPandit", H1 = "What would you like to explore?",
  subtitle, then a responsive grid of **3 service cards**:
  1. **Kundli & Dasha** — "Your full Vedic birth chart, planets, dashas & reading"
  2. **Match Making** — "Ashtakoota Guna Milan — bride & groom compatibility"
  3. **Palm Reading** — "Upload a photo of your palm for a hast rekha reading"
- Back button → language.
- **States:** default. (Cards are always enabled this release.)

### S3 — Kundli: Input Form
- **Purpose:** collect birth details.
- **Layout:** H1 "Tell us about your birth", card with: **Full name** (text),
  **Date of birth** (date) + **Time of birth** (time) side-by-side, **Place of
  birth** (autocomplete). Primary "Reveal my chart ✦" + ghost "Back".
- **States:** default, validating/loading ("Aligning the planets…"), error
  ("please pick a birth place"), place-autocomplete open.

### S4 — Kundli: Results (the biggest screen — design carefully)
- **Purpose:** show the chart + reading.
- **Header:** "{Name}'s Kundli" + "← New chart" ghost button + meta line
  (date · time · tz · sidereal Lahiri).
- **Tabs:** **Kundli & Dasha** | **Panchang**.
- **Kundli tab, stacked cards (2-col on desktop where noted, 1-col mobile):**
  1. **Lagna Chart (North Indian)** — diamond chart component (D1).
  2. **Core** — info chips: Lagna sign+degree, Nakshatra+pada, Moon sign, Janma
     Nakshatra, Ayanamsa; + **Running period** banner (current Mahadasha–Antardasha).
  3. **Ask the Astrologer** — chat panel with 4 suggestion chips in empty state.
  4. **Navamsa (D9)** chart + **Aspects (Graha Drishti)** list (2-col).
  5. **Your Chart in Plain English** — "at a glance" summary + a list of 9
     planet lines, each with a status dot (good/okay/challenging) + text.
  6. **Running Period — by the numbers** + **Vimshottari Dasha — in short**.
  7. **What would you like to know?** — 6 life-area chips (Career, Marriage,
     Wealth, Health, Education, Spirituality); tapping reveals a focused reading.
  8. **Planetary Positions** — data table (Graha, Rashi, Degree, Nakshatra, Pada,
     House, Motion).
  9. **Vimshottari Dasha** — expandable list (Mahadasha → Antardashas).
- **Panchang tab:** info chips (Vaara, Tithi, Nakshatra, Yoga, Karana).
- **States:** default, loading (before data), chat states (empty / typing /
  answered / error), disclaimer line visible.

### S5 — Match Making
- **Input view:** H1 "Match Making · Guna Milan", subtitle, **two side-by-side
  cards**: "Groom's details" (left) and "Bride's details" (right), each with
  name + DOB + time + place. Primary "Check compatibility ❤".
  - Mobile: the two cards stack.
- **Result view:** big **score ring** (X / 36) with % + verdict + confidence;
  **Mangal Dosha** card (per-person Manglik + combined verdict); **the 8 kootas**
  table (Koota, Score, plain-English meaning); **Bottom line** paragraph +
  disclaimer. "← Edit details" ghost button.
- **States:** default (empty forms), loading ("Matching the stars…"), error
  (missing fields), result, dosha-flag emphasis.

### S6 — Palm Reading
- **Layout:** H1 "Palm Reading · Hast Rekha", subtitle with photo tips, **two
  cards**: left = upload dropzone (🖐️) → becomes photo preview + "Try another
  photo"; right = "Your Reading" card (empty prompt → typing → reading text +
  disclaimer). "← Menu" ghost button.
- **Behavior note:** photo can come from **file upload OR device camera**;
  it's resized client-side before sending.
- **States:** empty (no photo), photo chosen + analyzing (typing dots), reading
  shown, error (blurry/not-a-palm → ask for a better photo), key-not-configured
  (honest message).

### Global states to design once (as a states sheet)
- **Loading:** typing dots / "Aligning the planets…" / disabled primary button.
- **Empty:** friendly prompt in the target card.
- **Error:** red 14px line under the relevant control; never a dead end — always
  a way to retry.
- **Offline / API down:** toast or inline message.

---

## 7. Primary user flow (draw as a flow diagram)

```
Landing (video) ──select language──▶ [Login if enabled] ──▶ Services Menu
                                                              │
                        ┌─────────────────────┬───────────────┴───────────────┐
                        ▼                     ▼                               ▼
                Kundli form            Match Making                     Palm Reading
                        │                (2 people)                     (photo upload)
                        ▼                     ▼                               ▼
                Kundli Results        Compatibility result             Palm reading
              (chart + chat + …)     (score /36 + kootas)             (lines reading)
                        │                     │                               │
                        └────────── ← back to Services Menu ──────────────────┘
```

Every result screen returns to the **Services Menu**. The menu returns to
**language**.

---

## 8. Content & copy rules (for consistent labels)

- Buttons are actions: "Reveal my chart", "Check compatibility", "Ask".
- Reading cards **always** end with the disclaimer line (guidance, not fate).
- Use the exact service names in Section S2. Don't invent synonyms.
- Sanskrit terms get an English gloss in parentheses on first use
  (e.g., "Lagna (rising sign)").
- Numbers over adjectives where the app has them (real dates, X/36, %).

---

## 9. Accessibility & responsive rules

- Contrast: body text ≥ 4.5:1. The cosmic landing uses shadows behind text —
  keep it legible.
- Tap targets ≥ 44px. Inputs ≥ 44px tall.
- Everything reachable by keyboard; visible focus ring (accent).
- Single-column below 760px; never require horizontal scroll (tables scroll
  inside their own container).
- Respect reduced-motion (freeze the count-up, video, staggered reveals).

---

## 10. Wireframe deliverable checklist (hand this to the designer/tool)

Produce, in **low-to-mid fidelity, grayscale + the Section-3 accent** only:

- [ ] Cover: product name, tagline, the 5 design principles, the token table.
- [ ] A **component sheet** (all 18 components in Section 5, with their states).
- [ ] Each screen **S0–S6** at **375px and 1440px**.
- [ ] A **states sheet** (loading / empty / error) referenced by screens.
- [ ] The **flow diagram** from Section 7.
- [ ] Naming convention for frames: `S{n}-{ScreenName}-{breakpoint}-{state}`
      (e.g., `S4-KundliResults-desktop-default`).
- [ ] Use auto-layout / a real grid so spacing matches the token scale.

### If feeding an AI UI tool instead of a human designer
Prompt skeleton: *"Design a responsive website, mobile-first, light theme.
Brand: TechPandit, tagline 'No bluff. Just real stuff.' Use these tokens:
[paste Section 3]. Build these reusable components: [paste Section 5]. Then
produce these screens with the layouts described: [paste Section 6]. Keep the
back/menu control and card styling identical across screens."*

---

## 11. Out of scope for this release (so wireframes don't sprawl)
- Face Reading and Tarot (removed).
- Saved-readings history / user dashboard (needs accounts + DB — later).
- Payments / premium tiers.
- Multi-language *content translation* of readings (UI is translated; readings
  stay in the chosen language via the AI where available).
- Native mobile app (website first; the site is already responsive/PWA-ready).
