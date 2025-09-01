// about.jsx — Aspirely • Careers with Clarity
// Matches Home's DepthCard effect for visual consistency (tilt + glow). No navigation on these cards.

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

/* ---------------- Depth-style cards (mirrors Home) ---------------- */

function useTilt() {
  const ref = useRef(null);
  const [style, setStyle] = useState({
    transform: "perspective(900px) rotateX(0deg) rotateY(0deg)",
    "--x": "50%",
    "--y": "50%",
  });
  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rotX = (0.5 - py) * 8;
    const rotY = (px - 0.5) * 10;
    setStyle({
      transform: `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
      "--x": `${px * 100}%`,
      "--y": `${py * 100}%`,
    });
  }
  function onLeave() {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg)",
      "--x": "50%",
      "--y": "50%",
    });
  }
  return { ref, style, onMove, onLeave };
}

const DepthShell = ({ children, className = "" }) => (
  <div
    className={[
      "relative select-none rounded-2xl border border-white/60 bg-white/80 backdrop-blur p-6",
      "shadow-[0_26px_60px_-24px_rgba(2,6,23,.35),0_10px_28px_-20px_rgba(15,23,42,.25)]",
      "transition-all duration-300 will-change-transform",
      "hover:-translate-y-1 hover:shadow-[0_34px_72px_-26px_rgba(2,6,23,.45),0_12px_30px_-18px_rgba(15,23,42,.3)]",
      className,
    ].join(" ")}
  >
    {/* gradient border on hover */}
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent
                 [background:linear-gradient(white,white)_padding-box,conic-gradient(from_180deg,rgba(43,108,176,.0)_0%,rgba(43,108,176,.25)_40%,rgba(246,173,85,.25)_60%,rgba(43,108,176,.0)_100%)_border-box]
                 opacity-0 group-hover:opacity-100 transition [mask-composite:exclude]"
    />
    {/* radial hover glow, follows cursor via --x/--y */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition"
      style={{
        background:
          "radial-gradient(420px circle at var(--x) var(--y), rgba(246,173,85,.18), transparent 40%)," +
          "radial-gradient(300px circle at var(--x) var(--y), rgba(43,108,176,.15), transparent 45%)",
      }}
    />
    <div className="relative">{children}</div>
  </div>
);

const IconChip = ({ color = "blue", icon = "ph-compass" }) => (
  <div
    className={
      "h-11 w-11 grid place-items-center rounded-xl " +
      (color === "amber"
        ? "bg-[#F6AD55]/20 text-[#DD6B20]"
        : "bg-[#2B6CB0]/10 text-[#2B6CB0]")
    }
  >
    <i className={`ph ${icon} text-xl`} />
  </div>
);

/* Big 3 cards (“How Aspirely works”) — NOT links */
const BigFeature = ({ icon, title, text, i }) => {
  const { ref, style, onMove, onLeave } = useTilt();
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
      className="group h-full"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35, delay: i * 0.06 }}
    >
      <DepthShell className="h-full min-h-[220px]">
        <div className="flex h-full flex-col">
          <IconChip icon={icon} />
          <h3 className="mt-4 text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-gray-600 flex-1">{text}</p>
        </div>
      </DepthShell>
    </motion.div>
  );
};

/* Four mission bullets — same interactive feel, compact */
const MiniFeature = ({ icon, text, i }) => {
  const { ref, style, onMove, onLeave } = useTilt();
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
      className="group"
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.3, delay: i * 0.05 }}
    >
      <DepthShell className="px-4 py-3">
        <div className="flex items-center gap-3">
          <IconChip icon={icon} />
          <div className="font-medium text-slate-800">{text}</div>
        </div>
      </DepthShell>
    </motion.div>
  );
};

/* ---------------- Page ---------------- */

export default function About() {
  return (
    <main className="min-h-screen bg-white text-[#1A202C]">
      {/* HERO */}
      <section className="relative pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-28 -left-24 h-[32rem] w-[32rem] rounded-full bg-[#2B6CB0]/18 blur-3xl" />
          <div className="absolute -bottom-28 -right-24 h-[30rem] w-[30rem] rounded-full bg-[#F6AD55]/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(255,255,255,.35),transparent)] pointer-events-none" />
        </div>

        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            About{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2B6CB0] to-[#F6AD55]">
              Aspirely
            </span>
          </motion.h1>
          <p className="mt-3 text-lg text-[#2D3748]">
            Careers with Clarity — guidance that’s practical, personal, and India-ready.
          </p>

          {/* brand lockup pill */}
          <div className="mt-5 inline-flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-[#2B6CB0] bg-[#E6F0FF] border border-[#CFE0FF] px-3 py-1 rounded-full">
              Careers with Clarity
            </span>
            <span className="relative inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F6AD55]" />
              <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-[#F6AD55] opacity-60 animate-ping" />
            </span>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <h2 className="text-2xl md:text-3xl font-semibold">Our mission</h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Help students and professionals cut through noise and make confident decisions:
              pick a direction, understand the entrance exams, shortlist colleges, and see
              day-one skills — all in one place. We turn a complex maze into a guided walk.
            </p>

            {/* 4 interactive bullets (same effect as Home) */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <MiniFeature icon="ph-compass"        text="Clear direction, not generic lists" i={0} />
              <MiniFeature icon="ph-lightbulb"      text="Adaptive advice from your answers"   i={1} />
              <MiniFeature icon="ph-graduation-cap" text="Exams & colleges mapped to you"      i={2} />
              <MiniFeature icon="ph-file-text"      text="Shareable reports with next steps"   i={3} />
            </div>
          </div>

          {/* Stats Card (kept simple) */}
          <div className="rounded-2xl border border-white/60 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(2,6,23,.45)]">
            <div className="font-semibold">What we cover</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                { k: "Careers catalogued", v: "180+" },
                { k: "Exams mapped", v: "50+" },
                { k: "Colleges referenced", v: "100+" },
                { k: "Questions per flow", v: "12 (branched)" },
              ].map((s, i) => (
                <div key={i} className="rounded-lg border p-3 bg-[#F7FAFC]">
                  <div className="text-gray-500">{s.k}</div>
                  <div className="mt-0.5 font-semibold">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 text-xs text-gray-500">
              Numbers are evolving as we expand coverage and depth.
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE WORK — 3 equal interactive boxes (no links) */}
      <section className="py-12 bg-[#F7FAFC] relative">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-4 h-10 bg-gradient-to-b from-black/5 to-transparent" />
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center">How Aspirely works</h2>
          <p className="mt-2 text-gray-600 text-center">
            A short, adaptive flow ends in a personalized plan — not just a label.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-6 items-stretch">
            {[
              {
                icon: "ph-list-checks",
                title: "Adaptive Quiz",
                text: "12 questions that branch based on each answer. No filler; each step narrows the fit.",
              },
              {
                icon: "ph-compass",
                title: "Persona & Role Fit",
                text: "We infer a persona and produce a role recommendation with alternatives — automatically.",
              },
              {
                icon: "ph-graduation-cap",
                title: "Exams & Colleges",
                text: "India-specific entrance exams and a shortlist of colleges you can realistically target.",
              },
            ].map((f, i) => (
              <BigFeature key={i} i={i} icon={f.icon} title={f.title} text={f.text} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2B6CB0] text-white font-semibold shadow-[0_16px_40px_-18px_rgba(37,94,163,.6)] hover:bg-[#255ea3] transition"
            >
              Try the Career Advisor <i className="ph ph-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      {/* PRINCIPLES — optional: keep simple, or wrap with DepthShell if you want same effect */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center">Our product principles</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {[
              {
                icon: "ph-target",
                title: "Clarity > Overwhelm",
                text: "We summarize, then link deeper. The goal is decisions, not endless scrolling.",
              },
              {
                icon: "ph-shield-check",
                title: "Trust the Basics",
                text: "Entrance criteria, exam names and college lists are shown with clear caveats to verify cutoffs & dates.",
              },
              {
                icon: "ph-pulse",
                title: "Personal, not generic",
                text: "Your answers shape wording, examples and alternatives. It should feel like advice for you.",
              },
            ].map((p, i) => (
              <div key={i} className="group">
                <DepthShell className="p-6 h-full">
                  <IconChip color="amber" icon={p.icon} />
                  <h3 className="mt-4 font-semibold text-slate-900">{p.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{p.text}</p>
                </DepthShell>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold">Say hello</h2>
          <p className="mt-2 text-gray-600">
            Questions, feedback, or partnerships? We’d love to hear from you.
          </p>
          <div className="mt-6 inline-flex items-center gap-3">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#2B6CB0] text-white font-semibold hover:bg-[#255ea3] transition"
            >
              Start the quiz <i className="ph ph-arrow-right" />
            </Link>
            <a
              href="mailto:hello@aspirely.example"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-gray-300 bg-white hover:bg-gray-50"
            >
              <i className="ph ph-envelope-simple" /> Email us
            </a>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Note: Always confirm official exam dates and college cutoffs.
          </div>
        </div>
      </section>

      <footer className="pb-12">
        <p className="text-center text-sm text-gray-400">© 2025 Aspirely. All rights reserved.</p>
      </footer>
    </main>
  );
}
