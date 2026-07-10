"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGES, type Lang } from "@/lib/i18n";

// Moment in welcome.mp4 when the sun rushes close to camera — the overlay
// (brand + language choices) reveals exactly then, synced to the footage.
const SUN_NEAR_AT = 10.5;

export default function CosmicWelcome({
  onPick,
}: {
  onPick: (l: Lang) => void;
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Safety net: if playback stalls or autoplay is blocked, reveal anyway.
  useEffect(() => {
    revealTimer.current = setTimeout(
      () => setRevealed(true),
      (SUN_NEAR_AT + 2.5) * 1000,
    );
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, []);

  // If the video fails entirely (CSS fallback scene), don't make people wait.
  useEffect(() => {
    if (videoFailed) {
      const t = setTimeout(() => setRevealed(true), 2500);
      return () => clearTimeout(t);
    }
  }, [videoFailed]);

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
          disablePictureInPicture
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback"
          tabIndex={-1}
          onError={() => setVideoFailed(true)}
          onLoadedData={(e) => e.currentTarget.play().catch(() => {})}
          onCanPlay={(e) => e.currentTarget.play().catch(() => {})}
          onPause={(e) => e.currentTarget.play().catch(() => {})}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime >= SUN_NEAR_AT) {
              setRevealed(true);
            }
          }}
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

      {revealed && (
        <div className="bh-content">
          <h1 className="bh-brand">TechPandit</h1>
          <div className="bh-quote">No bluff. Just real stuff.</div>
          <div className="bh-prompt">Select your language</div>
          <div className="bh-langs">
            {LANGUAGES.map((l, i) => (
              <button
                key={l.code}
                className="bh-lang"
                style={{ animationDelay: `${1.5 + i * 0.08}s` }}
                onClick={() => onPick(l.code)}
              >
                <span className="bl-nat">{l.native}</span>
                <span className="bl-eng">{l.english}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
