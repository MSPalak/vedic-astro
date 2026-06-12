"use client";

import { useMemo, useState } from "react";
import { LANGUAGES, type Lang } from "@/lib/i18n";

// Welcome screen: the black-hole video plays full-screen the moment the
// site opens; the title and language choices fade in over it within
// seconds. If the video can't play, a pure-CSS revolving black hole
// (accretion disk + starfield) takes its place automatically.
export default function CosmicWelcome({
  onPick,
}: {
  onPick: (l: Lang) => void;
}) {
  const [videoFailed, setVideoFailed] = useState(false);

  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        s: 1 + Math.random() * 2,
        d: 2 + Math.random() * 5,
        delay: Math.random() * 5,
      })),
    [],
  );

  return (
    <div className="bh-scene">
      {!videoFailed ? (
        <video
          className="bh-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
        >
          <source src="/welcome.mp4" type="video/mp4" />
        </video>
      ) : (
        <>
          {stars.map((st, i) => (
            <span
              key={i}
              className="bh-star"
              style={{
                top: `${st.top}%`,
                left: `${st.left}%`,
                width: st.s,
                height: st.s,
                animationDuration: `${st.d}s`,
                animationDelay: `${st.delay}s`,
              }}
            />
          ))}
          <div className="bh-wrap" aria-hidden>
            <div className="bh-beam" />
            <div className="bh-disk d1" />
            <div className="bh-disk d2" />
            <div className="bh-haze" />
            <div className="bh-core" />
          </div>
        </>
      )}

      <div className="bh-shade" aria-hidden />

      <div className="bh-content">
        <h1 className="bh-title">Jyotish</h1>
        <div className="bh-sub">वैदिक ज्योतिष · written in the stars</div>
        <div className="bh-prompt">Select your language</div>
        <div className="bh-langs">
          {LANGUAGES.map((l, i) => (
            <button
              key={l.code}
              className="bh-lang"
              style={{ animationDelay: `${3.4 + i * 0.1}s` }}
              onClick={() => onPick(l.code)}
            >
              <span className="bl-nat">{l.native}</span>
              <span className="bl-eng">{l.english}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
