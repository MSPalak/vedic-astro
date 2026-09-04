import { NextResponse } from "next/server";
import { getSwe } from "@/lib/astro/swe";

export const runtime = "nodejs";

// Liveness + readiness. Touches the WASM engine so warm-up pings keep the
// Swiss Ephemeris instance loaded (avoids cold re-init under autoscaling).
export async function GET() {
  try {
    const swe = await getSwe();
    const v = typeof swe.version === "function" ? swe.version() : "ok";
    return NextResponse.json({
      status: "ok",
      engine: "swiss-ephemeris",
      version: v,
      time: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: "degraded", error: e?.message ?? "engine init failed" },
      { status: 503 },
    );
  }
}
