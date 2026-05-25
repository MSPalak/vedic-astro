// Deterministic, classical-rule interpretation of a computed chart.
// No fortune-telling fluff: every line is derived from planetary dignity,
// house type and real Dasha dates/durations.

type Planet = {
  name: string;
  signIndex: number;
  rashi: string;
  house: number;
  retrograde: boolean;
};

// signIndex: 0=Aries ... 11=Pisces
const EXALT: Record<string, number> = {
  Sun: 0,
  Moon: 1,
  Mars: 9,
  Mercury: 5,
  Jupiter: 3,
  Venus: 11,
  Saturn: 6,
};
const DEBIL: Record<string, number> = {
  Sun: 6,
  Moon: 7,
  Mars: 3,
  Mercury: 11,
  Jupiter: 9,
  Venus: 5,
  Saturn: 0,
};
const OWN: Record<string, number[]> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10],
};

const BENEFIC = new Set(["Jupiter", "Venus", "Mercury"]);
const KENDRA = new Set([1, 4, 7, 10]);
const TRIKONA = new Set([1, 5, 9]);
const DUSTHANA = new Set([6, 8, 12]);

const HOUSE_THEME: Record<number, string> = {
  1: "your personality, body and overall direction",
  2: "wealth, family and speech",
  3: "courage, effort and siblings",
  4: "home, mother, property and inner peace",
  5: "intelligence, creativity, romance and children",
  6: "health, daily work, debts and competition",
  7: "marriage, partnerships and business",
  8: "change, shared resources, longevity and the unexpected",
  9: "luck, higher learning, dharma and father",
  10: "career, status and public life",
  11: "gains, income and social network",
  12: "expenses, foreign lands, rest and spirituality",
};

export type Status = "good" | "okay" | "challenging";

function dignity(name: string, signIndex: number) {
  if (EXALT[name] === signIndex) return { tag: "exalted", score: 2 };
  if (DEBIL[name] === signIndex) return { tag: "debilitated", score: -2 };
  if (OWN[name]?.includes(signIndex)) return { tag: "in its own sign", score: 1.5 };
  return { tag: "in a neutral sign", score: 0 };
}

function planetReading(p: Planet) {
  // Nodes: judged purely by house (no rulership).
  if (p.name === "Rahu" || p.name === "Ketu") {
    const dus = DUSTHANA.has(p.house);
    const status: Status = dus ? "okay" : "okay";
    const text =
      `${p.name} sits in House ${p.house} (${HOUSE_THEME[p.house]}). ` +
      `As a shadow planet it intensifies this area — ` +
      (p.name === "Rahu"
        ? "strong worldly desire and ambition here, best handled with discipline."
        : "detachment and a search for meaning here, sometimes restlessness.");
    return { name: p.name, status, dignityTag: "shadow planet", text };
  }

  const d = dignity(p.name, p.signIndex);
  let score = d.score;
  if (KENDRA.has(p.house) || TRIKONA.has(p.house)) score += 1;
  if (DUSTHANA.has(p.house)) score -= 1;
  if (p.retrograde) score -= 0.25;

  let status: Status = "okay";
  if (score >= 1.5) status = "good";
  else if (score <= -1.5) status = "challenging";

  const benefMal = BENEFIC.has(p.name) ? "a natural benefic" : "a natural malefic";
  let verdict =
    status === "good"
      ? "well placed and supportive"
      : status === "challenging"
        ? "under pressure and needs conscious effort"
        : "workable with mixed results";

  const text =
    `${p.name} is ${d.tag}${p.retrograde ? " and retrograde" : ""}, ` +
    `placed in House ${p.house} — ${HOUSE_THEME[p.house]}. ` +
    `As ${benefMal} it is ${verdict} here.`;

  return { name: p.name, status, dignityTag: d.tag, text };
}

