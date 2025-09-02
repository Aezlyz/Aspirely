import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------- constants -------------------- */
const QUIZ_KEY_RES = "aspirely:lastResult";
const QUIZ_KEY_ANS = "aspirely:lastAnswers";
const MIN_QUESTIONS = 12;
const AUTH_API = import.meta.env.VITE_AUTH_API || ""; // optional backend

/* -------------------- tiny helpers -------------------- */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/* -------------------- Tilt wrapper (micro 3D) -------------------- */
function TiltCard({ className = "", children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * 4; // toned down tilt
      const ry = (0.5 - px) * 6;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const onLeave = () => {
      el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg)`;
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);
  return (
    <div ref={ref} className={`transition-transform duration-200 will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/* -------------------- Primary Button (solid) -------------------- */
function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`relative rounded-full px-4 py-2 font-medium text-white shadow hover:shadow-lg bg-[#2B6CB0] hover:bg-[#255ea3] transition ${className}`}
    >
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

/* -------------------- Background beams / blobs -------------------- */
function GlowBG() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-20 -left-24 h-[36rem] w-[36rem] rounded-full bg-[#2B6CB0]/15 blur-3xl" />
      <div className="absolute -bottom-28 -right-24 h-[34rem] w-[34rem] rounded-full bg-[#F6AD55]/15 blur-3xl" />
      <div className="absolute -inset-x-40 -top-[28%] h-[60%] rotate-[18deg]">
        <div className="absolute inset-y-0 left-0 w-1/2 animate-[beam_8s_linear_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent blur-3xl opacity-60" />
        <div className="absolute inset-y-0 left-1/3 w-1/2 animate-[beam_11s_linear_infinite] bg-gradient-to-r from-transparent via-[#F6AD55]/25 to-transparent blur-2xl opacity-60" />
        <div className="absolute inset-y-0 left-2/3 w-1/2 animate-[beam_13s_linear_infinite] bg-gradient-to-r from-transparent via-[#2B6CB0]/25 to-transparent blur-2xl opacity-60" />
      </div>
    </div>
  );
}

/* -------------------- Badge chip -------------------- */
function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-white/70 backdrop-blur">
      {children}
    </span>
  );
}

/* -------------------- Stat pill -------------------- */
function StatPill({ label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="h-2 w-2 rounded-full bg-[#2B6CB0]" />
      <span className="font-medium">{label}</span>
      <span className="text-[#2B6CB0] font-semibold">{value}</span>
    </div>
  );
}

