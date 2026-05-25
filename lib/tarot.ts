// Rider–Waite–Smith 78-card deck with concise upright/reversed meanings,
// a shuffle/draw engine and a deterministic plain-English synthesis.

export interface Card {
  name: string;
  group: "Major" | "Wands" | "Cups" | "Swords" | "Pentacles";
  up: string;
  rev: string;
}

const MAJORS: [string, string, string][] = [
  ["The Fool", "new beginnings, leap of faith, freedom", "recklessness, hesitation, bad timing"],
  ["The Magician", "manifestation, skill, willpower", "manipulation, untapped talent, illusion"],
  ["The High Priestess", "intuition, mystery, inner voice", "secrets withheld, ignored intuition"],
  ["The Empress", "abundance, nurturing, creativity", "creative block, dependence, emptiness"],
  ["The Emperor", "structure, authority, stability", "control issues, rigidity, weak boundaries"],
  ["The Hierophant", "tradition, guidance, belief", "rebellion, dogma, breaking convention"],
  ["The Lovers", "union, choice, alignment", "disharmony, misalignment, hard choice"],
  ["The Chariot", "drive, willpower, victory", "loss of control, scattered direction"],
  ["Strength", "courage, patience, inner power", "self-doubt, low energy, force misused"],
  ["The Hermit", "introspection, wisdom, solitude", "isolation, withdrawal, lost guidance"],
  ["Wheel of Fortune", "turning point, luck, cycles", "setback, resistance to change"],
  ["Justice", "fairness, truth, accountability", "unfairness, dishonesty, avoidance"],
  ["The Hanged Man", "surrender, new perspective, pause", "stalling, indecision, needless sacrifice"],
  ["Death", "endings, transformation, release", "resisting change, stagnation"],
  ["Temperance", "balance, moderation, patience", "imbalance, excess, impatience"],
  ["The Devil", "attachment, temptation, materialism", "release, reclaiming power, awareness"],
  ["The Tower", "sudden upheaval, revelation", "averted disaster, fear of change"],
  ["The Star", "hope, renewal, inspiration", "discouragement, lost faith"],
  ["The Moon", "illusion, intuition, uncertainty", "confusion clearing, hidden truth out"],
  ["The Sun", "joy, success, vitality", "temporary clouds, low confidence"],
  ["Judgement", "awakening, reckoning, renewal", "self-doubt, ignoring the call"],
  ["The World", "completion, achievement, wholeness", "incompletion, loose ends, delay"],
];

const SUIT_THEME: Record<string, string> = {
  Wands: "energy, ambition and action",
  Cups: "emotion, relationships and intuition",
  Swords: "thought, conflict and truth",
  Pentacles: "work, money and the material world",
};

// [rankName, up, rev] for each suit, customised per suit theme.
function suitCards(
  suit: "Wands" | "Cups" | "Swords" | "Pentacles",
): Card[] {
  const M: Record<string, [string, [string, string]][]> = {
    Wands: [
      ["Ace", ["spark of inspiration, new venture", "delays, false start"]],
      ["Two", ["planning, future vision", "fear of unknown, indecision"]],
      ["Three", ["expansion, foresight", "obstacles, slow progress"]],
      ["Four", ["celebration, harmony, home", "transition, fragile peace"]],
      ["Five", ["competition, friction", "conflict avoided, tension easing"]],
      ["Six", ["victory, recognition", "ego, fall from favour"]],
      ["Seven", ["defending your stand", "overwhelmed, giving up"]],
      ["Eight", ["fast movement, news", "delays, frustration"]],
      ["Nine", ["resilience, last push", "exhaustion, defensiveness"]],
      ["Ten", ["burden, responsibility", "release of load, delegation"]],
      ["Page", ["enthusiasm, exploration", "scattered energy, hesitation"]],
      ["Knight", ["bold action, adventure", "haste, recklessness"]],
      ["Queen", ["confidence, warmth, drive", "self-doubt, burnout"]],
      ["King", ["vision, leadership", "impulsiveness, domineering"]],
    ],
    Cups: [
      ["Ace", ["new love, emotional opening", "blocked feelings, emptiness"]],
      ["Two", ["partnership, mutual attraction", "imbalance, breakup"]],
      ["Three", ["friendship, celebration", "overindulgence, gossip"]],
      ["Four", ["apathy, reevaluation", "new openness, acceptance"]],
      ["Five", ["loss, regret", "acceptance, moving on"]],
      ["Six", ["nostalgia, kindness", "stuck in the past"]],
      ["Seven", ["choices, fantasy", "clarity, decisive action"]],
      ["Eight", ["walking away, seeking more", "fear of change, drifting"]],
      ["Nine", ["contentment, wish fulfilled", "smugness, unmet wish"]],
      ["Ten", ["harmony, lasting joy", "broken harmony, disconnection"]],
      ["Page", ["creative message, intuition", "emotional immaturity"]],
      ["Knight", ["romance, following the heart", "moodiness, unrealistic"]],
      ["Queen", ["compassion, emotional security", "co-dependence, insecurity"]],
      ["King", ["emotional balance, diplomacy", "volatility, manipulation"]],
    ],
    Swords: [
      ["Ace", ["clarity, breakthrough, truth", "confusion, misused force"]],
      ["Two", ["stalemate, hard choice", "indecision resolved, overwhelm"]],
      ["Three", ["heartbreak, painful truth", "recovery, releasing hurt"]],
      ["Four", ["rest, recovery", "restlessness, burnout"]],
      ["Five", ["conflict, hollow win", "reconciliation, ending conflict"]],
      ["Six", ["transition, moving on", "stuck, unfinished baggage"]],
      ["Seven", ["strategy, caution", "deception exposed, conscience"]],
      ["Eight", ["feeling trapped, self-limit", "freeing yourself, new clarity"]],
      ["Nine", ["anxiety, worry", "hope returning, facing fear"]],
      ["Ten", ["painful ending, rock bottom", "recovery, the worst is over"]],
      ["Page", ["curiosity, vigilance", "haste, scattered thinking"]],
      ["Knight", ["fast action, ambition", "aggression, no plan"]],
      ["Queen", ["clear judgement, honesty", "coldness, bitterness"]],
      ["King", ["intellect, authority, ethics", "harshness, abuse of power"]],
    ],
    Pentacles: [
      ["Ace", ["new opportunity, prosperity", "missed chance, instability"]],
      ["Two", ["balance, adaptability", "overwhelm, poor priorities"]],
      ["Three", ["teamwork, skill building", "lack of teamwork, sloppy work"]],
      ["Four", ["security, saving", "greed, clinging, blocked flow"]],
      ["Five", ["hardship, insecurity", "recovery, help arriving"]],
      ["Six", ["generosity, fair exchange", "strings attached, inequality"]],
      ["Seven", ["patience, long-term view", "impatience, poor return"]],
      ["Eight", ["mastery, diligence", "perfectionism, dull routine"]],
      ["Nine", ["independence, comfort", "overwork, financial worry"]],
      ["Ten", ["wealth, legacy, family", "instability, fleeting success"]],
      ["Page", ["ambition, study, planning", "procrastination, missed lessons"]],
      ["Knight", ["reliability, hard work", "stagnation, dullness"]],
      ["Queen", ["practical nurturing, comfort", "overcommitment, self-neglect"]],
      ["King", ["abundance, leadership", "materialism, controlling"]],
    ],
  };
  return M[suit].map(([rank, [up, rev]]) => ({
    name: `${rank} of ${suit}`,
    group: suit,
    up,
    rev,
  }));
}

