"use client";

import { useEffect, useState } from "react";
import PlaceInput, { type GeoResult } from "./PlaceInput";
import { saveReading } from "@/lib/db";

// Animated count-up ring: sweeps the conic fill and counts the score.
function ScoreRing({
  total,
  percent,
  tone,
}: {
  total: number;
  percent: number;
  tone: string;
}) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1300;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      setT(ease);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total, percent]);

  return (
    <div
      className={`score-ring ${tone}`}
      style={{ ["--p" as any]: `${percent * t}%` }}
    >
      <div>
        <strong>{(total * t).toFixed(1).replace(/\.0$/, "")}</strong>
        <span>/ 36</span>
      </div>
    </div>
  );
}

type P = {
  name: string;
  date: string;
  time: string;
  place: GeoResult | null;
};

const blank = (): P => ({ name: "", date: "", time: "", place: null });

function PersonForm({
  title,
  side,
  p,
  set,
}: {
  title: string;
  side: string;
  p: P;
  set: (p: P) => void;
}) {
  return (
    <div className="panel">
      <div className="kicker" style={{ marginBottom: 16 }}>
        {side} · {title}
      </div>
      <div className="field">
        <label>Full name</label>
        <input
          value={p.name}
          placeholder="Name"
          onChange={(e) => set({ ...p, name: e.target.value })}
        />
      </div>
      <div className="two">
        <div className="field">
          <label>Date of birth</label>
          <input
            type="date"
            value={p.date}
            onChange={(e) => set({ ...p, date: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Time of birth</label>
          <input
            type="time"
            value={p.time}
            onChange={(e) => set({ ...p, time: e.target.value })}
          />
        </div>
      </div>
      <PlaceInput
        label="Place of birth"
        placeholder="Start typing a city…"
        picked={p.place}
        onPick={(g) => set({ ...p, place: g })}
      />
    </div>
  );
}

export default function MatchMaking({
  t,
  onBack,
}: {
  t: any;
  onBack: () => void;
}) {
  const [groom, setGroom] = useState<P>(blank);
  const [bride, setBride] = useState<P>(blank);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<any>(null);

  const ready = (x: P) => x.date && x.time && x.place;

  async function match() {
    if (!ready(groom) || !ready(bride)) {
      setErr("Please fill date, time and place for both people.");
      return;
    }
    setErr("");
    setLoading(true);
    setRes(null);
    try {
      const body = {
        groom: {
          name: groom.name,
          date: groom.date,
          time: groom.time,
          tz: groom.place!.timezone,
          lat: groom.place!.latitude,
          lon: groom.place!.longitude,
        },
        bride: {
          name: bride.name,
          date: bride.date,
          time: bride.time,
          tz: bride.place!.timezone,
          lat: bride.place!.latitude,
          lon: bride.place!.longitude,
        },
      };
      const r = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Match failed");
      setRes(d);
      saveReading(
        "match",
        `${groom.name || "Groom"} & ${bride.name || "Bride"} · ${d.total}/36`,
        d,
      );
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (res) {
    const tone =
      res.percent >= 67 ? "st-good" : res.percent >= 50 ? "st-okay" : "st-chall";
    return (
      <div className="step wide">
        <div className="results-head">
          <h1>
            {res.groom.name || "Groom"} &amp; {res.bride.name || "Bride"}
          </h1>
          <button className="btn ghost" onClick={() => setRes(null)}>
            ← Edit details
          </button>
        </div>

        <div className="glass" style={{ textAlign: "center" }}>
          <ScoreRing total={res.total} percent={res.percent} tone={tone} />
          <h2 style={{ margin: "10px 0 4px" }}>
            {res.percent}% compatibility
          </h2>
          <p style={{ fontSize: 17, fontWeight: 700, margin: "6px 0" }}>
            {res.verdict}
          </p>
          <p className="muted" style={{ marginTop: 0 }}>
            {res.confidence}
          </p>
          {(res.doshas.nadi || res.doshas.bhakoot) && (
            <div className="now" style={{ display: "inline-block" }}>
              {res.doshas.nadi && <span>⚠ Nadi Dosha&nbsp;&nbsp;</span>}
              {res.doshas.bhakoot && <span>⚠ Bhakoot Dosha</span>}
            </div>
          )}
        </div>

        {res.manglik && (
          <div className="glass">
            <h3>Mangal Dosha (Manglik)</h3>
            <div className="two">
              <div>
                <b>{res.groom.name || "Groom"}:</b>{" "}
                <span
                  className={
                    res.manglik.groom.isManglik ? "retro" : "muted"
                  }
                >
                  {res.manglik.groom.isManglik
                    ? `Manglik (${res.manglik.groom.severity})`
                    : "Not Manglik"}
                </span>
                <p className="muted" style={{ fontSize: 13 }}>
                  {res.manglik.groom.note}
                </p>
              </div>
              <div>
                <b>{res.bride.name || "Bride"}:</b>{" "}
                <span
                  className={
                    res.manglik.bride.isManglik ? "retro" : "muted"
                  }
                >
                  {res.manglik.bride.isManglik
                    ? `Manglik (${res.manglik.bride.severity})`
                    : "Not Manglik"}
                </span>
                <p className="muted" style={{ fontSize: 13 }}>
                  {res.manglik.bride.note}
                </p>
              </div>
            </div>
            <div
              className="now"
              style={{
                background:
                  res.manglik.combined.status === "caution"
                    ? undefined
                    : "rgba(31, 170, 107, 0.16)",
                color:
                  res.manglik.combined.status === "caution"
                    ? "#fff"
                    : "var(--ink)",
              }}
            >
              <small>Verdict</small>
              <div style={{ fontSize: 15 }}>
                {res.manglik.combined.text}
              </div>
            </div>
          </div>
        )}

        <div className="glass">
          <h3>The eight kootas — in plain English</h3>
          <p className="muted" style={{ marginTop: 0 }}>
            {res.groom.name || "Groom"}: Moon in {res.groom.rashi},{" "}
            {res.groom.nak} nakshatra · {res.bride.name || "Bride"}: Moon in{" "}
            {res.bride.rashi}, {res.bride.nak} nakshatra
          </p>
          <table>
            <thead>
              <tr>
                <th>Koota</th>
                <th>Score</th>
                <th>What it means</th>
              </tr>
            </thead>
            <tbody>
              {res.kootas.map((k: any) => (
                <tr key={k.name}>
                  <td>
                    <b>{k.name}</b>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {k.got} / {k.max}
                  </td>
                  <td>{k.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass">
          <h3>Bottom line</h3>
          <p style={{ marginTop: 0 }}>{res.summary}</p>
          <p className="muted" style={{ fontSize: 12 }}>
            {res.disclaimer}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="step wide">
      <div className="results-head">
        <h1>Match Making · Guna Milan</h1>
        <button className="btn ghost" onClick={onBack}>
          ← Menu
        </button>
      </div>
      <p className="results-sub">
        Enter both birth details. Compatibility is computed from the Moon's
        nakshatra & sign using the classical 36-point Ashtakoota system.
      </p>
      <div className="cards">
        <PersonForm
          title={t.groom ?? "Groom's details"}
          side="Left"
          p={groom}
          set={setGroom}
        />
        <PersonForm
          title={t.bride ?? "Bride's details"}
          side="Right"
          p={bride}
          set={setBride}
        />
      </div>
      <div className="row-actions" style={{ justifyContent: "center" }}>
        <button className="btn" onClick={match} disabled={loading}>
          {loading ? t.matching ?? "Matching…" : `${t.matchBtn ?? "Check compatibility"} ❤`}
        </button>
      </div>
      {err && <p className="err" style={{ textAlign: "center" }}>{err}</p>}
    </div>
  );
}
