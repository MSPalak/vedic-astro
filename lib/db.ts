"use client";

// Client-side persistence via Supabase with Row Level Security.
// Every function is a silent no-op when auth isn't configured or the
// visitor isn't signed in — the app never depends on storage to work.

import { authEnabled, supabase } from "./auth";

async function currentUserId(): Promise<string | null> {
  if (!authEnabled) return null;
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}

export async function saveReading(
  kind: "kundli" | "match" | "palm",
  title: string,
  payload: unknown,
): Promise<void> {
  try {
    const uid = await currentUserId();
    if (!uid) return;
    await supabase()!
      .from("readings")
      .insert({ user_id: uid, kind, title, payload });
  } catch {
    // storage must never break the reading itself
  }
}

export async function saveQuestion(
  question: string,
  answer: string,
  chart?: { name?: string; date?: string },
): Promise<void> {
  try {
    const uid = await currentUserId();
    if (!uid) return;
    await supabase()!.from("questions").insert({
      user_id: uid,
      question,
      answer,
      chart_name: chart?.name ?? null,
      chart_date: chart?.date ?? null,
    });
  } catch {
    /* no-op */
  }
}

export interface StoredQuestion {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

export async function loadRecentQuestions(
  limit = 5,
): Promise<StoredQuestion[]> {
  try {
    const uid = await currentUserId();
    if (!uid) return [];
    const { data } = await supabase()!
      .from("questions")
      .select("id, question, answer, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}