export const DECK: Card[] = [
  ...MAJORS.map(
    ([name, up, rev]) => ({ name, group: "Major", up, rev }) as Card,
  ),
  ...suitCards("Wands"),
  ...suitCards("Cups"),
  ...suitCards("Swords"),
  ...suitCards("Pentacles"),
];

export interface DrawnCard {
  position: string;
  name: string;
  group: string;
  reversed: boolean;
  meaning: string;
}

const POSITIONS: Record<number, string[]> = {
  1: ["Your guidance"],
  3: ["Past", "Present", "Future"],
  5: ["Situation", "Challenge", "Past", "Advice", "Likely outcome"],
};

export function drawReading(question: string, count = 3) {
  const n = POSITIONS[count] ? count : 3;
  const idx = [...DECK.keys()];
  // Fisher–Yates
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const picks = idx.slice(0, n);
  const cards: DrawnCard[] = picks.map((di, i) => {
    const c = DECK[di];
    const reversed = Math.random() < 0.32;
    return {
      position: POSITIONS[n][i],
      name: c.name,
      group: c.group,
      reversed,
      meaning: reversed ? c.rev : c.up,
    };
  });

  const majors = cards.filter((c) => c.group === "Major").length;
  const reversedN = cards.filter((c) => c.reversed).length;
  const suitCount: Record<string, number> = {};
  cards.forEach((c) => {
    if (c.group !== "Major")
      suitCount[c.group] = (suitCount[c.group] || 0) + 1;
  });
  const domSuit = Object.entries(suitCount).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  let tone =
    reversedN === 0
      ? "The energy is flowing forward with little resistance."
      : reversedN >= Math.ceil(n / 2)
        ? "Several cards are reversed — expect internal blocks or delays to work through."
        : "Mostly upright with one area to consciously unblock.";

  const clarity =
    majors >= Math.ceil(n / 2)
      ? "High — Major Arcana dominate, so these are significant, fated life themes (not small day-to-day matters)."
      : majors === 0
        ? "Grounded — all Minor Arcana, so this is about practical, everyday and changeable circumstances."
        : "Balanced — a mix of big themes and practical detail.";

  const synthesis =
    (question?.trim()
      ? `On your question — “${question.trim()}” — `
      : "For your reading — ") +
    `the cards drawn are ${cards
      .map((c) => `${c.name}${c.reversed ? " (reversed)" : ""}`)
      .join(", ")}. ${tone}` +
    (domSuit
      ? ` The reading leans toward ${SUIT_THEME[domSuit]}.`
      : " The reading is driven by overarching life forces.") +
    ` Reading clarity/confidence: ${clarity}`;

  return {
    question: question?.trim() || null,
    spread: n === 1 ? "Single card" : n === 5 ? "Five-card" : "Past · Present · Future",
    cards,
    synthesis,
    disclaimer:
      "Tarot is a reflective tool for insight and perspective — it describes tendencies and inner states, not fixed outcomes.",
  };
}
