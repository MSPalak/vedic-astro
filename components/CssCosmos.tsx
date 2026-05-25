"use client";

import { useMemo } from "react";

// Pure-CSS pseudo-3D solar system. Used when WebGL is unavailable so the
// cinematic scene never breaks.
const ORBITS = [
  { size: 210, dur: 16, color: "#c98a5e", dot: 11 },
  { size: 330, dur: 24, color: "#f0c060", dot: 17 },
  { size: 470, dur: 34, color: "#4f9dde", dot: 19 },
  { size: 630, dur: 46, color: "#e2674a", dot: 15 },
  { size: 810, dur: 64, color: "#e0b15a", dot: 27 },
  { size: 1010, dur: 88, color: "#d8b66a", dot: 23 },
];

export default function CssCosmos() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        d: 2 + Math.random() * 4,
        delay: Math.random() * 4,
        s: 1 + Math.random() * 2,
      })),
    [],
  );

  return (
    <div className="css-cosmos" aria-hidden>
      {stars.map((st, i) => (
        <span
          key={i}
          className="cc-star"
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
      <div className="cc-sun" />
      {ORBITS.map((o, i) => (
        <div
          key={i}
          className="cc-orbit"
          style={{
            width: o.size,
            height: o.size,
            animationDuration: `${o.dur}s`,
            animationDelay: `${-o.dur * (i * 0.13)}s`,
          }}
        >
          <span
            className="cc-planet"
            style={{
              width: o.dot,
              height: o.dot,
              background: `radial-gradient(circle at 30% 30%, #fff, ${o.color})`,
              boxShadow: `0 0 16px ${o.color}aa`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
