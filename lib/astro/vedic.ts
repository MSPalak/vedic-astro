import { getSwe, calcFlags } from "./swe";
import {
  RASHIS,
  RASHI_LORDS,
  NAKSHATRAS,
  DASHA_LORDS,
  DASHA_YEARS,
  NAK_SPAN,
} from "./constants";

const SOLAR_YEAR_DAYS = 365.25;
const norm360 = (d: number): number => ((d % 360) + 360) % 360;
const deg2rad = (d: number): number => (d * Math.PI) / 180;
const rad2deg = (r: number): number => (r * 180) / Math.PI;

// Mean obliquity of the ecliptic (Laskar/IAU), degrees. True vs mean differs
// by < 0.003°, negligible for sign/house determination.
function meanObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return (
    23.4392911 -
    (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600
  );
}

export function jdToDate(jdUT: number): Date {
  return new Date((jdUT - 2440587.5) * 86400000);
}

export interface SignInfo {
  lon: number;
  signIndex: number;
  rashi: string;
  rashiLord: string;
  degInSign: number;
  dms: string;
  nakIndex: number;
  nakshatra: string;
  pada: number;
}

function describe(lon: number): SignInfo {
  const L = norm360(lon);
  const signIndex = Math.floor(L / 30);
  const degInSign = L - signIndex * 30;
  const nakIndex = Math.floor(L / NAK_SPAN);
  const within = L - nakIndex * NAK_SPAN;
  const pada = Math.floor(within / (NAK_SPAN / 4)) + 1;
  const t = Math.round(degInSign * 3600);
  const dd = Math.floor(t / 3600);
  const mm = Math.floor((t % 3600) / 60);
  const ss = t % 60;
  return {
    lon: L,
    signIndex,
    rashi: RASHIS[signIndex],
    rashiLord: RASHI_LORDS[signIndex],
    degInSign,
    dms: `${dd}° ${mm}' ${ss}"`,
    nakIndex,
    nakshatra: NAKSHATRAS[nakIndex],
    pada,
  };
}

export interface PlanetResult extends SignInfo {
  name: string;
  retrograde: boolean;
  speed: number;
  house: number;
  navamsaSign: number;
  navamsaRashi: string;
  combust?: boolean;
}

// Navamsa (D9): each sign splits into 9 parts of 3°20'. The classical
// movable/fixed/dual start rule reduces to this closed form.
const NAVAMSA_SPAN = 30 / 9;
export function navamsaSign(lon: number): number {
  const L = norm360(lon);
  const signIndex = Math.floor(L / 30);
  const within = Math.floor((L - signIndex * 30) / NAVAMSA_SPAN);
  return (signIndex * 9 + within) % 12;
}

// Combustion: planet too close to the Sun loses strength. Thresholds in
// degrees per classical texts (retrograde Mercury/Venus use tighter orbs).
const COMBUST_ORB: Record<string, number> = {
  Moon: 12,
  Mars: 17,
  Mercury: 14,
  Venus: 10,
  Jupiter: 11,
  Saturn: 15,
};
const COMBUST_ORB_RETRO: Record<string, number> = { Mercury: 12, Venus: 8 };

function isCombust(name: string, lon: number, sunLon: number, retro: boolean) {
  const orb = (retro && COMBUST_ORB_RETRO[name]) || COMBUST_ORB[name];
  if (!orb) return false;
  const d = Math.abs(norm360(lon) - norm360(sunLon));
  return Math.min(d, 360 - d) <= orb;
}

// Graha drishti (full aspects) by sign offset from the planet's sign.
export const DRISHTI: Record<string, number[]> = {
  Sun: [6],
  Moon: [6],
  Mercury: [6],
  Venus: [6],
  Mars: [3, 6, 7],
  Jupiter: [4, 6, 8],
  Saturn: [2, 6, 9],
};

export interface BirthInput {
  jdUT: number;
  lat: number;
  lon: number;
}

