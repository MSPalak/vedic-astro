import { getSwe, calcFlags } from "./swe";
import {
  TITHI_NAMES,
  YOGA_NAMES,
  KARANA_NAMES,
  NAKSHATRAS,
  WEEKDAYS,
  NAK_SPAN,
} from "./constants";

const norm360 = (d: number): number => ((d % 360) + 360) % 360;

// The five limbs (pancha-anga) of the Vedic almanac for a given instant.
export async function computePanchang(jdUT: number) {
  const swe = await getSwe();
  const flags = calcFlags(swe);

  const sun = swe.calc(jdUT, 0, flags).longitude;
  const moon = swe.calc(jdUT, 1, flags).longitude;

  const elong = norm360(moon - sun);

  // Tithi (1..30), each spans 12° of elongation.
  const tithiIdx = Math.floor(elong / 12);
  const tithiProgress = ((elong % 12) / 12) * 100;

  // Karana: 60 half-tithis. 1 fixed start, 7 movable x8, 3 fixed end.
  const kn = Math.floor(elong / 6);
  let karana: string;
  if (kn === 0) karana = "Kimstughna";
  else if (kn <= 56) karana = KARANA_NAMES[(kn - 1) % 7];
  else karana = ["Shakuni", "Chatushpada", "Naga"][kn - 57];

  // Nakshatra of the Moon (sidereal), 27 x 13°20'.
  const nakIdx = Math.floor(norm360(moon) / NAK_SPAN);
  const nakProgress = ((norm360(moon) % NAK_SPAN) / NAK_SPAN) * 100;

  // Yoga: (Sun + Moon) sidereal longitude, 27 divisions of 13°20'.
  const yogaIdx = Math.floor(norm360(sun + moon) / NAK_SPAN);

  // Vaara (weekday): 0 = Sunday.
  const dow = Math.floor(jdUT + 1.5) % 7;

  return {
    vaara: WEEKDAYS[dow],
    tithi: {
      name: TITHI_NAMES[tithiIdx],
      number: tithiIdx + 1,
      paksha: tithiIdx < 15 ? "Shukla (waxing)" : "Krishna (waning)",
      progress: Number(tithiProgress.toFixed(1)),
    },
    nakshatra: {
      name: NAKSHATRAS[nakIdx],
      number: nakIdx + 1,
      progress: Number(nakProgress.toFixed(1)),
    },
    yoga: { name: YOGA_NAMES[yogaIdx], number: yogaIdx + 1 },
    karana,
    sunLongitude: Number(norm360(sun).toFixed(4)),
    moonLongitude: Number(norm360(moon).toFixed(4)),
  };
}
