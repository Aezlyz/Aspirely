import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./auth.jsx";

/* -------- background FX (non-interactive) -------- */
function AnimatedBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-24 right-[-6rem] h-[34rem] w-[34rem] rounded-full bg-[#F6AD55]/25 blur-3xl floaty" />
      <div className="absolute -bottom-24 left-[-6rem] h-[30rem] w-[30rem] rounded-full bg-[#2B6CB0]/20 blur-3xl floaty-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(1000px_400px_at_90%_-10%,rgba(246,173,85,0.15),transparent_60%),radial-gradient(900px_400px_at_10%_-10%,rgba(43,108,176,0.12),transparent_60%)]" />
      <style>{`
        @keyframes floaty { 0%{ transform: translate(0,0)} 50%{ transform: translate(-14px,-18px)} 100%{ transform: translate(0,0)}}
        .floaty { animation: floaty 10s ease-in-out infinite }
        .floaty-slow { animation: floaty 14s ease-in-out infinite }
        @keyframes sheen { from { transform: translateX(-120%) } to { transform: translateX(120%) } }
      `}</style>
    </div>
  );
}

/* -------- white tilt/glow form card -------- */
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

/* -------- left glossy info panel -------- */
function LeftDecorPanel() {
  return (
    <div className="relative rounded-2xl text-white shadow-[0_40px_100px_-40px_rgba(2,6,23,.7)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,#2B6CB0,#1A202C)]" />
      <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[#F6AD55]/20 blur-3xl" />
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
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-2xl animate-[sheen_8s_linear_infinite]" />
      <div className="relative p-10">
        <h2 className="text-3xl font-extrabold tracking-tight">Why Aspirely?</h2>
        <p className="mt-2 text-white/85">Map your interests to real, achievable paths.</p>
        <ul className="mt-8 space-y-4 text-sm">
          {[
            ["ph-compass", "Personalized career routes"],
            ["ph-lightbulb-filament", "Adaptive decision-tree quiz"],
            ["ph-graduation-cap", "Exams ↔ Colleges mapping"],
            ["ph-file-text", "Clean, shareable reports"],
          ].map(([icon, text], i) => (
            <li key={i} className="flex items-center gap-3 animate-[fadeInUp_.45s_ease_forwards]" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="h-9 w-9 grid place-items-center rounded-lg bg-white/12">
                <i className={`ph ${icon}`} />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-xs text-white/70">Free to try. Delete your data anytime.</p>
      </div>
    </div>
  );
}

/* -------- right glossy base with white form overlay -------- */
function RightDecorWithOverlay({ children }) {
  return (
    <div className="relative rounded-2xl shadow-[0_40px_100px_-40px_rgba(2,6,23,.7)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,#2B6CB0,#1A202C)]" />
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(800px_400px_at_20%_120%,#F6AD55,transparent_60%)]" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/22 to-transparent blur-2xl animate-[sheen_9s_linear_infinite]" />
      <div className="relative p-6 grid place-items-center min-h-[560px]">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate("/", { replace: true }); }, [user, navigate]);

  function validate() {
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    const msg = validate();
    if (msg) return setError(msg);
    setError(""); setLoading(true);
    try {
      await signup({ email, password });   // <- expects { email, password }
      setOk(true);
      setTimeout(() => navigate("/login", { replace: true }), 900); // do NOT auto-login
    } catch (err) {
      setError(err?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <AnimatedBackground />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* LEFT: info panel */}
        <LeftDecorPanel />

        {/* RIGHT: glossy base with WHITE form on top */}
        <RightDecorWithOverlay>
          <GlowCard>
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-full bg-[#2B6CB0]/18 text-[#2B6CB0]">
                <i className="ph ph-user-plus" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Create your account</h1>
                <p className="text-sm text-gray-600">Join Aspirely for a personalized career journey.</p>
              </div>
            </div>

            {error && <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-red-700">{error}</div>}
            {ok && <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-green-700">Signup successful! Redirecting to login…</div>}

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
                  type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="new-password" required
                />
              </label>
              <button
                className="w-full relative overflow-hidden rounded-xl bg-[#2B6CB0] text-white font-semibold px-4 py-2.5 shadow hover:bg-[#255ea3] transition disabled:opacity-70"
                type="submit" disabled={loading}
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  {loading ? <i className="ph ph-circle-notch animate-spin" /> : <i className="ph ph-user-plus" />}
                  {loading ? "Creating your account..." : "Sign up"}
                </span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[sheen_1.4s_ease-in-out_infinite] pointer-events-none" />
              </button>
            </form>

            <div className="mt-6 text-sm text-center">
              Already have an account? <Link to="/login" className="text-[#2B6CB0] underline">Log in</Link>
            </div>
          </GlowCard>
        </RightDecorWithOverlay>
      </div>
    </div>
  );
}
