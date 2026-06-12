import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  agentEnabled,
  askAstrologer,
  buildChartContext,
  ruleBasedAnswer,
  type AskTurn,
} from "@/lib/astrologer";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, data, history } = body ?? {};

    if (!question || typeof question !== "string" || !question.trim()) {
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
    const turns: AskTurn[] = Array.isArray(history)
      ? history
          .filter(
            (t: any) =>
              (t?.role === "user" || t?.role === "assistant") &&
              typeof t?.content === "string",
          )
          .map((t: any) => ({ role: t.role, content: t.content }))
      : [];

    const { answer, cached } = await askAstrologer(
      context,
      question.trim(),
      turns,
    );
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
