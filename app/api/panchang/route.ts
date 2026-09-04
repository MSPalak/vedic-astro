import { NextRequest, NextResponse } from "next/server";
import { toJulianDayUT } from "@/lib/astro/time";
import { computePanchang } from "@/lib/astro/panchang";
import { clientIp, rateLimit, tooMany } from "@/lib/server/ratelimit";
import { isDateStr, isTimeStr, isTzStr } from "@/lib/server/validate";

export const runtime = "nodejs";

// Daily Panchang for any date (defaults to local noon of the given zone).
export async function POST(req: NextRequest) {
  const rl = rateLimit(`panchang:${clientIp(req)}`, 30, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfterSec);

  try {
    const body = await req.json();
    const { date, time, tz } = body ?? {};
    if (!isDateStr(date) || !isTzStr(tz) || (time && !isTimeStr(time))) {
      return NextResponse.json(
        { error: "Required: date, tz" },
        { status: 400 },
      );
    }
    const { jdUT, utc } = toJulianDayUT({
      date,
      time: time || "12:00",
      tz,
    });
    const panchang = await computePanchang(jdUT);
    return NextResponse.json({ input: { date, time: time || "12:00", tz }, utc, panchang });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "panchang failed" },
      { status: 500 },
    );
  }
}
