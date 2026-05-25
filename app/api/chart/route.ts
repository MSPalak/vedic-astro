import { NextRequest, NextResponse } from "next/server";
import { toJulianDayUT } from "@/lib/time";
import { computeChart } from "@/lib/vedic";
import { computePanchang } from "@/lib/panchang";
import { interpretChart } from "@/lib/interpret";
import { cached } from "@/lib/cache";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, time, tz, lat, lon, name } = body ?? {};

    if (!date || !time || !tz || lat == null || lon == null) {
      return NextResponse.json(
        { error: "Required: date, time, tz, lat, lon" },
        { status: 400 },
      );
    }

    const { jdUT, utc, offsetMinutes } = toJulianDayUT({ date, time, tz });

    const key = `${date}|${time}|${tz}|${Number(lat).toFixed(
      4,
    )}|${Number(lon).toFixed(4)}`;
    const computed = await cached("chart", key, async () => {
      const chart = await computeChart({
        jdUT,
        lat: Number(lat),
        lon: Number(lon),
      });
      const panchang = await computePanchang(jdUT);
      const interpretation = interpretChart(chart, date);
      return { chart, panchang, interpretation };
    });

    return NextResponse.json({
      input: { name: name ?? "", date, time, tz, lat, lon },
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
