// Mangal Dosha (Manglik) analysis. Mars in houses 1,2,4,7,8,12 from a
// reference point causes the dosha; checked from Lagna, Moon and Venus.

const DOSHA_HOUSES = new Set([1, 2, 4, 7, 8, 12]);
const norm = (n: number) => ((n % 12) + 12) % 12;
const houseFrom = (ref: number, target: number) => norm(target - ref) + 1;

export interface ManglikInput {
  marsSign: number; // 0..11
  ascSign: number;
  moonSign: number;
  venusSign: number;
}

export function manglikStatus(p: ManglikInput) {
  const hLagna = houseFrom(p.ascSign, p.marsSign);
  const hMoon = houseFrom(p.moonSign, p.marsSign);
  const hVenus = houseFrom(p.venusSign, p.marsSign);

  const fromLagna = DOSHA_HOUSES.has(hLagna);
  const fromMoon = DOSHA_HOUSES.has(hMoon);
  const fromVenus = DOSHA_HOUSES.has(hVenus);
  const refs = [
    fromLagna ? "Lagna" : null,
    fromMoon ? "Moon" : null,
    fromVenus ? "Venus" : null,
  ].filter(Boolean) as string[];

  const isManglik = refs.length > 0;

  // Common mitigations: Mars in own (Aries/Scorpio) or exalted (Capricorn).
  const mitigated =
    p.marsSign === 0 || p.marsSign === 7 || p.marsSign === 9;

  let severity: "none" | "low" | "moderate" | "high" = "none";
  if (isManglik) {
    if (mitigated) severity = "low";
    else if (refs.length >= 2 || fromLagna) severity = "high";
    else severity = "moderate";
  }

  const note = !isManglik
    ? "Not Manglik — Mars does not fall in a dosha house."
    : `Manglik from ${refs.join(", ")} (Mars in house ${hLagna} from Lagna). ` +
      (mitigated
        ? "Mars is in its own/exalted sign, which classically softens the dosha."
        : "Standard remedies/expert review are traditionally advised before marriage.");

  return {
    isManglik,
    severity,
    fromLagna,
    fromMoon,
    fromVenus,
    houses: { lagna: hLagna, moon: hMoon, venus: hVenus },
    mitigated,
    note,
  };
}

export function combineManglik(
  groom: ReturnType<typeof manglikStatus>,
  bride: ReturnType<typeof manglikStatus>,
) {
  let status: "ok" | "caution" | "balanced";
  let text: string;

  if (!groom.isManglik && !bride.isManglik) {
    status = "ok";
    text =
      "Neither partner is Manglik — no Mangal Dosha concern for this match.";
  } else if (groom.isManglik && bride.isManglik) {
    status = "balanced";
    text =
      "Both partners are Manglik. Classically this is considered self-cancelling " +
      "(dosha matched by dosha), so it is generally not an obstacle here.";
  } else {
    const who = groom.isManglik ? "Groom" : "Bride";
    const other = groom.isManglik ? "bride" : "groom";
    status = "caution";
    text =
      `Only the ${who.toLowerCase()} is Manglik while the ${other} is not. ` +
      "This is the classic caution case — traditional remedies (e.g. Kumbh " +
      "Vivah, Mars propitiation) or an astrologer's review are advised.";
  }
  return { status, text };
}
