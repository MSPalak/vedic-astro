"use client";

import { useRef, useState } from "react";

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
  const listRef = useRef<HTMLDivElement>(null);

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
