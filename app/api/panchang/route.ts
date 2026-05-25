import { NextRequest, NextResponse } from "next/server";
import { toJulianDayUT } from "@/lib/time";
import { computePanchang } from "@/lib/panchang";

export const runtime = "nodejs";

// Daily Panchang for any date (defaults to local noon of the given zone).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, time, tz } = body ?? {};
    if (!date || !tz) {
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
