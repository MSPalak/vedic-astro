import { NextRequest, NextResponse } from "next/server";
import { toJulianDayUT } from "@/lib/astro/time";
import { computeChart } from "@/lib/astro/vedic";
import { gunaMilan, type Person } from "@/lib/astro/matchmaking";
import { manglikStatus, combineManglik } from "@/lib/astro/manglik";
import { cached } from "@/lib/cache";
import { clientIp, rateLimit, tooMany } from "@/lib/server/ratelimit";
import { parseBirth, type BirthInput } from "@/lib/server/validate";

export const runtime = "nodejs";
export const maxDuration = 30;

async function analyze(p: BirthInput): Promise<{
  person: Person;
  manglik: ReturnType<typeof manglikStatus>;
}> {
  const { jdUT } = toJulianDayUT({ date: p.date, time: p.time, tz: p.tz });
  const chart = await computeChart({ jdUT, lat: p.lat, lon: p.lon });
  const find = (n: string) => {
    const x = chart.planets.find((q: any) => q.name === n);
    if (!x) throw new Error(`${n} not found in chart`);
    return x;
  };
  const moon = find("Moon");
  const mars = find("Mars");
  const venus = find("Venus");
  return {
    person: {
      name: p.name,
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
  const rl = rateLimit(`match:${clientIp(req)}`, 20, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfterSec);

  try {
    const body = await req.json().catch(() => null);
    const g = parseBirth(body?.groom, "Groom");
    if (!g.ok) return NextResponse.json({ error: g.error }, { status: 400 });
    const b = parseBirth(body?.bride, "Bride");
    if (!b.ok) return NextResponse.json({ error: b.error }, { status: 400 });

    const k = (p: BirthInput) =>
      `${p.date}|${p.time}|${p.tz}|${p.lat.toFixed(4)}|${p.lon.toFixed(4)}`;

    const payload = await cached(
      "match",
      `${k(g.value)}__${k(b.value)}`,
      async () => {
        const [ga, ba] = await Promise.all([
          analyze(g.value),
          analyze(b.value),
        ]);
        const result = gunaMilan(ga.person, ba.person);
        return {
          ...result,
          manglik: {
            groom: ga.manglik,
            bride: ba.manglik,
            combined: combineManglik(ga.manglik, ba.manglik),
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
