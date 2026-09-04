import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  agentEnabled,
  askAstrologer,
  buildChartContext,
  ruleBasedAnswer,
  type AskTurn,
} from "@/lib/ai/astrologer";
import { clientIp, rateLimit, tooMany } from "@/lib/server/ratelimit";
import { cleanText } from "@/lib/server/validate";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BODY_BYTES = 120_000; // chart payload + short history, generously

export async function POST(req: NextRequest) {
  const rl = rateLimit(`ask:${clientIp(req)}`, 10, 60_000);
  if (!rl.ok) return tooMany(rl.retryAfterSec);

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    const body = JSON.parse(raw || "null");
    const question = cleanText(body?.question, 500);
    const data = body?.data;

    if (!question) {
      return NextResponse.json({ error: "Required: question" }, { status: 400 });
    }
    if (!data?.chart) {
      return NextResponse.json(
        { error: "Required: data (the generated chart payload)" },
        { status: 400 },
      );
    }

    if (!agentEnabled) {
      return NextResponse.json({
        answer: ruleBasedAnswer(data, question),
        source: "rules",
      });
    }

    const context = buildChartContext(data);
    const turns: AskTurn[] = Array.isArray(body?.history)
      ? body.history
          .slice(-10)
          .filter(
            (t: any) =>
              (t?.role === "user" || t?.role === "assistant") &&
              typeof t?.content === "string",
          )
          .map((t: any) => ({
            role: t.role,
            content: cleanText(t.content, 4000),
          }))
      : [];

    const { answer, cached } = await askAstrologer(context, question, turns);
    return NextResponse.json({ answer, source: "ai", cached });
  } catch (e: any) {
    if (e instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "AI key invalid — check ANTHROPIC_API_KEY" },
        { status: 502 },
      );
    }
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "The astrologer is busy right now — try again in a minute." },
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
      { error: e?.message ?? "ask failed" },
      { status: 500 },
    );
  }
}
