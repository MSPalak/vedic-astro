// Ashtakoota Guna Milan — classical 36-point Vedic compatibility.
// Inputs: each person's Moon nakshatra index (0-26) and Moon rashi index (0-11).
// All eight kootas implemented with standard tables; output is plain English.

import { NAKSHATRAS, RASHIS, RASHI_LORDS } from "./constants";

export interface Person {
  name: string;
  nakIndex: number; // Moon nakshatra 0..26
  rashiIndex: number; // Moon sign 0..11
}

type Koota = {
  name: string;
  got: number;
  max: number;
  detail: string;
};

// ---- Varna (1) : sign element rank ----
const VARNA_RANK = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4]; // Aries..Pisces
const VARNA_NAME = ["Shudra", "Vaishya", "Kshatriya", "Brahmin"];

// ---- Vashya (2) : sign -> class ----
// 0 Chatushpada, 1 Manava(human), 2 Jalachara, 3 Vanchara(wild), 4 Keeta
const VASHYA = [0, 0, 1, 2, 3, 1, 1, 4, 1, 0, 1, 2]; // Aries..Pisces
const VASHYA_NAME = [
  "Chatushpada (quadruped)",
  "Manava (human)",
  "Jalachara (water)",
  "Vanchara (wild)",
  "Keeta (insect)",
];

// ---- Gana (6) : nakshatra -> 0 Deva, 1 Manushya, 2 Rakshasa ----
const GANA = [
  0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1,
  0,
];
const GANA_NAME = ["Deva", "Manushya", "Rakshasa"];

// ---- Nadi (8) : nakshatra -> 0 Aadi, 1 Madhya, 2 Antya ----
const NADI = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1,
  2,
];
const NADI_NAME = ["Aadi (Vata)", "Madhya (Pitta)", "Antya (Kapha)"];

// ---- Yoni (4) : nakshatra -> animal index (14 yonis) ----
const YONI_NAME = [
  "Horse",
  "Elephant",
  "Sheep",
  "Serpent",
  "Dog",
  "Cat",
  "Rat",
  "Cow",
  "Buffalo",
  "Tiger",
  "Deer",
  "Monkey",
  "Mongoose",
  "Lion",
];
const YONI = [
  0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0,
  13, 7, 1,
];
// Mortal-enemy yoni pairs (0 points). Same yoni = 4, else neutral = 2.
const YONI_ENEMIES: [number, number][] = [
  [7, 9], // Cow - Tiger
  [1, 13], // Elephant - Lion
  [0, 8], // Horse - Buffalo
  [4, 10], // Dog - Deer
  [2, 11], // Sheep - Monkey
  [3, 12], // Serpent - Mongoose
  [5, 6], // Cat - Rat
];

// ---- Graha Maitri (5) : planetary friendship ----
const FRIENDS: Record<string, string[]> = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"],
};
const ENEMIES: Record<string, string[]> = {
  Sun: ["Venus", "Saturn"],
  Moon: [],
  Mars: ["Mercury"],
  Mercury: ["Moon"],
  Jupiter: ["Mercury", "Venus"],
  Venus: ["Sun", "Moon"],
  Saturn: ["Sun", "Moon", "Mars"],
};
function relation(a: string, b: string): "friend" | "neutral" | "enemy" {
  if (a === b) return "friend";
  if (FRIENDS[a]?.includes(b)) return "friend";
  if (ENEMIES[a]?.includes(b)) return "enemy";
  return "neutral";
}

const norm = (n: number, m: number) => ((n % m) + m) % m;

