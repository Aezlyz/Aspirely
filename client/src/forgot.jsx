import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

/* --- stylistic helpers reused from auth pages --- */
function AnimatedBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 left-[-6rem] h-[34rem] w-[34rem] rounded-full bg-[#2B6CB0]/22 blur-3xl" />
      <div className="absolute -bottom-24 right-[-6rem] h-[32rem] w-[32rem] rounded-full bg-[#F6AD55]/26 blur-3xl" />
      <div className="absolute -inset-x-40 -top-[32%] h-[60%] rotate-[18deg]">
        <div className="absolute inset-y-0 left-0 w-1/2 animate-[beam_9s_linear_infinite] bg-gradient-to-r from-white/0 via-white/15 to-white/0 blur-2xl" />
      </div>
      <style>{`@keyframes beam { from{transform:translateX(-30%)} to{transform:translateX(30%)} }`}</style>
    </div>
  );
}
function Card({ children }) {
  return (
    <div className="relative rounded-2xl bg-white/80 backdrop-blur-xl p-6 shadow-[0_30px_100px_-40px_rgba(2,6,23,.5)] ring-1 ring-white/40">
      {children}
    </div>
  );
}

/* --- API helper --- */
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE || ""; // e.g. http://127.0.0.1:8001
const CANDIDATE_PATHS = [
  "/api/auth/forgot-password",
  "/api/auth/forgot",
  "/forgot-password",
  "/auth/forgot",
  "/api/forgot-password",
];

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      let ok = false;
      for (const path of CANDIDATE_PATHS) {
        try {
          const res = await fetch(AUTH_BASE + path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (res.ok) { ok = true; break; }
        } catch { /* try next */ }
      }
      if (ok) setSent(true);
      else setError("Could not reach the reset endpoint. Check your auth server URL or CORS.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative grid place-items-center px-4">
      <AnimatedBackground />
      <div className="w-full max-w-xl">
        <Card>
          {!sent ? (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">Forgot password</h1>
                <p className="text-slate-600 text-sm mt-1">
                  Enter your email and we’ll send a reset link.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                className="relative w-full rounded-lg bg-[#2B6CB0] text-white py-2.5 font-medium overflow-hidden disabled:opacity-70"
                type="submit" disabled={submitting}
              >
                {submitting ? "Sending…" : "Send reset link"}
                <span className="absolute inset-0 -translate-x-full bg-white/20 animate-[sheen_1.4s_ease-in-out_infinite] pointer-events-none" />
              </button>

              <div className="flex items-center justify-between text-sm mt-2">
                <Link to="/login" className="text-[#2B6CB0] underline">Back to login</Link>
                <Link to="/signup" className="underline underline-offset-4">Create account</Link>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-center">
              <h2 className="text-2xl font-semibold">Check your email</h2>
              <p className="text-slate-600">
                If an account exists for <span className="font-medium">{email}</span>, you’ll receive a reset link shortly.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link to="/login" className="px-4 py-2 rounded-lg bg-[#2B6CB0] text-white">Back to login</Link>
                <button onClick={() => setSent(false)} className="px-4 py-2 rounded-lg border">Use a different email</button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