const GRAHAS: Array<{ name: string; id: number }> = [
  { name: "Sun", id: 0 },
  { name: "Moon", id: 1 },
  { name: "Mercury", id: 2 },
  { name: "Venus", id: 3 },
  { name: "Mars", id: 4 },
  { name: "Jupiter", id: 5 },
  { name: "Saturn", id: 6 },
];

export async function computeChart(input: BirthInput) {
  const swe = await getSwe();
  const flags = calcFlags(swe);
  const { jdUT, lat, lon } = input;

  const ayanamsa: number = swe.get_ayanamsa(jdUT);

  // Ascendant computed analytically from local sidereal time + obliquity,
  // then shifted to sidereal (Lahiri). Robust and ephemeris-independent.
  const gstHours: number = swe.sidtime(jdUT); // apparent ST at Greenwich
  const ramc = deg2rad(norm360(gstHours * 15 + lon));
  const eps = deg2rad(meanObliquity(jdUT));
  const phi = deg2rad(lat);
  const tropAsc = norm360(
    rad2deg(
      Math.atan2(
        Math.cos(ramc),
        -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)),
      ),
    ),
  );
  const ascendant = describe(norm360(tropAsc - ayanamsa));
  const ascSign = ascendant.signIndex;

  const planets: PlanetResult[] = [];
  let sunLon = 0;
  for (const g of GRAHAS) {
    const r = swe.calc(jdUT, g.id, flags);
    if (g.name === "Sun") sunLon = r.longitude;
    const info = describe(r.longitude);
    const nav = navamsaSign(r.longitude);
    planets.push({
      name: g.name,
      ...info,
      retrograde: r.longitudeSpeed < 0,
      speed: r.longitudeSpeed,
      house: ((info.signIndex - ascSign + 12) % 12) + 1,
      navamsaSign: nav,
      navamsaRashi: RASHIS[nav],
      combust:
        g.name === "Sun"
          ? false
          : isCombust(g.name, r.longitude, sunLon, r.longitudeSpeed < 0),
    });
  }

  // Rahu (mean node) and Ketu (exactly opposite). Nodes are always retrograde.
  const rahuRaw = swe.calc(jdUT, swe.SE_MEAN_NODE, flags);
  const rahu = describe(rahuRaw.longitude);
  const ketu = describe(rahuRaw.longitude + 180);
  const rahuNav = navamsaSign(rahuRaw.longitude);
  const ketuNav = navamsaSign(rahuRaw.longitude + 180);
  planets.push({
    name: "Rahu",
    ...rahu,
    retrograde: true,
    speed: rahuRaw.longitudeSpeed,
    house: ((rahu.signIndex - ascSign + 12) % 12) + 1,
    navamsaSign: rahuNav,
    navamsaRashi: RASHIS[rahuNav],
  });
  planets.push({
    name: "Ketu",
    ...ketu,
    retrograde: true,
    speed: rahuRaw.longitudeSpeed,
    house: ((ketu.signIndex - ascSign + 12) % 12) + 1,
    navamsaSign: ketuNav,
    navamsaRashi: RASHIS[ketuNav],
  });

  const moon = planets.find((p) => p.name === "Moon")!;
  const vimshottari = computeVimshottari(moon.lon, jdToDate(jdUT));

  // Whole-sign houses: house n holds the sign (ascSign + n - 1).
  const houses = Array.from({ length: 12 }, (_, i) => {
    const signIndex = (ascSign + i) % 12;
    return {
      house: i + 1,
      signIndex,
      rashi: RASHIS[signIndex],
      lord: RASHI_LORDS[signIndex],
      planets: planets.filter((p) => p.house === i + 1).map((p) => p.name),
    };
  });

  // Graha drishti: which planets each planet aspects (sign-based full aspects).
  const aspects = planets
    .filter((p) => DRISHTI[p.name])
    .map((p) => ({
      from: p.name,
      house: p.house,
      aspects: DRISHTI[p.name].map(
        (off) => (((p.house - 1 + off) % 12) + 1),
      ),
      planetsAspected: planets
        .filter((q) =>
          DRISHTI[p.name].some(
            (off) => norm360((q.signIndex - p.signIndex) * 30) === off * 30,
          ),
        )
        .map((q) => q.name),
    }));

  // Navamsa (D9) chart: marriage, dharma and the soul's deeper promise.
  const navAsc = navamsaSign(ascendant.lon);
  const navamsa = {
    ascSign: navAsc,
    ascRashi: RASHIS[navAsc],
    houses: Array.from({ length: 12 }, (_, i) => {
      const signIndex = (navAsc + i) % 12;
      return {
        house: i + 1,
        signIndex,
        rashi: RASHIS[signIndex],
        lord: RASHI_LORDS[signIndex],
        planets: planets
          .filter((p) => p.navamsaSign === signIndex)
          .map((p) => p.name),
      };
    }),
  };

  return {
    ayanamsa,
    ayanamsaDms: toDms(ayanamsa),
    ascendant,
    planets,
    houses,
    navamsa,
    aspects,
    vimshottari,
  };
}

