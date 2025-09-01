// src/login.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";

/* -------- background FX (non-interactive) -------- */
function AnimatedBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 left-[-6rem] h-[34rem] w-[34rem] rounded-full bg-[#2B6CB0]/22 blur-3xl floaty" />
      <div className="absolute -bottom-24 right-[-6rem] h-[32rem] w-[32rem] rounded-full bg-[#F6AD55]/26 blur-3xl floaty-slow" />
      <div className="absolute -inset-x-40 -top-[32%] h-[60%] rotate-[18deg]">
        <div className="absolute inset-y-0 left-0 w-1/2 animate-[beam_9s_linear_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent blur-3xl" />
        <div className="absolute inset-y-0 left-1/3 w-1/2 animate-[beam_12s_linear_infinite] bg-gradient-to-r from-transparent via-[#2B6CB0]/35 to-transparent blur-2xl" />
      </div>
      <style>{`
        @keyframes floaty { 0%{ transform: translate(0,0)} 50%{ transform: translate(-14px,-16px)} 100%{ transform: translate(0,0)}}
        .floaty { animation: floaty 10s ease-in-out infinite }
        .floaty-slow { animation: floaty 14s ease-in-out infinite }
        @keyframes beam { from { transform: translateX(-30%) } to { transform: translateX(30%) } }
        @keyframes sheen { from { transform: translateX(-120%) } to { transform: translateX(120%) } }
      `}</style>
    </div>
  );
}

/* -------- reusable white tilt/glow card -------- */
function GlowCard({ children }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({ "--x": "50%", "--y": "50%", transform: "perspective(1100px)" });
  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * 8;
    const ry = (px - 0.5) * 10;
    setStyle({ "--x": `${px * 100}%`, "--y": `${py * 100}%`, transform: `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)` });
  }
  function onLeave() { setStyle({ "--x": "50%", "--y": "50%", transform: "perspective(1100px)" }); }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_30px_80px_-35px_rgba(2,6,23,.6)] transition will-change-transform"
      style={style}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition"
        style={{
          background:
            "radial-gradient(420px circle at var(--x) var(--y), rgba(43,108,176,.14), transparent 42%)," +
            "radial-gradient(300px circle at var(--x) var(--y), rgba(246,173,85,.12), transparent 46%)",
        }}
      />
      {children}
    </div>
  );
}

/* -------- right glossy info panel -------- */
function RightInfoPanel() {
  return (
    <div className="relative rounded-2xl text-white shadow-[0_40px_100px_-40px_rgba(2,6,23,.7)] overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,#2B6CB0,#1A202C)]" />
      <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[#F6AD55]/22 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.7) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(100% 100% at 50% 50%, black, transparent 85%)",
          WebkitMaskImage: "radial-gradient(100% 100% at 50% 50%, black, transparent 85%)",
        }}
      />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-2xl animate-[sheen_7s_linear_infinite]" />
      <div className="relative p-10">
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome to Aspirely</h2>
        <p className="mt-2 text-white/85">Log in to jump back into your journey.</p>
        <ul className="mt-8 space-y-4 text-sm">
          {[
            ["ph-compass", "Career clarity matched to your interests"],
            ["ph-graduation-cap", "Exams & colleges you can actually target"],
            ["ph-file-text", "Downloadable, shareable reports"],
          ].map(([icon, text], i) => (
            <li key={i} className="flex items-center gap-3 animate-[fadeInUp_.45s_ease_forwards]" style={{ animationDelay: `${i * 90}ms` }}>
              <span className="h-9 w-9 grid place-items-center rounded-lg bg-white/12">
                <i className={`ph ${icon}`} />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-xs text-white/70">Secure by design. You control your data.</p>
      </div>
    </div>
  );
}

/* -------- tiny splash to avoid flicker while validating session -------- */
function Splash() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="flex items-center gap-3 text-slate-600">
        <div className="h-3 w-3 rounded-full bg-[#2B6CB0] animate-bounce" />
        <div className="h-3 w-3 rounded-full bg-[#2B6CB0]/70 animate-bounce [animation-delay:.12s]" />
        <div className="h-3 w-3 rounded-full bg-[#2B6CB0]/50 animate-bounce [animation-delay:.24s]" />
        <span className="ml-2">Loading…</span>
      </div>
    </div>
  );
}

export default function Login() {
  const { user, token, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated (after load), send to intended page or /home
  useEffect(() => {
    if (!loading && user) {
      const to =
        (location.state && location.state.from && location.state.from !== "/login")
          ? location.state.from
          : "/home";
      navigate(to, { replace: true });
    }
  }, [loading, user, navigate, location.state]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      await login({ email, password: pass }); // expects { email, password }
      const to =
        (location.state && location.state.from && location.state.from !== "/login")
          ? location.state.from
          : "/home";
      navigate(to, { replace: true });
    } catch (e) {
      setErr(e?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  // --- Prevent the "login page flashes then redirects" issue:
  // While auth is checking an existing token, render a splash instead of the login form.
  if (loading && token) return <Splash />;

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <AnimatedBackground />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* LEFT: form */}
        <GlowCard>
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-full bg-[#2B6CB0]/18 text-[#2B6CB0]">
              <i className="ph ph-sign-in" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Welcome back</h1>
              <p className="text-sm text-gray-600">Log in to continue.</p>
            </div>
          </div>

          {err && <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-red-700">{err}</div>}

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#2B6CB0]"
                type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Password</span>
              <input
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#2B6CB0]"
                type="password" value={pass} onChange={(e)=>setPass(e.target.value)} autoComplete="current-password" required
              />
            </label>
            <button
              className="w-full relative overflow-hidden rounded-xl bg-[#2B6CB0] text-white font-semibold px-4 py-2.5 shadow hover:bg-[#255ea3] transition disabled:opacity-70"
              type="submit" disabled={submitting}
            >
              <span className="relative z-10">{submitting ? "Signing in…" : "Log in"}</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[sheen_1.4s_ease-in-out_infinite] pointer-events-none" />
            </button>
          </form>

          <div className="mt-6 text-sm flex items-center justify-between">
            <Link to="/forgot" className="underline underline-offset-4">Forgot password?</Link>
            <span>New here? <Link to="/signup" className="text-[#2B6CB0] underline">Create account</Link></span>
          </div>
        </GlowCard>

        {/* RIGHT: info */}
        <RightInfoPanel />
      </div>
    </div>
  );
}
