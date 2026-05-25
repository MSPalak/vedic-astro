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
}

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
  for (const g of GRAHAS) {
    const r = swe.calc(jdUT, g.id, flags);
    const info = describe(r.longitude);
    planets.push({
      name: g.name,
      ...info,
      retrograde: r.longitudeSpeed < 0,
      speed: r.longitudeSpeed,
      house: ((info.signIndex - ascSign + 12) % 12) + 1,
    });
  }

  // Rahu (mean node) and Ketu (exactly opposite). Nodes are always retrograde.
  const rahuRaw = swe.calc(jdUT, swe.SE_MEAN_NODE, flags);
  const rahu = describe(rahuRaw.longitude);
  const ketu = describe(rahuRaw.longitude + 180);
  planets.push({
    name: "Rahu",
    ...rahu,
    retrograde: true,
    speed: rahuRaw.longitudeSpeed,
    house: ((rahu.signIndex - ascSign + 12) % 12) + 1,
  });
  planets.push({
    name: "Ketu",
    ...ketu,
    retrograde: true,
    speed: rahuRaw.longitudeSpeed,
    house: ((ketu.signIndex - ascSign + 12) % 12) + 1,
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

  return {
    ayanamsa,
    ayanamsaDms: toDms(ayanamsa),
    ascendant,
    planets,
    houses,
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
