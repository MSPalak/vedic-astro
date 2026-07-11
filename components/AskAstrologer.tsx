"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadRecentQuestions,
  saveQuestion,
  type StoredQuestion,
} from "@/lib/db";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "When will my career take off?",
  "What does my current dasha mean for me?",
  "What are my strengths according to this chart?",
  "When is a good period for marriage?",
];

export default function AskAstrologer({ data }: { data: any }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [past, setPast] = useState<StoredQuestion[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  // Signed-in visitors see their recent questions (silent no-op otherwise).
  useEffect(() => {
    loadRecentQuestions(5).then(setPast);
  }, []);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    setErr("");
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setBusy(true);
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, data, history: msgs }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "The astrologer could not answer.");
      setMsgs((m) => [...m, { role: "assistant", content: d.answer }]);
      // Stored to the user's account when signed in; no-op for guests.
      saveQuestion(question, d.answer, {
        name: data?.input?.name,
        date: data?.input?.date,
      });
      setTimeout(
        () => listRef.current?.scrollTo({ top: 99999, behavior: "smooth" }),
        60,
      );
    } catch (e: any) {
      setErr(e.message);
      setMsgs((m) => m.slice(0, -1));
      setInput(question);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass">
      <h3>Ask the Astrologer</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Free-form questions, answered from your actual chart — placements,
        aspects and real dasha dates.
      </p>

      {msgs.length === 0 && (
        <div style={{ marginBottom: 14 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} className="area-chip" onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {past.length > 0 && msgs.length === 0 && (
        <details style={{ marginBottom: 14, borderBottom: "none" }}>
          <summary>Your previous questions ({past.length})</summary>
          <div style={{ padding: "4px 0 8px" }}>
            {past.map((q) => (
              <div key={q.id} style={{ margin: "10px 0" }}>
                <p style={{ margin: 0, fontSize: 13.5 }}>
                  <b>{q.question}</b>
                </p>
                <p
                  className="muted"
                  style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.6 }}
                >
                  {q.answer.length > 280
                    ? q.answer.slice(0, 280) + "…"
                    : q.answer}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}

      {msgs.length > 0 && (
        <div className="chat-list" ref={listRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="chat-msg assistant typing">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      )}

      <div className="chat-row">
        <input
          value={input}
          placeholder="Ask anything about your chart…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
          disabled={busy}
        />
        <button className="btn" onClick={() => ask(input)} disabled={busy}>
          {busy ? "…" : "Ask ✦"}
        </button>
      </div>
      {err && <p className="err">{err}</p>}
    </div>
  );
}