/* -------------------- Light Toast -------------------- */
function Toast({ kind = "success", children, onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  const color = kind === "error" ? "bg-red-600" : kind === "warn" ? "bg-amber-600" : "bg-emerald-600";
  return (
    <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 text-white px-4 py-2 rounded-xl shadow ${color}`}>
      {children}
    </div>
  );
}

/* -------------------- Option Card (refined) -------------------- */
function OptionCard({ label, hint, onClick }) {
  return (
    <TiltCard className="group">
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.985 }}
        className="relative w-full text-left px-5 py-4 rounded-2xl border bg-white shadow-sm hover:shadow-md hover:border-[#2B6CB0]/70 overflow-hidden"
      >
        {/* left accent */}
        <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-[#2B6CB0]/60 group-hover:w-2 transition-all" />
        {/* subtle shine */}
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition"
          style={{ background: "radial-gradient(320px 120px at 10% 0%, rgba(59,130,246,.10), transparent 40%)" }}
        />
        <span className="relative inline-flex items-center gap-3">
          <span className="h-9 w-9 grid place-items-center rounded-xl bg-[#2B6CB0]/10 text-[#2B6CB0]"><i className="ph ph-check" /></span>
          <span className="font-medium text-[#1A202C]">{label}</span>
          {hint && <span className="ml-auto text-xs text-gray-500">{hint}</span>}
        </span>
      </motion.button>
    </TiltCard>
  );
}

/* -------------------- main -------------------- */
export default function Quiz() {
  const navigate = useNavigate();

  // data
  const [qMap, setQMap] = useState({});
  const [currentId, setCurrentId] = useState(null); // start after load (respects start_id)
  const [history, setHistory] = useState([]); // {questionId, question, optionLabel}
  const [result, setResult] = useState(null); // final career object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UX state (kept for compatibility; extras disabled by logic below)
  const [extrasAsked, setExtrasAsked] = useState(0);
  const [toast, setToast] = useState(null);

  // extras bank (not used now—kept to preserve the rest of UI)
  const extraBank = useMemo(
    () => [
      { key: "style", text: "Which study style suits you most?", options: ["Visual notes", "Practice papers", "Group study", "Video lessons"] },
      { key: "env", text: "Preferred work environment?", options: ["Office", "Hybrid", "Remote", "Field work"] },
      { key: "drive", text: "What motivates you more?", options: ["Impact", "Innovation", "Money", "Stability"] },
      { key: "team", text: "Team preference?", options: ["Lead", "Collaborate", "Independent", "Flexible"] },
      { key: "pace", text: "Pace you enjoy?", options: ["Fast-paced", "Steady", "Academic", "Creative"] },
    ],
    []
  );

  // load questions from public or backend (accepts array OR object map; respects start_id)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      const sources = [
        "/questions",
        "/questions_trees_updated.json",
        "/questions_tree.json",
        "/questions_trees_revamped_large.json",
        "/questions_trees_updated_medium.json",
        "/questions_trees_revamped.json",
      ];
      let payload = null;
      for (const url of sources) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) continue;
          const text = await res.text();
          if (text.trim().startsWith("<")) continue; // got HTML, not JSON
          const json = JSON.parse(text);

          let qs = [];
          if (Array.isArray(json?.questions)) qs = json.questions;
          else if (json?.questions && typeof json.questions === "object") qs = Object.values(json.questions);

          if (qs.length) {
            payload = { start_id: json.start_id, questions: qs };
            break;
          }
        } catch {}
      }
      if (!payload) {
        setError("Could not load questions. Put a questions JSON in /public or expose a /questions endpoint.");
        setLoading(false);
        return;
      }
      const map = {};
      payload.questions.forEach((q) => (map[q.question_id] = q));
      setQMap(map);

      const firstId =
        payload.start_id ||
        payload.questions[0]?.question_id ||
        payload.questions[0]?.id ||
        "Q1";
      setCurrentId(firstId);

      setHistory([]);
      setResult(null);
      setExtrasAsked(0);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    })();
  }, []);

  const currentQ = currentId ? qMap[currentId] : null;

  // STRICT 12-count: only actual questions answered
  const totalAnswered = history.length;
  const needExtras = false; // disable extras entirely
  const nextExtraIdx = 0;   // placeholder to keep rest identical
  const progressPct = Math.min(100, (totalAnswered / MIN_QUESTIONS) * 100);

  // keyboard shortcuts (kept identical; extras path never triggers now)
  useEffect(() => {
    const onKey = (e) => {
      if (!currentQ) return;
      const n = parseInt(e.key, 10);
      if (!Number.isNaN(n) && n > 0) {
        const opt = currentQ.options[n - 1];
        if (opt) chooseOption(opt);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentQ]);

  function restart() {
    // restart with same start_id logic
    const firstId =
      Object.values(qMap)[0]?.question_id || "Q1";
    setCurrentId(firstId);
    setHistory([]);
    setResult(null);
    setExtrasAsked(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseOption(opt) {
    if (!currentQ) return;

    const newHistory = [
      ...history,
      { questionId: currentQ.question_id, question: currentQ.text, optionLabel: opt.label },
    ];
    setHistory(newHistory);

    const newLen = newHistory.length;

    // If answering the 12th, finalize immediately
    if (newLen >= MIN_QUESTIONS) {
      if (opt && opt.career) {
        setResult(opt.career);
      } else {
        setResult({
          id: "fallback",
          title: "Thanks!",
          description: "We capped the quiz at 12 answers. Explore your result and alternatives.",
          skills: [],
          education: [],
          industries: [],
          colleges: [],
          entrance_exams: [],
        });
      }
      setCurrentId(null);
      return;
    }

    // Otherwise, continue down the tree or finish if branch ends
    if (opt && opt.next_question_id) {
      setCurrentId(opt.next_question_id);
      return;
    }

    // branch ended early before 12 → finalize gracefully (still 12-cap logic)
    setResult({
      id: "fallback",
      title: "Thanks!",
      description: "We couldn't find a mapped career for that branch, but your answers are saved.",
      skills: [],
      education: [],
      industries: [],
      colleges: [],
      entrance_exams: [],
    });
    setCurrentId(null);
  }

  function answerExtra() {
    // extras disabled keep no-op for compatibility
    return;
  }

  function normalizedPayload() {
    if (!result) return null;
    return {
      explanation: {
        career: result.title,
        career_details: {
          title: result.title,
          description: result.description || "",
          skills: Array.isArray(result.skills) ? result.skills : [],
          education: Array.isArray(result.education) ? result.education : [],
          entrance_exams: Array.isArray(result.entrance_exams) ? result.entrance_exams : [],
          colleges: Array.isArray(result.colleges) ? result.colleges : [],
        },
      },
    };
  }

  // persist when done
  useEffect(() => {
    if (result) {
      const normalized = normalizedPayload();
      try {
        localStorage.setItem(QUIZ_KEY_RES, JSON.stringify(normalized));
        localStorage.setItem(QUIZ_KEY_ANS, JSON.stringify(history));
        setToast({ kind: "success", msg: "Profile updated with your result" });
      } catch {}
      if (AUTH_API) {
        const token = localStorage.getItem("aspirely:token");
        fetch(`${AUTH_API.replace(/\/$/, "")}/results`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            answers: history.map((h) => ({ question_id: h.questionId, selected_option: h.optionLabel })),
            result: normalized,
            saved_at: new Date().toISOString(),
          }),
        }).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  /* -------------------- render -------------------- */
  return (
    <div className="min-h-screen text-[#1A202C] bg-[#F7FAFC] relative overflow-x-hidden" data-animate-root>
      <GlowBG />

      {toast && <Toast kind={toast.kind} onDone={() => setToast(null)}>{toast.msg}</Toast>}

      {/* top bar */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-white/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border hover:bg-gray-50"><i className="ph ph-arrow-left" /> Back</button>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-[#2B6CB0] hover:underline"><i className="ph ph-house" /> Home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress: sleek single bar with soft glow & subtle shine */}
        <div className="mb-6">
          <div className="relative h-2 rounded-full border border-white/70 bg-white/70 backdrop-blur overflow-hidden shadow-inner">
            <motion.span
              className="absolute inset-y-0 left-0"
              style={{ background: "linear-gradient(90deg,#2B6CB0 0%, #4C86C6 60%, #7BA6D8 100%)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            />
            <span
              className="absolute inset-y-0 left-0 opacity-30 animate-shinebar"
              style={{ width: "200%", background: "linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.7) 100%)" }}
            />
          </div>
          <div className="mt-2 text-[11px] text-gray-500 flex justify-end">
            <span>{Math.round(progressPct)}%</span>
          </div>
        </div>

        {/* QUESTION VIEW */}
        <AnimatePresence mode="wait">
          {!result && currentQ && (
            <motion.section
              key={currentQ.question_id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
              className="relative rounded-2xl border border-white/60 bg-white/80 backdrop-blur p-6 shadow-[0_30px_80px_-30px_rgba(2,6,23,.45)]"
            >
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-[#F6AD55]/22 via-transparent to-[#2B6CB0]/22 blur-2xl" />
              <div className="flex items-center gap-3">
                <Badge>Step {history.length + 1} of {MIN_QUESTIONS}</Badge>
              </div>
              <h2 className="mt-3 text-xl md:text-2xl font-semibold leading-snug">{currentQ.text}</h2>
              <div className="mt-5 grid grid-cols-1 gap-3">
                {currentQ.options.map((opt, idx) => (
                  <OptionCard key={idx} label={opt.label} hint={`press ${idx + 1}`} onClick={() => chooseOption(opt)} />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* RESULT VIEW */}
        <AnimatePresence>
          {result && (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="group relative mt-6 rounded-2xl border border-white/60 bg-white/80 backdrop-blur p-0 shadow-[0_30px_80px_-30px_rgba(2,6,23,.45)] overflow-hidden"
            >
              {/* header: soft linear gradient + animated title */}
              <div
                className="relative px-6 pt-10 pb-8 overflow-hidden rounded-t-2xl"
                style={{ background: 'radial-gradient(900px 260px at 0% -10%, rgba(32,105,174,0.12), transparent 60%), radial-gradient(900px 260px at 110% -10%, rgba(120,128,137,0.08), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #F6F9FF 55%, #EDF3FF 100%)' }}
              >
                <motion.h2
                  initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative text-3xl md:text-4xl font-extrabold tracking-tight"
                >
                  <span className="title-static">{result.title}</span>
                </motion.h2>
                {result.description && (
                  <p className="relative mt-2 text-gray-700 max-w-3xl">{result.description}</p>
                )}
                <div className="relative mt-4 flex flex-wrap gap-2">
                  <StatPill
                    label="Confidence"
                    value={`${Math.min(98, Math.round(70 + (Math.min(totalAnswered, MIN_QUESTIONS) / MIN_QUESTIONS) * 25))}%`}
                  />
                  <StatPill label="Answered" value={`${totalAnswered} steps`} />
                </div>
              </div>

              {/* body */}
              <div className="px-6 pb-6">
                <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-4">
                    <ChipList title="Skills" icon="ph-lightbulb-filament" items={result.skills} />
                    <ChipList title="Education" icon="ph-graduation-cap" items={result.education} />
                    {Array.isArray(result.industries) && result.industries.length > 0 && (
                      <ChipList title="Industries" icon="ph-buildings" items={result.industries} />
                    )}
                    {Array.isArray(result.entrance_exams) && result.entrance_exams.length > 0 && (
                      <ChipList title="Entrance Exams" icon="ph-identification-card" items={result.entrance_exams} />
                    )}
                    {Array.isArray(result.colleges) && result.colleges.length > 0 && (
                      <ChipList title="Top Colleges" icon="ph-student" items={result.colleges} />
                    )}
                  </div>
                  <div className="space-y-4">
                    <HoloCard title="Next steps">
                      <ol className="list-decimal ml-5 text-sm text-gray-700 space-y-1">
                        <li>Shortlist 3 colleges from the list.</li>
                        <li>Map exam timelines and prep windows.</li>
                        <li>Draft a 4-week micro-study plan.</li>
                      </ol>
                    </HoloCard>
                    <HoloCard title="Explore alternatives">
                      <p className="text-sm text-gray-700">
                        Retake the quiz and pick different branches to compare nearby careers.
                      </p>
                      <div className="mt-3">
                        <PrimaryButton onClick={restart}>
                          <i className="ph ph-path" /> Try another path
                        </PrimaryButton>
                      </div>
                    </HoloCard>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <PrimaryButton onClick={restart}>
                    <i className="ph ph-arrow-counter-clockwise" /> Retake Quiz
                  </PrimaryButton>
                  <button onClick={() => navigate("/profile")} className="px-4 py-2 rounded-full border hover:bg-gray-50">
                    View Profile
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* local styles */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-animate-root] * { animation: none !important; transition: none !important }
        }
        @keyframes beam { from { transform: translateX(-30%) } to { transform: translateX(30%) } }
        .animate-shinebar { animation: shinebar 2.8s linear infinite; }
        @keyframes shinebar { 0% { transform: translateX(-25%); } 100% { transform: translateX(0%); } }
        .title-static { background-image: linear-gradient(90deg,#1E63A8 0%, #788089 35%, #C89654 70%, #F0B15E 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
        @keyframes titleShine { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
      `}</style>
    </div>
  );
}

/* -------------------- Pieces -------------------- */
function ChipList({ title, icon, items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="rounded-xl border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center gap-2 font-semibold">
        <span className="h-9 w-9 grid place-items-center rounded-lg bg-[#2B6CB0]/10 text-[#2B6CB0]"><i className={`ph ${icon}`} /></span>
        {title}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((s, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow hover:border-[#2B6CB0]/50"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function HoloCard({ title, children }) {
  return (
    <div className="relative rounded-xl border bg-white p-4 overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute -inset-1 opacity-40 pointer-events-none">
        <div className="absolute -inset-x-10 -top-10 h-24 animate-[shine_6s_linear_infinite] bg-gradient-to-r from-transparent via-[#2B6CB0]/20 to-transparent" />
      </div>
      <div className="flex items-center gap-2 font-semibold">
        <span className="h-9 w-9 grid place-items-center rounded-lg bg-[#F6AD55]/15 text-[#F6AD55]"><i className="ph ph-sparkle" /></span>
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
