"use client";

import { useState } from "react";

export default function Tarot({
  t,
  onBack,
}: {
  t: any;
  onBack: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState("");

  async function draw() {
    setErr("");
    setLoading(true);
    setRes(null);
    try {
      const r = await fetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, count }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Draw failed");
      setRes(d);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="step wide">
      <div className="results-head">
        <h1>Tarot Reading</h1>
        <button className="btn ghost" onClick={onBack}>
          ← Menu
        </button>
      </div>
      <p className="results-sub">
        Focus on a question, choose a spread, and draw. Cards may appear
        reversed — each reading is unique.
      </p>

      <div className="panel">
        <div className="field">
          <label>Your question (optional)</label>
          <input
            value={question}
            placeholder="e.g. How will my career move this year?"
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Spread</label>
          <div>
            {[
              [1, "Single card"],
              [3, "Past · Present · Future"],
              [5, "Five-card"],
            ].map(([n, lbl]) => (
              <button
                key={n as number}
                className={`area-chip ${count === n ? "on" : ""}`}
                onClick={() => setCount(n as number)}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div className="row-actions">
          <button className="btn" onClick={draw} disabled={loading}>
            {loading ? "Shuffling the deck…" : "Draw the cards 🔮"}
          </button>
        </div>
        {err && <p className="err">{err}</p>}
      </div>

      {res && (
        <>
          <div className="tarot-row">
            {res.cards.map((c: any, i: number) => (
              <div
                className="tcard"
                key={i}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="tcard-pos">{c.position}</div>
                <div className={`tcard-face ${c.reversed ? "rev" : ""}`}>
                  <div className="tcard-glyph">
                    {c.group === "Major" ? "✦" : "❖"}
                  </div>
                  <div className="tcard-name">{c.name}</div>
                  {c.reversed && (
                    <div className="tcard-badge">Reversed</div>
                  )}
                </div>
                <div className="tcard-mean">{c.meaning}</div>
              </div>
            ))}
          </div>

          <div className="glass">
            <h3>Your reading — {res.spread}</h3>
            <p style={{ marginTop: 0 }}>{res.synthesis}</p>
            <p className="muted" style={{ fontSize: 12 }}>
              {res.disclaimer}
            </p>
            <button className="btn ghost" onClick={draw}>
              ↻ Draw again
            </button>
          </div>
        </>
      )}
    </div>
  );
}
