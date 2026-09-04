import { NextRequest, NextResponse } from "next/server";
import { toJulianDayUT } from "@/lib/astro/time";
import { computeChart } from "@/lib/astro/vedic";
import { computePanchang } from "@/lib/astro/panchang";
import { interpretChart } from "@/lib/astro/interpret";
import { cached } from "@/lib/cache";
import { clientIp, rateLimit, tooMany } from "@/lib/server/ratelimit";
import { parseBirth } from "@/lib/server/validate";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const rl = rateLimit(`chart:${clientIp(req)}`, 30, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfterSec);

  try {
    const body = await req.json().catch(() => null);
    const birth = parseBirth(body, "Birth details");
    if (!birth.ok) {
      return NextResponse.json({ error: birth.error }, { status: 400 });
    }
    const { name, date, time, tz, lat, lon } = birth.value;

    const { jdUT, utc, offsetMinutes } = toJulianDayUT({ date, time, tz });

    const key = `${date}|${time}|${tz}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
    const computed = await cached("chart", key, async () => {
      const chart = await computeChart({ jdUT, lat, lon });
      const panchang = await computePanchang(jdUT);
      const interpretation = interpretChart(chart, date);
      return { chart, panchang, interpretation };
    });

    return NextResponse.json({
      input: { name, date, time, tz, lat, lon },
      meta: { jdUT, utc, offsetMinutes },
      chart: computed.chart,
      birthPanchang: computed.panchang,
      interpretation: computed.interpretation,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "calculation failed" },
      { status: 500 },
    );
  }
}
