"use client";

import { useState } from "react";
import AskAstrologer from "./AskAstrologer";

const ABBR: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

const HOUSE_POS: [number, number][] = [
  [150, 78],
  [75, 40],
  [40, 78],
  [78, 150],
  [40, 222],
  [75, 260],
  [150, 222],
  [225, 260],
  [260, 222],
  [222, 150],
  [260, 78],
  [225, 40],
];

function NorthChart({ houses }: { houses: any[] }) {
  return (
    <svg className="chart-svg" viewBox="0 0 300 300">
      <rect x="1" y="1" width="298" height="298" fill="none" stroke="#4a3f6e" />
      <line x1="0" y1="0" x2="300" y2="300" />
      <line x1="300" y1="0" x2="0" y2="300" />
      <line x1="150" y1="0" x2="300" y2="150" />
      <line x1="300" y1="150" x2="150" y2="300" />
      <line x1="150" y1="300" x2="0" y2="150" />
      <line x1="0" y1="150" x2="150" y2="0" />
      {houses.map((h, i) => {
        const [x, y] = HOUSE_POS[i];
        return (
          <g key={i}>
            <text className="sign" x={x} y={y - 14} textAnchor="middle">
              {h.signIndex + 1}
            </text>
            {h.planets.map((p: string, j: number) => (
              <text key={p} x={x} y={y + 2 + j * 12} textAnchor="middle">
                {ABBR[p] ?? p}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Panchanga({ p }: { p: any }) {
  return (
    <div>
      <span className="chip">
        Vaara: <b>{p.vaara}</b>
      </span>
      <span className="chip">
        Tithi: <b>{p.tithi.name}</b> ({p.tithi.paksha})
      </span>
      <span className="chip">
        Nakshatra: <b>{p.nakshatra.name}</b>
      </span>
      <span className="chip">
        Yoga: <b>{p.yoga.name}</b>
      </span>
      <span className="chip">
        Karana: <b>{p.karana}</b>
      </span>
    </div>
  );
}

export default function Results({
  data,
  onReset,
}: {
  data: any;
  onReset: () => void;
}) {
  const c = data.chart;
  const ip = data.interpretation;
  const [tab, setTab] = useState<"chart" | "panchang">("chart");
  const [area, setArea] = useState<string | null>(null);
  const moon = c.planets.find((p: any) => p.name === "Moon");

  const dot = (s: string) =>
    s === "good" ? "st-good" : s === "challenging" ? "st-chall" : "st-okay";

  return (
    <div className="step wide">
      <div className="results-head">
        <h1>{data.input.name ? `${data.input.name}'s Kundli` : "Your Kundli"}</h1>
        <button className="btn ghost" onClick={onReset}>
          ← New chart
        </button>
      </div>
      <p className="results-sub">
        {data.input.date} · {data.input.time} · {data.input.tz} · sidereal
        (Lahiri) · Swiss Ephemeris
      </p>

      <div className="tabbar">
        <button
          className={tab === "chart" ? "on" : ""}
          onClick={() => setTab("chart")}
        >
          Kundli &amp; Dasha
        </button>
        <button
          className={tab === "panchang" ? "on" : ""}
          onClick={() => setTab("panchang")}
        >
          Panchang
        </button>
      </div>

      {tab === "chart" && (
        <>
          <div className="cards">
            <div className="glass">
              <h3>Lagna Chart · North Indian</h3>
              <NorthChart houses={c.houses} />
            </div>
            <div className="glass">
              <h3>Core</h3>
              <span className="chip">
                Lagna: <b>{c.ascendant.rashi}</b> {c.ascendant.dms}
              </span>
              <span className="chip">
                Nakshatra: <b>{c.ascendant.nakshatra}</b> (pada{" "}
                {c.ascendant.pada})
              </span>
              <span className="chip">
                Moon: <b>{moon?.rashi}</b>
              </span>
              <span className="chip">
                Janma Nakshatra: <b>{c.vimshottari.janmaNakshatra}</b>
              </span>
              <span className="chip">
                Ayanamsa: <b>{c.ayanamsaDms}</b>
              </span>
              {c.vimshottari.current && (
                <div className="now">
                  <small>Running period today</small>
                  <div>
                    {c.vimshottari.current.maha} Mahadasha —{" "}
                    {c.vimshottari.current.antar} Antardasha
                  </div>
                </div>
              )}
            </div>
          </div>

          <AskAstrologer data={data} />

          {c.navamsa && (
            <div className="cards">
              <div className="glass">
                <h3>Navamsa (D9) · Marriage &amp; Inner Promise</h3>
                <NorthChart houses={c.navamsa.houses} />
              </div>
              <div className="glass">
                <h3>Aspects (Graha Drishti)</h3>
                {c.aspects?.map((a: any) => (
                  <p key={a.from} style={{ fontSize: 13, margin: "6px 0" }}>
                    <b>{a.from}</b> aspects house
                    {a.aspects.length > 1 ? "s" : ""} {a.aspects.join(", ")}
                    {a.planetsAspected?.length > 0 && (
                      <span className="muted">
                        {" "}
                        — touching {a.planetsAspected.join(", ")}
                      </span>
                    )}
                  </p>
                ))}
                <p className="muted" style={{ fontSize: 12 }}>
                  D9 Lagna: <b>{c.navamsa.ascRashi}</b>. A planet in the same
                  sign in D1 and D9 (vargottama) gains stability.
                </p>
              </div>
            </div>
          )}

          {ip && (
            <>
              <div className="glass">
                <h3>Your Chart in Plain English</h3>
                <p style={{ marginTop: 0 }}>{ip.lagna}</p>
                <p>
                  <b>At a glance:</b> {ip.overall}
                </p>
                <div className="reading-list">
                  {ip.planetReadings.map((r: any) => (
                    <div key={r.name} className="reading-row">
                      <span className={`sdot ${dot(r.status)}`} />
                      <span>
                        <b>{r.name}</b>{" "}
                        <span className="muted">
                          · {r.status.toUpperCase()}
                        </span>
                        <br />
                        {r.text}
                      </span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12 }} className="muted">
                  {ip.disclaimer}
                </p>
              </div>

              <div className="glass">
                <h3>Running Period Today — by the numbers</h3>
                <p style={{ marginTop: 0 }}>{ip.runningPeriod}</p>
                <h3 style={{ marginTop: 22 }}>Vimshottari Dasha — in short</h3>
                <p style={{ marginBottom: 0 }}>{ip.vimshottariSummary}</p>
              </div>

              <div className="glass">
                <h3>What would you like to know?</h3>
                <p className="muted" style={{ marginTop: 0 }}>
                  Pick a life area for a focused reading from your chart.
                </p>
                <div>
                  {Object.keys(ip.areas).map((k) => (
                    <button
                      key={k}
                      className={`area-chip ${area === k ? "on" : ""}`}
                      onClick={() => setArea(area === k ? null : k)}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                {area && (
                  <div
                    className="now"
                    style={{
                      background: "rgba(139, 61, 240, 0.16)",
                      color: "var(--ink)",
                    }}
                  >
                    {ip.areas[area]}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="glass">
            <h3>Planetary Positions</h3>
            <table>
              <thead>
                <tr>
                  <th>Graha</th>
                  <th>Rashi</th>
                  <th>Degree</th>
                  <th>Nakshatra</th>
                  <th>Pada</th>
                  <th>House</th>
                  <th>Motion</th>
                </tr>
              </thead>
              <tbody>
                {c.planets.map((p: any) => (
                  <tr key={p.name}>
                    <td>
                      <b>{p.name}</b>
                    </td>
                    <td>{p.rashi}</td>
                    <td>{p.dms}</td>
                    <td>{p.nakshatra}</td>
                    <td>{p.pada}</td>
                    <td>{p.house}</td>
                    <td className={p.retrograde || p.combust ? "retro" : ""}>
                      {p.retrograde ? "Retrograde" : "Direct"}
                      {p.combust ? " · Combust" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass">
            <h3>Vimshottari Dasha</h3>
            <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
              Balance of {c.vimshottari.startLord} dasha at birth:{" "}
              {c.vimshottari.balanceYears.toFixed(2)} years.
            </p>
            {c.vimshottari.mahadashas.map((m: any) => (
              <details
                key={m.start}
                open={c.vimshottari.current?.maha === m.lord}
              >
                <summary>
                  <b>{m.lord}</b> &nbsp;{fmtDate(m.start)} → {fmtDate(m.end)}{" "}
                  <span className="muted">({m.years.toFixed(2)} yrs)</span>
                </summary>
                <table>
                  <tbody>
                    {m.antardashas?.map((a: any) => (
                      <tr key={a.start}>
                        <td style={{ paddingLeft: 22 }}>{a.lord}</td>
                        <td>{fmtDate(a.start)}</td>
                        <td>{fmtDate(a.end)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            ))}
          </div>
        </>
      )}

      {tab === "panchang" && (
        <div className="glass">
          <h3>Panchang at Birth</h3>
          <Panchanga p={data.birthPanchang} />
        </div>
      )}
    </div>
  );
}
