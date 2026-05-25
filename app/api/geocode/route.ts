import { NextRequest, NextResponse } from "next/server";
import { cached } from "@/lib/cache";

export const runtime = "nodejs";

// Free, key-less geocoding via Open-Meteo. Returns lat/lon + IANA timezone.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", q);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  try {
    const results = await cached(
      "geocode",
      q.toLowerCase(),
      async () => {
        const r = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        const data = await r.json();
        return (data.results ?? []).map((x: any) => ({
          name: x.name,
          admin1: x.admin1 ?? "",
          country: x.country ?? "",
          latitude: x.latitude,
          longitude: x.longitude,
          timezone: x.timezone,
          label: [x.name, x.admin1, x.country].filter(Boolean).join(", "),
        }));
      },
      { max: 5000, ttlMs: 1000 * 60 * 60 * 24 * 7 },
    );
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json(
      { results: [], error: e?.message ?? "geocode failed" },
      { status: 502 },
    );
  }
}
