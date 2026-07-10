"use client";

import { useState } from "react";
import { authEnabled, supabase } from "@/lib/auth";

type Mode = "phone" | "email" | "otp";

// Sign-in step, shown after language select. Moon-phase video backdrop.
// With Supabase configured: phone OTP / email / Google, plus guest skip.
// Without it: a warm ask with guest continue, so the flow never blocks.
export default function Login({ onDone }: { onDone: () => void }) {
  const sb = supabase();
  const [mode, setMode] = useState<Mode>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await fn();
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = () =>
    wrap(async () => {
      const { error } = await sb!.auth.signInWithOtp({ phone });
      if (error) throw error;
      setMode("otp");
      setMsg(`Code sent to ${phone}`);
    });

  const verifyOtp = () =>
    wrap(async () => {
      const { error } = await sb!.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      onDone();
    });

  const emailAuth = (signup: boolean) =>
    wrap(async () => {
      const { error } = signup
        ? await sb!.auth.signUp({ email, password: pw })
        : await sb!.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
      if (signup) setMsg("Check your email to confirm, then sign in.");
      else onDone();
    });

  const google = () =>
    wrap(async () => {
      const { error } = await sb!.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    });

  return (
    <>
      {/* Backdrop lives outside the animated wrapper: a transform ancestor
          would turn position:fixed into wrapper-relative and clip the video. */}
      <video
        className="page-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        tabIndex={-1}
        onPause={(e) => e.currentTarget.play().catch(() => {})}
      >
        <source src="/login.mp4" type="video/mp4" />
      </video>
      <div className="page-shade" aria-hidden />

      <div className="video-page">
        <div className="kicker">TechPandit</div>
        <h1 className="brand" style={{ fontSize: "clamp(30px,6vw,52px)" }}>
          Sign in to continue
        </h1>
        <p className="lead">Your readings stay private and saved to you.</p>

        <div className="panel" style={{ textAlign: "left" }}>
          {authEnabled && sb ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <button
                  className={`area-chip ${mode === "phone" || mode === "otp" ? "on" : ""}`}
                  onClick={() => setMode("phone")}
                >
                  Phone OTP
                </button>
                <button
                  className={`area-chip ${mode === "email" ? "on" : ""}`}
                  onClick={() => setMode("email")}
                >
                  Email &amp; password
                </button>
              </div>

              {(mode === "phone" || mode === "otp") && (
                <>
                  <div className="field">
                    <label>Phone (with country code)</label>
                    <input
                      value={phone}
                      placeholder="+9198XXXXXXXX"
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  {mode === "otp" && (
                    <div className="field">
                      <label>Enter the 6-digit code</label>
                      <input
                        value={otp}
                        inputMode="numeric"
                        placeholder="••••••"
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                  )}
                  <button
                    className="btn"
                    disabled={busy}
                    onClick={mode === "otp" ? verifyOtp : sendOtp}
                  >
                    {busy ? "…" : mode === "otp" ? "Verify & continue" : "Send code"}
                  </button>
                </>
              )}

              {mode === "email" && (
                <>
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                    />
                  </div>
                  <div className="row-actions">
                    <button
                      className="btn"
                      disabled={busy}
                      onClick={() => emailAuth(false)}
                    >
                      {busy ? "…" : "Sign in"}
                    </button>
                    <button
                      className="btn ghost"
                      disabled={busy}
                      onClick={() => emailAuth(true)}
                    >
                      Create account
                    </button>
                  </div>
                </>
              )}

              <div className="login-or">— or —</div>
              <button
                className="btn ghost"
                style={{ width: "100%" }}
                disabled={busy}
                onClick={google}
              >
                Continue with Google
              </button>
            </>
          ) : (
            <p className="muted" style={{ marginTop: 0 }}>
              Accounts are almost here — sign-in will let you save every
              reading. For now, step right in.
            </p>
          )}

          <button
            className="btn"
            style={{ width: "100%", marginTop: 16 }}
            onClick={onDone}
          >
            Continue as guest →
          </button>

          {msg && (
            <p className="muted" style={{ marginTop: 14 }}>
              {msg}
            </p>
          )}
          {err && <p className="err">{err}</p>}
        </div>
      </div>
    </>
  );
}
