import { NextRequest, NextResponse } from "next/server";
import { drawReading } from "@/lib/tarot";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = typeof body?.question === "string" ? body.question : "";
    const count = [1, 3, 5].includes(body?.count) ? body.count : 3;
    return NextResponse.json(drawReading(question, count));
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "tarot failed" },
      { status: 500 },
    );
  }
}
