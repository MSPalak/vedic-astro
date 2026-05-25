import { NextRequest, NextResponse } from "next/server";
import { toJulianDayUT } from "@/lib/time";
import { computeChart } from "@/lib/vedic";
import { gunaMilan, type Person } from "@/lib/matchmaking";
import { manglikStatus, combineManglik } from "@/lib/manglik";
import { cached } from "@/lib/cache";

export const runtime = "nodejs";
export const maxDuration = 30;

async function analyze(p: any): Promise<{
  person: Person;
  manglik: ReturnType<typeof manglikStatus>;
}> {
  const { jdUT } = toJulianDayUT({ date: p.date, time: p.time, tz: p.tz });
  const chart = await computeChart({
    jdUT,
    lat: Number(p.lat),
    lon: Number(p.lon),
  });
  const find = (n: string) => {
    const p = chart.planets.find((x: any) => x.name === n);
    if (!p) throw new Error(`${n} not found in chart`);
    return p;
  };
  const moon = find("Moon");
  const mars = find("Mars");
  const venus = find("Venus");
  return {
    person: {
      name: p.name ?? "",
      nakIndex: moon.nakIndex,
      rashiIndex: moon.signIndex,
    },
    manglik: manglikStatus({
      marsSign: mars.signIndex,
      ascSign: chart.ascendant.signIndex,
      moonSign: moon.signIndex,
      venusSign: venus.signIndex,
    }),
  };
}

export async function POST(req: NextRequest) {
  try {
    const { groom, bride } = await req.json();
    for (const [who, p] of [
      ["groom", groom],
      ["bride", bride],
    ] as const) {
      if (!p?.date || !p?.time || !p?.tz || p?.lat == null || p?.lon == null) {
        return NextResponse.json(
          { error: `Missing birth details for ${who} (date, time, tz, lat, lon)` },
          { status: 400 },
        );
      }
    }

    const k = (p: any) =>
      `${p.date}|${p.time}|${p.tz}|${Number(p.lat).toFixed(4)}|${Number(
        p.lon,
      ).toFixed(4)}`;
    const payload = await cached(
      "match",
      `${k(groom)}__${k(bride)}`,
      async () => {
        const [g, b] = await Promise.all([
          analyze(groom),
          analyze(bride),
        ]);
        const result = gunaMilan(g.person, b.person);
        return {
          ...result,
          manglik: {
            groom: g.manglik,
            bride: b.manglik,
            combined: combineManglik(g.manglik, b.manglik),
          },
        };
      },
    );
    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "match failed" },
      { status: 500 },
    );
  }
}
