"use client";

import { useEffect, useRef, useState } from "react";

export type GeoResult = {
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export default function PlaceInput({
  label,
  placeholder,
  onPick,
  picked,
}: {
  label: string;
  placeholder: string;
  onPick: (g: GeoResult | null) => void;
  picked: GeoResult | null;
}) {
  const [q, setQ] = useState("");
  const [list, setList] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!q || q.length < 2) {
      setList([]);
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setList(d.results ?? []);
      setOpen(true);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [q]);

  return (
    <div className="field suggest">
      <label>{label}</label>
      <input
        value={picked ? picked.label : q}
        placeholder={placeholder}
        onChange={(e) => {
          setQ(e.target.value);
          onPick(null);
        }}
        onFocus={() => list.length > 0 && setOpen(true)}
      />
      {open && list.length > 0 && (
        <div className="suggest-list">
          {list.map((g, i) => (
            <div
              key={i}
              onClick={() => {
                onPick(g);
                setOpen(false);
              }}
            >
              {g.label}
              <div className="sm">
                {g.latitude.toFixed(2)}, {g.longitude.toFixed(2)} ·{" "}
                {g.timezone}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
