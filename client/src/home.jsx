// src/home.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom"; // ⬅️ NEW: use SPA navigation to /quiz
import ScrollTopButton from "./components/ScrollTopButton.jsx";
import { motion, useScroll, useTransform } from "framer-motion";

/* ---------------- tiny utilities ---------------- */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function useShowTop(threshold = 240) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return show;
}

/* ---------------- cursor spotlight ---------------- */
function useCursorSpotlight() {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  useEffect(() => {
    const mm = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", mm, { passive: true });
    return () => window.removeEventListener("mousemove", mm);
  }, []);
  return pos;
}

/* ---------------- ripple effect ---------------- */
function useRipple() {
  const [ripples, setRipples] = useState([]);
  function trigger(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => {
      setRipples((r) => r.filter((k) => k.id !== id));
    }, 500);
  }
  return { ripples, trigger };
}
function RippleLayer({ ripples }) {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute h-0 w-0 rounded-full bg-white/35 animate-ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </span>
  );
}

/* ---------------- hero sparkles ---------------- */
function Sparkles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        maskImage:
          "radial-gradient(100% 60% at 50% 0%, black 60%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(100% 60% at 50% 0%, black 60%, transparent 100%)",
      }}
    >
      <div className="absolute inset-0 opacity-[0.25]">
        {[...Array(22)].map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/50"
            style={{
              left: `${(i * 137) % 100}%`,
              top: `${((i * 73) % 40) + 5}%`,
              filter: "blur(0.5px)",
              animation: `drift ${(12 + (i % 5))}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- hero parallax & adaptive hue ---------------- */
function ParallaxHero({ onSeeHow }) {
  const wrapRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end start"],
  });

  const yBlobA = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yBlobB = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yBeam = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const hue = useTransform(scrollYProgress, [0, 1], [0, 22]);
  const hueFilter = useTransform(hue, (v) => `hue-rotate(${v}deg)`);

  const { x, y } = useCursorSpotlight();

  return (
    <section ref={wrapRef} className="relative pt-24 overflow-hidden">
      {/* spotlight that follows the cursor */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(250px circle at ${x}px ${y}px, rgba(255,255,255,.16), transparent 60%)`,
          maskImage:
            "radial-gradient(100% 60% at 50% 0%, black 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(100% 60% at 50% 0%, black 60%, transparent 100%)",
        }}
      />

      {/* animated graphics under content */}
      <motion.div
        className="absolute inset-0 -z-10 overflow-hidden"
        style={{ filter: hueFilter }}
      >
        {/* soft noise */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22 viewBox=%220 0 160 160%22><filter id=%22n%22 x=%220%22 y=%220%22 width=%22100%25%22 height=%22100%25%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.7%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.20%25%22/></svg>')",
          }}
        />
        {/* mesh blobs */}
        <motion.div
          style={{ y: yBlobA }}
          className="absolute -top-32 -left-24 h-[36rem] w-[36rem] rounded-full bg-[#2B6CB0]/22 blur-3xl"
        />
        <motion.div
          style={{ y: yBlobB }}
          className="absolute -bottom-28 -right-24 h-[34rem] w-[34rem] rounded-full bg-[#F6AD55]/24 blur-3xl"
        />
        {/* beams */}
        <motion.div
          style={{ y: yBeam }}
          className="absolute -inset-x-40 -top-[30%] h-[62%] rotate-[18deg]"
        >
          <div className="absolute inset-y-0 left-0 w-1/2 animate-[beam_8s_linear_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-3xl opacity-70" />
          <div className="absolute inset-y-0 left-1/3 w-1/2 animate-[beam_11s_linear_infinite] bg-gradient-to-r from-transparent via-[#F6AD55]/45 to-transparent blur-2xl opacity-70" />
          <div className="absolute inset-y-0 left-2/3 w-1/2 animate-[beam_13s_linear_infinite] bg-gradient-to-r from-transparent via-[#2B6CB0]/40 to-transparent blur-2xl opacity-70" />
        </motion.div>
        {/* grid shade */}
        <div
          className="absolute inset-0 opacity-[0.25] mix-blend-multiply"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(1300px 540px at 50% -10%, black, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(1300px 540px at 50% -10%, black, transparent 70%)",
          }}
        />
      </motion.div>

      {/* sparkles */}
      <Sparkles />

      {/* hero copy + CTAs */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-[0_10px_30px_rgba(2,6,23,.25)]">
          Discover Your Path with{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2B6CB0] to-[#F6AD55]">
            Aspirely
          </span>
        </h1>
        <p className="mt-4 text-lg text-[#2D3748]">
          Courses, colleges, exams — beautifully organized around <em>you</em>.
        </p>

        <HeroCTA onSeeHow={onSeeHow} />
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-animate-root] * { animation: none !important; transition: none !important }
        }
        @keyframes beam { from { transform: translateX(-30%) } to { transform: translateX(30%) } }
        @keyframes drift { 0% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(12px,-10px,0) scale(1.05) } 100% { transform: translate3d(0,0,0) scale(1) } }
      `}</style>
    </section>
  );
}

/* ---------------- CTA (magnetic + ripple) ---------------- */
function HeroCTA({ onSeeHow }) {
  const wrap = useRef(null);
  const [mag, setMag] = useState({ x: 0, y: 0 });
  function move(e) {
    const r = wrap.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width;
    const y = (e.clientY - (r.top + r.height / 2)) / r.height;
    setMag({ x: clamp(x * 12, -10, 10), y: clamp(y * 12, -10, 10) });
  }
  function leave() {
    setMag({ x: 0, y: 0 });
  }

  const startRipple = useRipple();
  const howRipple = useRipple();

  return (
    <div
      ref={wrap}
      onMouseMove={move}
      onMouseLeave={leave}
      className="relative mx-auto mt-8 w-fit will-change-transform"
      style={{ transform: `translate3d(${mag.x}px, ${mag.y}px, 0)` }}
    >
      <div
        aria-hidden
        className="absolute -inset-x-6 -bottom-6 h-12 rounded-[32px] blur-2xl bg-[radial-gradient(60%_120%_at_50%_50%,rgba(2,6,23,.35),transparent)]"
      />
      <div className="inline-flex items-center gap-3">
        {/* SPA LINK to /quiz (replaces /quiz.html) */}
        <Link
          to="/quiz"
          onPointerDown={startRipple.trigger}
          className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold overflow-hidden
                     shadow-[0_16px_40px_-10px_rgba(249,115,22,.55),0_10px_25px_-15px_rgba(43,108,176,.45)]
                     hover:shadow-[0_18px_44px_-10px_rgba(249,115,22,.6),0_12px_28px_-15px_rgba(43,108,176,.5)]
                     transition-transform duration-150 hover:-translate-y-0.5"
          style={{
            background:
              "linear-gradient(90deg,#F6AD55 0%,#F97316 35%,#2B6CB0 100%)",
          }}
        >
          <RippleLayer ripples={startRipple.ripples} />
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#F6AD55]/40 via-[#F97316]/20 to-[#2B6CB0]/30 blur-xl -z-10" />
          <i className="ph ph-rocket-launch text-xl opacity-90 group-hover:animate-wiggle" />
          Start Career Quiz
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 group-hover:translate-x-0.5 transition">
            <i className="ph ph-arrow-right" />
          </span>
        </Link>

        <button
          onPointerDown={howRipple.trigger}
          onClick={onSeeHow}
          className="relative inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/60 bg-white/80 backdrop-blur
                     text-gray-800 hover:bg-white shadow-[0_12px_32px_-18px_rgba(2,6,23,.45)] overflow-hidden"
        >
          <RippleLayer ripples={howRipple.ripples} />
          <i className="ph ph-play-circle group-hover:animate-wiggle" />
          See how it works
        </button>
      </div>

      <style>{`
        @keyframes ripple { to { transform: scale(20); opacity: 0 } }
        .animate-ripple { animation: ripple .5s ease-out forwards }
        @keyframes wiggle { 0%,100%{transform:rotate(0)} 30%{transform:rotate(-6deg)} 60%{transform:rotate(6deg)} }
      `}</style>
    </div>
  );
}

/* ---------------- feature cards ---------------- */
function DepthCard({ icon, title, text, i, to }) {
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

  const Card = (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative select-none rounded-2xl border border-white/60 bg-white/80 backdrop-blur p-6
      shadow-[0_26px_60px_-24px_rgba(2,6,23,.35),0_10px_28px_-20px_rgba(15,23,42,.25)]
      transform-gpu will-change-transform hover:-translate-y-1 hover:shadow-[0_34px_72px_-26px_rgba(2,6,23,.45),0_12px_30px_-18px_rgba(15,23,42,.3)]
      animate-[fadeInUp_.5s_ease_forwards]"
      style={{ ...style, animationDelay: `${i * 90}ms` }}
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent [background:linear-gradient(white,white)_padding-box,conic-gradient(from_180deg,rgba(43,108,176,.0)_0%,rgba(43,108,176,.25)_40%,rgba(246,173,85,.25)_60%,rgba(43,108,176,.0)_100%)_border-box] opacity-0 group-hover:opacity-100 transition [mask-composite:exclude]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition"
        style={{
          background:
            "radial-gradient(420px circle at var(--x) var(--y), rgba(246,173,85,.18), transparent 40%)," +
            "radial-gradient(300px circle at var(--x) var(--y), rgba(43,108,176,.15), transparent 45%)",
        }}
      />
      <div className="relative">
        <div className="h-11 w-11 grid place-items-center rounded-xl bg-[#2B6CB0]/10 text-[#2B6CB0]
         transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:animate-wiggle shadow-[0_8px_20px_-10px_rgba(37,94,163,.55)]">
          <i className={`ph ${icon} text-xl`} />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{text}</p>
        <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition">
          <i className="ph ph-arrow-right text-gray-400" />
        </div>
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block">
      {Card}
    </Link>
  ) : (
    Card
  );
}

/* ---------------- HOW IT WORKS (two-column layout) ---------------- */
function HowItWorksTwoCol() {
  return (
    <section id="how-it-works" className="relative py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#F6AD55]/10 via-transparent to-transparent blur-2xl"
      />
      <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
        {/* Left: steps / copy */}
        <div>
          <h3 className="text-2xl md:text-3xl font-semibold">
            How Aspirely maps your journey
          </h3>
          <p className="mt-2 text-gray-600">
            A short, adaptive flow — then instant clarity with exams, colleges
            and next steps.
          </p>
          <ul className="mt-6 space-y-4">
            {[
              { icon: "ph-list-checks", t: "Answer adaptive questions" },
              { icon: "ph-compass", t: "Get curated career matches" },
              { icon: "ph-graduation-cap", t: "See relevant exams & colleges" },
              { icon: "ph-file-text", t: "Download a clean report" },
            ].map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 animate-[fadeInUp_.45s_ease_forwards]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mt-0.5 h-9 w-9 grid place-items-center rounded-lg bg-[#2B6CB0]/10 text-[#2B6CB0] shadow-[0_10px_24px_-16px_rgba(37,94,163,.6)]">
                  <i className={`ph ${s.icon}`} />
                </div>
                <span className="font-medium">{s.t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {/* SPA Link to /quiz (replaces /quiz.html) */}
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2B6CB0] text-white font-semibold shadow-[0_16px_40px_-18px_rgba(37,94,163,.6)] hover:bg-[#255ea3] transition"
            >
              Start now <i className="ph ph-arrow-right" />
            </Link>
          </div>
        </div>

        {/* Right: pretty mock card with Download PDF */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#F6AD55]/25 via-transparent to-[#2B6CB0]/25 blur-2xl -z-10" />
          <div className="rounded-2xl border border-white/60 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(2,6,23,.45)]">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Your Top Match</div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <i className="ph ph-seal-check text-[#2B6CB0]" /> based on your
                answers
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-[#F7FAFC] p-5 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 grid place-items-center rounded-lg bg-[#F6AD55]/20 text-[#F6AD55]">
                  <i className="ph ph-briefcase" />
                </div>
                <div>
                  <div className="font-semibold">Investment Banking</div>
                  <div className="text-sm text-gray-600">
                    Finance + analytics + high-impact decisions. Explore roles,
                    skills, exams and colleges.
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg border p-3 bg-white">
                  Skills • Valuation, Excel, Markets
                </div>
                <div className="rounded-lg border p-3 bg-white">
                  Education • BBA/BA Econ/BE
                </div>
                <div className="rounded-lg border p-3 bg-white">
                  Exams • CUET, IPMAT
                </div>
                <div className="rounded-lg border p-3 bg-white">
                  Colleges • SRCC, NMIMS…
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">
                View alternatives
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#F6AD55] text-white hover:bg-orange-500">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ item ---------------- */
function FaqItem({ q, a, i, openIdx, setOpen }) {
  const open = openIdx === i;
  return (
    <button type="button" onClick={() => setOpen(open ? -1 : i)} className="group w-full text-left">
      <div
        className={
          "relative rounded-2xl border bg-white/70 backdrop-blur px-5 py-4 transition hover:shadow-[0_22px_48px_-24px_rgba(2,6,23,.35)] " +
          (open ? "border-[#2B6CB0]" : "border-gray-200")
        }
        style={{
          background: open
            ? "radial-gradient(600px circle at 10% 0%, rgba(43,108,176,.08), transparent 35%), radial-gradient(600px circle at 90% 0%, rgba(246,173,85,.10), transparent 35%)"
            : undefined,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className={
              (open ? "bg-[#2B6CB0]/15 text-[#2B6CB0]" : "bg-gray-100 text-gray-500") +
              " h-9 w-9 grid place-items-center rounded-lg transition"
            }
          >
            <i className="ph ph-question" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">{q}</div>
          </div>
          <div className={(open ? "rotate-180 text-[#2B6CB0]" : "text-gray-500") + " transition-transform"}>
            <i className="ph ph-caret-down" />
          </div>
        </div>
        <div
          className={
            (open ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0") +
            " grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out"
          }
        >
          <div className="overflow-hidden">
            <p className="text-sm text-gray-600 py-2">{a}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ---------------- main page ---------------- */
export default function Home() {
  const showTop = useShowTop();
  const howRef = useRef(null);
  const [openIdx, setOpenIdx] = useState(0);

  const features = [
    { icon: "ph-compass", title: "Personalized Paths", text: "We align your interests and subjects with clear career routes." },
    { icon: "ph-lightbulb-filament", title: "Adaptive Quiz", text: "A decision-tree quiz that branches smartly based on your choices.", to: "/quiz" }, // ⬅️ changed from /quiz.html
    { icon: "ph-graduation-cap", title: "Top Colleges & Exams", text: "Mapped exams and colleges you can realistically target." },
    { icon: "ph-file-text", title: "Shareable Reports", text: "Sleek results with courses, colleges and next steps." },
  ];

  return (
    <div className="text-[#1A202C]" data-animate-root>
      {/* HERO */}
      <ParallaxHero onSeeHow={() => howRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} />

      {/* FEATURES */}
      <section id="features" className="bg-[#F7FAFC] relative">
        <div aria-hidden className="absolute inset-x-0 -top-8 h-16 bg-gradient-to-b from-black/5 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-center">Everything you need to decide, confidently</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <DepthCard key={i} i={i} icon={f.icon} title={f.title} text={f.text} to={f.to} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — two columns */}
      <div ref={howRef}>
        <HowItWorksTwoCol />
      </div>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How does the quiz work?", a: "We ask up to 12+ tailored questions; each answer leads to a specific next step, ending in well-mapped results." },
              { q: "Can I retake the quiz or update my preferences?", a: "Yes. You can retake anytime or tweak answers to explore alternatives based on your evolving interests." },
              { q: "Do you include entrance exams and colleges?", a: "Absolutely. We list exams like CUET/JEE/NEET/CLAT and map them to a shortlist of suitable colleges." },
              { q: "Is Aspirely free to use?", a: "Yes — you can explore career options, exams, and colleges at no cost." },
              { q: "Can I switch streams (e.g., Science → Commerce/Humanities)?", a: "Where realistic pathways exist, we surface them with bridge options and prerequisites." },
              { q: "Will I get only one top career?", a: "You’ll get a top match plus alternatives with pros/cons so you can compare before deciding." },
              { q: "Can I download a report?", a: "Yes — export a clean PDF summary with skills, education path, exams, and top colleges." },
            ].map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} i={i} openIdx={openIdx} setOpen={setOpenIdx} />
            ))}
          </div>
        </div>
      </section>

      <footer className="pb-12">
        <p className="text-center text-sm text-gray-400">© 2025 Aspirely. All rights reserved.</p>
      </footer>

      <ScrollTopButton show={showTop} />

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-animate-root] * { animation: none !important; transition: none !important }
        }
        @keyframes ripple { to { transform: scale(20); opacity: 0 } }
        .animate-ripple { animation: ripple .5s ease-out forwards }
        @keyframes wiggle { 0%,100%{transform:rotate(0)} 30%{transform:rotate(-6deg)} 60%{transform:rotate(6deg)} }
      `}</style>
    </div>
  );
}
