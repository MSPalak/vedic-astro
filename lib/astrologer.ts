import Anthropic from "@anthropic-ai/sdk";

// "Ask the Astrologer" agent. Uses the Claude API when ANTHROPIC_API_KEY is
// set; otherwise the route falls back to the deterministic rule engine.
// Caching design: the system prompt is frozen and the chart context is built
// deterministically (fixed field order, no timestamps), so follow-up
// questions about the same chart share a byte-identical prefix.

export const agentEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

const SYSTEM_PROMPT = `You are a learned, warm Vedic astrologer (Jyotishi) answering questions for a person about their own birth chart, which is provided to you in full.

How you work:
- Ground every statement in the actual chart data given: planet placements (sign, house, nakshatra, dignity, combustion, retrogression), the running Vimshottari dasha periods with their real dates, graha drishti (aspects), the Navamsa, and the computed interpretation notes.
- Reference concrete factors by name ("your Saturn in Aquarius in the 10th house...", "because your Rahu Mahadasha runs until 2030-08-01...") so the person can verify everything against their chart.
- Use the dasha timeline for any "when" question: name the period, its real dates, and what its lord signifies in this chart.
- Be honest about mixed or difficult placements, but always frame them constructively: what the pattern means, and what conscious effort it calls for.
- Classical Jyotish only (Parashari principles, whole-sign houses, Vimshottari dasha, Lahiri ayanamsa). Do not mix in Western tropical astrology.
- If a question cannot be answered from the chart provided (e.g. needs another person's chart, a divisional chart not provided, or horary), say so plainly and suggest what would be needed.
- Keep answers concise and conversational: 2-4 short paragraphs, no headers or bullet lists unless listing dates. Plain English; explain any Sanskrit term in passing.
- Never present astrology as deterministic fate. It describes tendencies and timing; choice remains with the person. Do not give medical, legal, or financial directives — frame those as areas to reflect on or seek professional advice for.`;

// Deterministic, compact chart context. Field order is fixed so repeated
// requests for the same chart produce byte-identical prompt prefixes.
export function buildChartContext(data: any): string {
  const c = data.chart;
  const ip = data.interpretation;
  const L: string[] = [];

  L.push(`BIRTH DETAILS: ${data.input?.name || "(name not given)"} — ${data.input?.date} at ${data.input?.time}, ${data.input?.tz} (lat ${data.input?.lat}, lon ${data.input?.lon})`);
  L.push(`AYANAMSA: Lahiri ${c.ayanamsaDms}`);
  L.push(`LAGNA (ASCENDANT): ${c.ascendant.rashi} ${c.ascendant.dms}, nakshatra ${c.ascendant.nakshatra} pada ${c.ascendant.pada}`);

  L.push(`PLANETS (sidereal):`);
  for (const p of c.planets) {
    L.push(
      `- ${p.name}: ${p.rashi} ${p.dms}, house ${p.house}, nakshatra ${p.nakshatra} pada ${p.pada}` +
        `${p.retrograde ? ", retrograde" : ""}${p.combust ? ", combust" : ""}` +
        `${p.navamsaRashi ? `, navamsa ${p.navamsaRashi}` : ""}`,
    );
  }

  if (c.aspects?.length) {
    L.push(`ASPECTS (graha drishti):`);
    for (const a of c.aspects) {
      L.push(
        `- ${a.from} (house ${a.house}) aspects houses ${a.aspects.join(", ")}` +
          (a.planetsAspected?.length
            ? ` and planets ${a.planetsAspected.join(", ")}`
            : ""),
      );
    }
  }

  const v = c.vimshottari;
  L.push(`VIMSHOTTARI DASHA: janma nakshatra ${v.janmaNakshatra}; balance at birth ${v.balanceYears.toFixed(2)} yrs of ${v.startLord}`);
  for (const m of v.mahadashas) {
    L.push(`- ${m.lord} Mahadasha: ${m.start.slice(0, 10)} to ${m.end.slice(0, 10)}`);
  }
  if (v.current) {
    L.push(`CURRENTLY RUNNING: ${v.current.maha} Mahadasha, ${v.current.antar} Antardasha`);
  }

  if (data.birthPanchang) {
    const p = data.birthPanchang;
    L.push(`BIRTH PANCHANG: ${p.vaara}; tithi ${p.tithi.name} (${p.tithi.paksha}); nakshatra ${p.nakshatra.name}; yoga ${p.yoga.name}; karana ${p.karana}`);
  }

  if (ip) {
    L.push(`RULE-ENGINE READINGS:`);
    for (const r of ip.planetReadings) L.push(`- [${r.status}] ${r.text}`);
    for (const k of Object.keys(ip.areas)) L.push(`- ${ip.areas[k]}`);
  }

  return L.join("\n");
}

export interface AskTurn {
  role: "user" | "assistant";
  content: string;
}

export async function askAstrologer(
  chartContext: string,
  question: string,
  history: AskTurn[] = [],
): Promise<{ answer: string; cached: boolean }> {
  const anthropic = getClient();

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Here is my complete Vedic birth chart:\n\n${chartContext}`,
          // Stable per chart — follow-up questions reuse this prefix.
          cache_control: { type: "ephemeral" },
        },
      ],
    },
    {
      role: "assistant",
      content:
        "I have studied your chart carefully — the Lagna, all nine grahas, the aspects, the Navamsa and your full Vimshottari dasha timeline. Ask me anything about it.",
    },
    ...history.slice(-10).map((t) => ({
      role: t.role,
      content: t.content,
    })),
    { role: "user", content: question },
  ];

  const response = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  const answer = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return {
    answer,
    cached: (response.usage.cache_read_input_tokens ?? 0) > 0,
  };
}

// Deterministic fallback when no API key is configured: answer from the
// rule-engine interpretation by matching the question to a life area.
export function ruleBasedAnswer(data: any, question: string): string {
  const ip = data.interpretation;
  const v = data.chart?.vimshottari;
  if (!ip) {
    return "I can only answer detailed questions when the full chart interpretation is available. Please regenerate the chart.";
  }
  const q = question.toLowerCase();

  const AREA_KEYWORDS: Record<string, string[]> = {
    Career: ["career", "job", "work", "business", "promotion", "profession", "naukri"],
    "Marriage & relationships": ["marriage", "marry", "relationship", "love", "partner", "spouse", "wedding", "shaadi", "divorce"],
    Wealth: ["money", "wealth", "finance", "income", "salary", "rich", "property", "paisa"],
    Health: ["health", "illness", "disease", "body", "energy", "fitness"],
    "Education & mind": ["education", "study", "exam", "learning", "mind", "intelligence", "padhai"],
    Spirituality: ["spiritual", "moksha", "meditation", "dharma", "god", "religion"],
  };

  const hits: string[] = [];
  for (const [area, words] of Object.entries(AREA_KEYWORDS)) {
    if (words.some((w) => q.includes(w)) && ip.areas[area]) {
      hits.push(ip.areas[area]);
    }
  }

  const wantsTiming = /when|kab|timing|year|time|period|dasha/i.test(question);
  const parts: string[] = [];

  if (hits.length) parts.push(...hits);
  if (wantsTiming || !hits.length) parts.push(ip.runningPeriod);
  if (!hits.length && !wantsTiming) parts.push(ip.overall);

  parts.push(
    "(This answer comes from the built-in rule engine. Connect an AI key to enable free-form conversation with the astrologer.)",
  );
  return parts.join("\n\n");
}