function ymBetween(aIso: string, bIso: string) {
  let months =
    (new Date(bIso).getFullYear() - new Date(aIso).getFullYear()) * 12 +
    (new Date(bIso).getMonth() - new Date(aIso).getMonth());
  if (months < 0) months = 0;
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} year${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} month${m > 1 ? "s" : ""}`);
  return parts.join(" ") || "less than a month";
}

function ageAt(birthIso: string, whenIso: string) {
  const b = new Date(birthIso);
  const w = new Date(whenIso);
  let a = w.getFullYear() - b.getFullYear();
  if (
    w.getMonth() < b.getMonth() ||
    (w.getMonth() === b.getMonth() && w.getDate() < b.getDate())
  )
    a--;
  return a;
}

export function interpretChart(chart: any, birthDateIso: string) {
  const planets: Planet[] = chart.planets;
  const asc = chart.ascendant;

  // Lagna
  const lagna =
    `Your Lagna (rising sign) is ${asc.rashi} at ${asc.dms}, in ${asc.nakshatra} ` +
    `nakshatra (pada ${asc.pada}). The Lagna sets the lens through which your whole ` +
    `life is read — it shapes your temperament, health and how the world sees you.`;

  const readings = planets.map(planetReading);
  const good = readings.filter((r) => r.status === "good").map((r) => r.name);
  const chall = readings
    .filter((r) => r.status === "challenging")
    .map((r) => r.name);

  const overall =
    `Out of 9 grahas, ${good.length} ${good.length === 1 ? "is" : "are"} ` +
    `well placed` +
    (good.length ? ` (${good.join(", ")})` : "") +
    `, ${chall.length} ${chall.length === 1 ? "needs" : "need"} conscious ` +
    `effort` +
    (chall.length ? ` (${chall.join(", ")})` : "") +
    `, and the rest are workable. No chart is all-good or all-bad — the ` +
    `Dasha (timeline) decides when each planet's results actually show up.`;

  // Running period with real numbers
  const v = chart.vimshottari;
  let running = "Dasha periods could not be resolved.";
  if (v.current) {
    const md = v.mahadashas.find((m: any) => m.lord === v.current.maha);
    const ad = md?.antardashas?.find((a: any) => a.lord === v.current.antar);
    const now = new Date().toISOString();
    if (md) {
      const mdElapsed = ymBetween(md.start, now);
      const mdLeft = ymBetween(now, md.end);
      running =
        `You are running the ${md.lord} Mahadasha — a ${md.years.toFixed(
          1,
        )}-year chapter from ` +
        `${md.start.slice(0, 10)} to ${md.end.slice(0, 10)}. ` +
        `So far ${mdElapsed} has passed and about ${mdLeft} remains. ` +
        `This sets the dominant theme of life right now (${md.lord}'s themes).`;
      if (ad) {
        const adElapsed = ymBetween(ad.start, now);
        const adLeft = ymBetween(now, ad.end);
        running +=
          ` Inside it, the ${ad.lord} Antardasha (sub-period) runs ` +
          `${ad.start.slice(0, 10)} → ${ad.end.slice(0, 10)} (${ad.years.toFixed(
            1,
          )} yrs): ${adElapsed} done, ~${adLeft} left. ` +
          `The flavour of the next while is "${md.lord} through ${ad.lord}".`;
      }
    }
  }

  // Vimshottari plain-English summary with ages
  const vlines: string[] = [];
  for (const m of v.mahadashas.slice(0, 9)) {
    const a1 = ageAt(birthDateIso, m.start);
    const a2 = ageAt(birthDateIso, m.end);
    vlines.push(
      `${m.lord}: age ${a1 < 0 ? 0 : a1}–${a2} (${m.start.slice(
        0,
        4,
      )}–${m.end.slice(0, 4)})`,
    );
  }
  const vimshottari =
    `Vimshottari Dasha splits your life into planetary chapters totalling 120 years, ` +
    `starting from your Moon's nakshatra (${v.janmaNakshatra}). You were born partway ` +
    `into the ${v.startLord} period (${v.balanceYears.toFixed(
      1,
    )} years of it were left at birth). ` +
    `The running order for you is — ${vlines.join("  ·  ")}.`;

  // Life areas (house lord + occupants)
  const H = (n: number) => chart.houses[n - 1];
  const lordStatus = (lord: string) => {
    const r = readings.find((x) => x.name === lord);
    return r ? r.status : "okay";
  };
  const areaLine = (label: string, houseNum: number, extra?: number) => {
    const h = H(houseNum);
    const occ = h.planets;
    const ls = lordStatus(h.lord);
    let tone =
      ls === "good"
        ? "well supported"
        : ls === "challenging"
          ? "needs effort"
          : "mixed but workable";
    const occTxt = occ.length
      ? `${occ.join(", ")} ${occ.length === 1 ? "sits" : "sit"} here, adding ` +
        `${occ.length === 1 ? "its" : "their"} nature.`
      : "No planet sits here, so its lord's condition matters most.";
    const ex = extra ? ` (also see House ${extra})` : "";
    return (
      `${label}: House ${houseNum} is ${h.rashi}, ruled by ${h.lord} ` +
      `(currently ${ls}). ${occTxt} Overall this area looks ${tone}${ex}.`
    );
  };

  const areas = {
    Career: areaLine("Career & status", 10, 6),
    "Marriage & relationships": areaLine("Marriage & relationships", 7),
    Wealth: areaLine("Wealth & income", 2, 11),
    Health: areaLine("Health & vitality", 1, 6),
    "Education & mind": areaLine("Education & mind", 5, 4),
    Spirituality: areaLine("Spirituality & letting go", 9, 12),
  };

  return {
    lagna,
    overall,
    planetReadings: readings,
    runningPeriod: running,
    vimshottariSummary: vimshottari,
    areas,
    disclaimer:
      "This is a rule-based reading from classical Jyotish (dignities, house types and real Dasha dates) — guidance for reflection, not a fixed prediction.",
  };
}
