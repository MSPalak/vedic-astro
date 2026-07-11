"use client";

import { useRef, useState } from "react";
import { saveReading } from "@/lib/db";

// Downscale to a max edge and re-encode as JPEG so the upload stays small
// and within the API's size cap, regardless of the phone camera's megapixels.
function resizeToDataUrl(file: File, maxEdge = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

export default function PalmReading({
  t,
  onBack,
}: {
  t: any;
  onBack: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    setReading(null);
    try {
      const dataUrl = await resizeToDataUrl(file);
      setPreview(dataUrl);
      await analyze(dataUrl);
    } catch (ex: any) {
      setErr(ex.message || "Could not process that photo.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function analyze(dataUrl: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/palm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Reading failed.");
      setReading(d.reading);
      if (d.source === "ai") {
        saveReading("palm", `Palm reading · ${new Date().toDateString()}`, {
          reading: d.reading,
        });
      }
    } catch (ex: any) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setPreview(null);
    setReading(null);
    setErr("");
    fileRef.current?.click();
  }

  return (
    <div className="step wide">
      <div className="results-head">
        <h1>{t.palmTitle ?? "Palm Reading"}</h1>
        <button className="btn ghost" onClick={onBack}>
          ← Menu
        </button>
      </div>
      <p className="results-sub">{t.palmSub}</p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={onFile}
      />

      <div className="cards">
        <div className="glass" style={{ textAlign: "center" }}>
          {preview ? (
            <img
              src={preview}
              alt="Your palm"
              className="palm-photo"
            />
          ) : (
            <div className="palm-drop" onClick={() => fileRef.current?.click()}>
              <div className="palm-emoji">🖐️</div>
              <div>{t.palmUpload ?? "Choose or capture palm photo"}</div>
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <button
              className="btn"
              onClick={() => (preview ? reset() : fileRef.current?.click())}
              disabled={busy}
            >
              {busy
                ? t.palmAnalyzing ?? "Reading your palm…"
                : preview
                  ? t.palmRetake ?? "Try another photo"
                  : t.palmUpload ?? "Choose photo"}
            </button>
          </div>
          {err && <p className="err">{err}</p>}
        </div>

        <div className="glass">
          <h3>Your Reading</h3>
          {busy && (
            <div className="chat-msg assistant typing" style={{ marginTop: 8 }}>
              <span />
              <span />
              <span />
            </div>
          )}
          {reading ? (
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{reading}</p>
          ) : (
            !busy && (
              <p className="muted" style={{ marginTop: 0 }}>
                Your palm reading will appear here once you add a photo.
              </p>
            )
          )}
          {reading && (
            <p className="muted" style={{ fontSize: 12 }}>
              Palmistry is a traditional art for reflection — it describes
              tendencies, not fixed fate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
