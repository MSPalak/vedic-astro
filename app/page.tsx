"use client";

import { useEffect, useState } from "react";
import { STRINGS, type Lang } from "@/lib/i18n";
import { authEnabled, supabase } from "@/lib/auth";
import Results from "@/components/Results";
import MatchMaking from "@/components/MatchMaking";
import PalmReading from "@/components/PalmReading";
import CosmicWelcome from "@/components/CosmicWelcome";
import PlaceInput, { type GeoResult } from "@/components/PlaceInput";

type Step =
  | "lang"
  | "menu"
  | "kundli"
  | "kundliResult"
  | "match"
  | "palm";

export default function Page() {
  const [step, setStep] = useState<Step>("lang");
  const [lang, setLang] = useState<Lang>("en");
  const [authed, setAuthed] = useState(!authEnabled);
  const t = STRINGS[lang];

  useEffect(() => {
    if (!authEnabled) return;
    const sb = supabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      if (data.session) setAuthed(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setAuthed(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // No sign-in gate: choosing a language goes straight in. Accounts can
  // come later as an optional feature, never as friction.
  const afterLanguage = () => setStep("menu");

  const [name, setName] = useState("");
  const [date, setDate] = useState("1995-08-15");
  const [time, setTime] = useState("10:30");
  const [place, setPlace] = useState<GeoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<any>(null);

  async function generate() {
    if (!place) {
      setErr(t.pickPlace);
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          date,
          time,
          tz: place.timezone,
          lat: place.latitude,
          lon: place.longitude,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Calculation failed");
      setRes(d);
      setStep("kundliResult");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const services = [
    { key: "kundli", title: t.svcKundli, desc: t.svcKundliDesc, on: true },
    { key: "match", title: t.svcMatch, desc: t.svcMatchDesc, on: true },
    {
      key: "palm",
      title: t.svcPalm,
      desc: t.svcPalmDesc,
      on: true,
    },
  ];

  const goto = (key: string): Step =>
    key === "kundli" ? "kundli" : key === "match" ? "match" : "palm";

  return (
    <>
      <div className="scene" />

      <div className="stage">
        {step === "lang" && (
          <CosmicWelcome
            key="lang"
            onPick={(code) => {
              setLang(code);
              afterLanguage();
            }}
          />
        )}

        {step === "menu" && (
          <div className="step" key="menu">
            <div className="kicker">TechPandit</div>
            <h1 className="brand">{t.menuTitle}</h1>
            <p className="lead">{t.menuSub}</p>
            <div className="svc-grid">
              {services.map((s) => (
                <div
                  key={s.key}
                  className={`svc ${s.on ? "" : "off"}`}
                  onClick={() => {
                    if (!s.on) return;
                    setErr("");
                    setRes(null);
                    setStep(goto(s.key) as Step);
                  }}
                >
                  <div className="svc-title">{s.title}</div>
                  <div className="svc-desc">
                    {s.on ? s.desc : t.comingSoon}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn ghost"
              style={{ marginTop: 22 }}
              onClick={() => setStep("lang")}
            >
              {t.back}
            </button>
          </div>
        )}

        {step === "kundli" && (
          <div className="step" key="kundli">
            <h1 className="brand" style={{ fontSize: "clamp(28px,5vw,44px)" }}>
              {t.detailsTitle}
            </h1>
            <p className="lead">{t.welcomeSub}</p>
            <div className="panel">
              <div className="field">
                <label>{t.fullName}</label>
                <input
                  value={name}
                  placeholder={t.namePlaceholder}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="two">
                <div className="field">
                  <label>{t.dob}</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>{t.tob}</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <PlaceInput
                label={t.place}
                placeholder={t.placePlaceholder}
                onPick={setPlace}
                picked={place}
              />
              <div className="row-actions">
                <button className="btn" onClick={generate} disabled={loading}>
                  {loading ? t.calculating : `${t.generate} ✦`}
                </button>
                <button
                  className="btn ghost"
                  onClick={() => setStep("menu")}
                >
                  {t.back}
                </button>
              </div>
              {err && <p className="err">{err}</p>}
            </div>
          </div>
        )}

        {step === "kundliResult" && res && (
          <Results data={res} onReset={() => setStep("kundli")} />
        )}

        {step === "match" && (
          <MatchMaking t={t} onBack={() => setStep("menu")} />
        )}

        {step === "palm" && (
          <PalmReading t={t} onBack={() => setStep("menu")} />
        )}
      </div>
    </>
  );
}