function toDms(deg: number): string {
  const t = Math.round(deg * 3600);
  const d = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${d}° ${m}' ${s}"`;
}

export interface DashaPeriod {
  lord: string;
  start: string;
  end: string;
  years: number;
  antardashas?: DashaPeriod[];
}

export function computeVimshottari(moonLon: number, birth: Date) {
  const L = norm360(moonLon);
  const nakIndex = Math.floor(L / NAK_SPAN);
  const within = L - nakIndex * NAK_SPAN;
  const fraction = within / NAK_SPAN;

  const startLordIdx = nakIndex % 9;
  const startLord = DASHA_LORDS[startLordIdx];
  const startYears = DASHA_YEARS[startLord];
  const balance = startYears * (1 - fraction);

  const addYears = (d: Date, y: number) =>
    new Date(d.getTime() + y * SOLAR_YEAR_DAYS * 86400000);

  const mahadashas: DashaPeriod[] = [];
  let cursor = new Date(birth.getTime());

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_LORDS[(startLordIdx + i) % 9];
    const years = i === 0 ? balance : DASHA_YEARS[lord];
    const end = addYears(cursor, years);

    // Antardashas (bhukti) within this mahadasha.
    const fullYears = DASHA_YEARS[lord];
    let aCursor = new Date(cursor.getTime());
    const antardashas: DashaPeriod[] = [];
    const lordOrder = Array.from(
      { length: 9 },
      (_, k) => DASHA_LORDS[(DASHA_LORDS.indexOf(lord) + k) % 9],
    );
    for (const sub of lordOrder) {
      const subYears = (fullYears * DASHA_YEARS[sub]) / 120;
      // First mahadasha is partial: scale antardashas to remaining balance.
      const scaled = i === 0 ? subYears * (balance / fullYears) : subYears;
      const aEnd = addYears(aCursor, scaled);
      if (aEnd > cursor) {
        antardashas.push({
          lord: sub,
          start: aCursor.toISOString(),
          end: aEnd.toISOString(),
          years: scaled,
        });
      }
      aCursor = aEnd;
    }

    mahadashas.push({
      lord,
      start: cursor.toISOString(),
      end: end.toISOString(),
      years,
      antardashas,
    });
    cursor = end;
  }

  const now = Date.now();
  let current: { maha: string; antar: string } | null = null;
  for (const md of mahadashas) {
    if (now >= Date.parse(md.start) && now < Date.parse(md.end)) {
      const ad = md.antardashas?.find(
        (a) => now >= Date.parse(a.start) && now < Date.parse(a.end),
      );
      current = { maha: md.lord, antar: ad ? ad.lord : md.lord };
      break;
    }
  }

  return {
    janmaNakshatra: NAKSHATRAS[nakIndex],
    startLord,
    balanceYears: balance,
    mahadashas,
    current,
  };
}
