import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { palmEnabled, readPalm } from "@/lib/ai/palm";
import { clientIp, rateLimit, tooMany } from "@/lib/server/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const rl = rateLimit(`palm:${clientIp(req)}`, 6, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfterSec);

  try {
    const { image } = (await req.json()) ?? {};
    if (typeof image !== "string" || !image) {
      return NextResponse.json(
        { error: "Required: image (a palm photo)" },
        { status: 400 },
      );
    }

    if (!palmEnabled) {
      return NextResponse.json({
        reading:
          "Palm reading looks at the actual lines in your photo, so it needs the AI vision key to work. Once ANTHROPIC_API_KEY is set (locally or on the host), this will read your palm live. Kundli, matchmaking and dasha all work without it — those run on real astronomical math.",
        source: "disabled",
      });
    }

    // Accept a data URL ("data:image/jpeg;base64,...") or bare base64.
    let mediaType = "image/jpeg";
    let data = image;
    const m = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.*)$/);
    if (m) {
      mediaType = m[1];
      data = m[2];
    }
    if (!ALLOWED.includes(mediaType)) {
      return NextResponse.json(
        { error: "Please use a JPEG, PNG or WebP photo." },
        { status: 400 },
      );
    }
    // Guard payload size (base64 ~4/3 of bytes); cap ~6MB of image.
    if (data.length > 8_000_000) {
      return NextResponse.json(
        { error: "That image is too large — please use a smaller photo." },
        { status: 413 },
      );
    }

    const { reading } = await readPalm(data, mediaType);
    return NextResponse.json({ reading, source: "ai" });
  } catch (e: any) {
    if (e instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "AI key invalid — check ANTHROPIC_API_KEY" },
        { status: 502 },
      );
    }
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "The palmist is busy right now — try again in a minute." },
        { status: 429 },
      );
    }
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI service error (${e.status})` },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: e?.message ?? "palm reading failed" },
      { status: 500 },
    );
  }
}