export function gunaMilan(groom: Person, bride: Person) {
  const kootas: Koota[] = [];

  // Varna (1)
  const gV = VARNA_RANK[groom.rashiIndex];
  const bV = VARNA_RANK[bride.rashiIndex];
  const varnaGot = gV >= bV ? 1 : 0;
  kootas.push({
    name: "Varna",
    got: varnaGot,
    max: 1,
    detail: `Groom is ${VARNA_NAME[gV - 1]}, bride is ${
      VARNA_NAME[bV - 1]
    }. ${
      varnaGot
        ? "The groom's varna is not lower than the bride's, so spiritual/ego harmony is supported."
        : "The groom's varna is lower than the bride's, a minor ego-harmony caution."
    }`,
  });

  // Vashya (2)
  const gW = VASHYA[groom.rashiIndex];
  const bW = VASHYA[bride.rashiIndex];
  let vashyaGot = 1;
  if (gW === bW) vashyaGot = 2;
  else if (gW === 3 || bW === 3) vashyaGot = 0;
  else if (gW === 4 || bW === 4) vashyaGot = 0.5;
  kootas.push({
    name: "Vashya",
    got: vashyaGot,
    max: 2,
    detail: `Groom's class is ${VASHYA_NAME[gW]}, bride's is ${
      VASHYA_NAME[bW]
    }. This measures mutual magnetism and how naturally one accommodates the other (${vashyaGot}/2).`,
  });

  // Tara / Dina (3)
  const taraScore = (from: number, to: number) => {
    const count = (norm(to - from, 27) + 1) % 9;
    const r = count === 0 ? 9 : count;
    return r === 3 || r === 5 || r === 7 ? 0 : 1.5;
  };
  const taraGot =
    taraScore(bride.nakIndex, groom.nakIndex) +
    taraScore(groom.nakIndex, bride.nakIndex);
  kootas.push({
    name: "Tara (Dina)",
    got: taraGot,
    max: 3,
    detail: `Counts birth-star to birth-star both ways for health and well-being of the couple (${taraGot}/3). ${
      taraGot >= 3
        ? "Fully auspicious."
        : taraGot >= 1.5
          ? "Partly auspicious."
          : "Inauspicious — extra care for health/longevity advised."
    }`,
  });

  // Yoni (4)
  const gY = YONI[groom.nakIndex];
  const bY = YONI[bride.nakIndex];
  let yoniGot = 2;
  if (gY === bY) yoniGot = 4;
  else if (
    YONI_ENEMIES.some(
      ([x, y]) => (x === gY && y === bY) || (x === bY && y === gY),
    )
  )
    yoniGot = 0;
  kootas.push({
    name: "Yoni",
    got: yoniGot,
    max: 4,
    detail: `Groom's yoni is ${YONI_NAME[gY]}, bride's is ${
      YONI_NAME[bY]
    }. This reflects physical and intimate compatibility (${yoniGot}/4)${
      yoniGot === 4
        ? " — same yoni, excellent."
        : yoniGot === 0
          ? " — opposing animals, a real caution."
          : "."
    }`,
  });

  // Graha Maitri (5)
  const gL = RASHI_LORDS[groom.rashiIndex];
  const bL = RASHI_LORDS[bride.rashiIndex];
  const rAB = relation(gL, bL);
  const rBA = relation(bL, gL);
  const pair = [rAB, rBA].sort().join("-");
  let maitriGot = 3;
  if (gL === bL) maitriGot = 5;
  else if (pair === "friend-friend") maitriGot = 5;
  else if (pair === "friend-neutral") maitriGot = 4;
  else if (pair === "neutral-neutral") maitriGot = 3;
  else if (pair === "enemy-friend") maitriGot = 1;
  else if (pair === "enemy-neutral") maitriGot = 0.5;
  else if (pair === "enemy-enemy") maitriGot = 0;
  kootas.push({
    name: "Graha Maitri",
    got: maitriGot,
    max: 5,
    detail: `Moon-sign lords are ${gL} (groom) and ${bL} (bride) — ${
      gL === bL ? "the same planet" : `${rAB}/${rBA}`
    }. This is mental and intellectual friendship (${maitriGot}/5).`,
  });

  // Gana (6)
  const gG = GANA[groom.nakIndex];
  const bG = GANA[bride.nakIndex];
  const ganaMatrix = [
    [6, 5, 1],
    [6, 6, 0],
    [0, 0, 6],
  ];
  const ganaGot = ganaMatrix[gG][bG];
  kootas.push({
    name: "Gana",
    got: ganaGot,
    max: 6,
    detail: `Groom is ${GANA_NAME[gG]} gana, bride is ${
      GANA_NAME[bG]
    } gana. This measures temperament and behavioural fit (${ganaGot}/6).`,
  });

  // Bhakoot (7)
  const posA = norm(bride.rashiIndex - groom.rashiIndex, 12) + 1;
  const posB = norm(groom.rashiIndex - bride.rashiIndex, 12) + 1;
  const set = [posA, posB].sort((a, b) => a - b).join("-");
  const bhakootDosha =
    set === "2-12" || set === "5-9" || set === "6-8";
  const bhakootGot = bhakootDosha ? 0 : 7;
  kootas.push({
    name: "Bhakoot",
    got: bhakootGot,
    max: 7,
    detail: `Moon signs are ${RASHIS[groom.rashiIndex]} (groom) and ${
      RASHIS[bride.rashiIndex]
    } (bride). This governs family welfare, finances and health (${bhakootGot}/7).${
      bhakootDosha
        ? " Bhakoot Dosha is present — remedies are traditionally advised."
        : ""
    }`,
  });

  // Nadi (8)
  const gN = NADI[groom.nakIndex];
  const bN = NADI[bride.nakIndex];
  const nadiDosha = gN === bN;
  const nadiGot = nadiDosha ? 0 : 8;
  kootas.push({
    name: "Nadi",
    got: nadiGot,
    max: 8,
    detail: `Groom's nadi is ${NADI_NAME[gN]}, bride's is ${
      NADI_NAME[bN]
    }. Nadi relates to health and progeny (${nadiGot}/8).${
      nadiDosha
        ? " Nadi Dosha is present — the single most weighted caution; remedies/expert review advised."
        : " Different nadis — strong for health and children."
    }`,
  });

  const total = kootas.reduce((s, k) => s + k.got, 0);
  const percent = Math.round((total / 36) * 100);

  let verdict: string;
  let confidence: string;
  if (nadiDosha && total < 18) {
    verdict =
      "Not recommended without remedies — low score combined with Nadi Dosha.";
    confidence = "High confidence (clear classical red flags)";
  } else if (total >= 32) {
    verdict = "Excellent match — a highly compatible pairing.";
    confidence = "High confidence";
  } else if (total >= 24) {
    verdict = "Very good match — well suited for marriage.";
    confidence = "High confidence";
  } else if (total >= 18) {
    verdict =
      "Acceptable match — workable; review the weaker kootas and any dosha.";
    confidence =
      nadiDosha || bhakootDosha
        ? "Moderate confidence (a dosha is present)"
        : "Moderate confidence";
  } else {
    verdict =
      "Below the traditional threshold (18/36) — generally not advised without expert review.";
    confidence = "High confidence (score is clearly low)";
  }

  return {
    groom: { ...groom, nak: NAKSHATRAS[groom.nakIndex], rashi: RASHIS[groom.rashiIndex] },
    bride: { ...bride, nak: NAKSHATRAS[bride.nakIndex], rashi: RASHIS[bride.rashiIndex] },
    kootas,
    total,
    max: 36,
    percent,
    verdict,
    confidence,
    doshas: {
      nadi: nadiDosha,
      bhakoot: bhakootDosha,
    },
    summary:
      `${groom.name || "Groom"} and ${bride.name || "Bride"} score ` +
      `${total} out of 36 gunas (${percent}% compatibility). ${verdict} ` +
      `The strongest area is "${
        [...kootas].sort((a, b) => b.got / b.max - a.got / a.max)[0].name
      }" and the weakest is "${
        [...kootas].sort((a, b) => a.got / a.max - b.got / b.max)[0].name
      }".` +
      (nadiDosha ? " Note: Nadi Dosha present." : "") +
      (bhakootDosha ? " Note: Bhakoot Dosha present." : ""),
    disclaimer:
      "Ashtakoota Guna Milan is one classical compatibility lens (Moon-based). " +
      "A full opinion also weighs Mangal Dosha, dasha timing and both full charts — treat this as guidance, not a verdict.",
  };
}
