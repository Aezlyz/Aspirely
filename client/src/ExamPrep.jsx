// ExamPrep.jsx — Aspirely • UG Exam Prep (India)
// - No stray left box (mask-based chip scroller, no pseudo-boxes)
// - Thin, sleek scrollbar + edge fade; scroll-snap + auto-center active chip
// - Star/Pin UX: solid star, tooltip, "Pinned" pill on card, favourites section

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Tilt shell ---------- */
function useTilt() {
  const ref = useRef(null);
  const [style, setStyle] = useState({
    transform: "perspective(900px) rotateX(0deg) rotateY(0deg)",
    "--x": "50%",
    "--y": "50%",
  });
  function onMove(e) {
    const r = ref.current?.getBoundingClientRect?.();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setStyle({
      transform: `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg)`,
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
      "group relative rounded-2xl border border-white/60 bg-white/80 backdrop-blur p-5 md:p-6",
      "shadow-[0_26px_60px_-24px_rgba(2,6,23,.35),0_10px_28px_-20px_rgba(15,23,42,.25)]",
      "hover:-translate-y-1 transition-all duration-300",
      className,
    ].join(" ")}
  >
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent
                 [background:linear-gradient(white,white)_padding-box,conic-gradient(from_180deg,rgba(43,108,176,.0)_0%,rgba(43,108,176,.25)_40%,rgba(246,173,85,.25)_60%,rgba(43,108,176,.0)_100%)_border-box]
                 opacity-0 group-hover:opacity-100 transition"
    />
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

/* ---------- Streams + Exams (self-contained) ---------- */
const STREAMS = [
  { key: "Engineering/Tech", icon: "ph-cpu" },
  { key: "Health & Life Sciences", icon: "ph-heartbeat" },
  { key: "Law", icon: "ph-scales" },
  { key: "Design", icon: "ph-pen-nib" },
  { key: "Architecture", icon: "ph-buildings" },
  { key: "Business/Management", icon: "ph-briefcase" },
  { key: "Hospitality/Tourism", icon: "ph-suitcase" },
  { key: "General", icon: "ph-book-open" },
];

const EXAMS = [
  {
    id: "jee-main",
    name: "JEE Main",
    stream: "Engineering/Tech",
    pattern: "MCQ + Numerical; 90 Qs; 3 hrs",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    application: "Dec–Jan / Mar–Apr",
    window: "Jan & Apr sessions",
    resources: ["Official Info", "Syllabus", "PYQs", "Mock tests"],
    syllabus: {
      Mathematics: ["Sets", "Functions", "Limits", "Vectors", "3D", "Probability"],
      Physics: ["Kinematics", "Laws of Motion", "Electricity", "Magnetism", "Modern"],
      Chemistry: ["Physical", "Organic", "Inorganic"],
    },
    official: "https://jeemain.nta.ac.in/",
  },
  {
    id: "jee-advanced",
    name: "JEE Advanced",
    stream: "Engineering/Tech",
    pattern: "MCQ/MSQ/NAT; 2×3 hrs",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    application: "Apr–May",
    window: "June",
    resources: ["Official Info", "Syllabus", "PYQs (IIT)", "Mock tests"],
    syllabus: {
      Mathematics: ["Algebra", "Calculus", "Coordinate", "Vectors"],
      Physics: ["Mechanics", "EMI & AC", "Optics", "Modern"],
      Chemistry: ["Physical", "Organic", "Inorganic"],
    },
    official: "https://jeeadv.ac.in/",
  },
  {
    id: "bitsat",
    name: "BITSAT",
    stream: "Engineering/Tech",
    pattern: "CBT; PCM + English + LR",
    subjects: ["Physics", "Chemistry", "Mathematics", "English & Reasoning"],
    application: "Mar–Apr",
    window: "May–Jun",
    resources: ["Official Info", "Syllabus", "Sample tests"],
    syllabus: {
      Mathematics: ["Limits", "Matrices", "Complex"],
      Physics: ["Kinematics", "Thermal", "Waves", "Electrostatics"],
      Chemistry: ["States", "Thermo", "Organic basics"],
    },
    official: "https://www.bitsadmission.com/",
  },
  {
    id: "viteee",
    name: "VITEEE",
    stream: "Engineering/Tech",
    pattern: "CBT; PCM/PCB + Aptitude",
    subjects: ["Physics", "Chemistry", "Maths/Biology", "Aptitude"],
    application: "Jan–Mar",
    window: "Apr",
    resources: ["Official Info", "Syllabus", "Mock tests"],
    syllabus: { Physics: ["Mechanics", "Electricity"], Chemistry: ["Physical/Organic"], Mathematics: ["Algebra", "Calculus"] },
    official: "https://viteee.vit.ac.in/",
  },
  {
    id: "comedk",
    name: "COMEDK UGET",
    stream: "Engineering/Tech",
    pattern: "MCQ; 180 mins; PCM",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    application: "Feb–Mar",
    window: "May",
    resources: ["Official Info", "Syllabus", "Model Papers"],
    syllabus: { Mathematics: ["Algebra", "Trig"], Physics: ["Mechanics"], Chemistry: ["Physical/Organic"] },
    official: "https://www.comedk.org/",
  },
  {
    id: "wbjee",
    name: "WBJEE",
    stream: "Engineering/Tech",
    pattern: "Paper 1 (Maths), Paper 2 (Phy+Chem)",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    application: "Dec–Jan",
    window: "Apr",
    resources: ["Official Info", "Syllabus", "PYQs"],
    syllabus: { Mathematics: ["Coordinate", "Calculus"], Physics: ["Electricity"], Chemistry: ["Inorganic NCERT"] },
    official: "https://wbjeeb.nic.in/",
  },
  {
    id: "neet-ug",
    name: "NEET-UG",
    stream: "Health & Life Sciences",
    pattern: "MCQ; 200 Qs (180 attempt); 3h20m",
    subjects: ["Physics", "Chemistry", "Biology"],
    application: "Mar–Apr",
    window: "May",
    resources: ["Official Info", "Syllabus (NCERT)", "PYQs", "Mocks"],
    syllabus: { Biology: ["Physiology", "Genetics", "Ecology"], Chemistry: ["Physical/Organic/Inorganic"], Physics: ["Mechanics", "Electrodynamics"] },
    official: "https://neet.nta.nic.in/",
  },
  {
    id: "clat",
    name: "CLAT (UG)",
    stream: "Law",
    pattern: "English, GK, Legal, Logic, Quant; 2h",
    subjects: ["English", "GK/Current", "Legal Reasoning", "Logical", "Quant"],
    application: "Jul–Nov",
    window: "Dec",
    resources: ["Official Info", "Syllabus", "Sample papers"],
    syllabus: { Legal: ["Passage-based"], GK: ["Recent events"], English: ["Comprehension"] },
    official: "https://consortiumofnlus.ac.in/",
  },
  {
    id: "ailet",
    name: "AILET (BA LL.B)",
    stream: "Law",
    pattern: "English, GK, Reasoning; 1.5h",
    subjects: ["English", "GK/Current", "Reasoning"],
    application: "Aug–Nov",
    window: "Dec",
    resources: ["Official Info", "Syllabus", "Samples"],
    syllabus: { English: ["RC"], GK: ["Static+Current"], Reasoning: ["Analytical/Logical"] },
    official: "https://nationallawuniversitydelhi.in/",
  },
  {
    id: "nid-dat",
    name: "NID DAT",
    stream: "Design",
    pattern: "Prelims + Mains (studio/problem)",
    subjects: ["Observation", "Sketching", "Visual Comm", "Creativity"],
    application: "Sep–Nov",
    window: "Dec–Mar",
    resources: ["Official Info", "Syllabus", "Sample briefs"],
    syllabus: { Portfolio: ["Sketch", "Form", "Storyboards"], Aptitude: ["Creativity", "Lateral thinking"] },
    official: "https://admissions.nid.edu/",
  },
  {
    id: "uceed",
    name: "UCEED",
    stream: "Design",
    pattern: "Part A (objective) + Part B (sketch); 3h",
    subjects: ["Visualization", "Observation", "Design Sensitivity", "Drawing"],
    application: "Sep–Oct",
    window: "Jan",
    resources: ["Official Info", "Syllabus", "Previous papers"],
    syllabus: { Drawing: ["Perspective", "Composition"], Aptitude: ["Visualization", "Analytical ability"] },
    official: "https://www.uceed.iitb.ac.in/",
  },
  {
    id: "nata",
    name: "NATA",
    stream: "Architecture",
    pattern: "Cognitive + visual reasoning",
    subjects: ["Maths basics", "Architecture aptitude", "Drawing"],
    application: "Mar–Apr",
    window: "Apr–Jul",
    resources: ["Official Info", "Syllabus", "Sample tests"],
    syllabus: { Aptitude: ["Design sensitivity", "Visualization"], Maths: ["12th basics"] },
    official: "https://www.nata.in/",
  },
  {
    id: "cuet-ug",
    name: "CUET-UG",
    stream: "General (CUET-UG)",
    pattern: "Language + Domain + General; CBT",
    subjects: ["Language", "Domain", "General test"],
    application: "Feb–Mar",
    window: "May–Jun",
    resources: ["Official Info", "Syllabus", "Sample papers"],
    syllabus: { General: ["Quant", "Reasoning", "GK"], Domain: ["Per chosen subject"] },
    official: "https://cuet.samarth.ac.in/",
  },
  {
    id: "ipmat",
    name: "IPMAT (IIM Indore/Rohtak)",
    stream: "Business/Management",
    pattern: "Quant + Verbal; Aptitude + PI",
    subjects: ["Quant", "Verbal"],
    application: "Feb–Apr",
    window: "May–Jun",
    resources: ["Official Info", "Syllabus", "PYQs"],
    syllabus: { Quant: ["Arithmetic", "Algebra"], Verbal: ["RC", "Grammar"] },
    official: "https://www.iimidr.ac.in/academics/ipm/ipmat/",
  },
  {
    id: "npat",
    name: "NPAT (NMIMS)",
    stream: "Business/Management",
    pattern: "Quant + Logical + Verbal",
    subjects: ["Quant", "Logical", "Verbal"],
    application: "Dec–May",
    window: "Jan–May",
    resources: ["Official Info", "Syllabus", "Mocks"],
    syllabus: { Quant: ["Numbers", "Algebra"], LR: ["Series", "Puzzles"], Verbal: ["RC"] },
    official: "https://npat.nmims.edu/",
  },
  {
    id: "set",
    name: "SET (Symbiosis)",
    stream: "Business/Management",
    pattern: "General test + WAT/PI",
    subjects: ["Quant", "Reasoning", "English", "GK"],
    application: "Jan–Apr",
    window: "May",
    resources: ["Official Info", "Syllabus", "Samples"],
    syllabus: { Quant: ["Arithmetic"], Reasoning: ["Logical"], English: ["RC/Grammar"], GK: ["Current"] },
    official: "https://www.set-test.org/",
  },
  {
    id: "nchm-jee",
    name: "NCHM JEE",
    stream: "Hospitality/Tourism",
    pattern: "Numerical, Reasoning, English, GA, Service Aptitude",
    subjects: ["Numerical", "Reasoning", "English", "GA", "Service"],
    application: "Feb–Mar",
    window: "May",
    resources: ["Official Info", "Syllabus", "Sample papers"],
    syllabus: { Service: ["Situational judgment"], English: ["RC", "Vocab"] },
    official: "https://nchmjee.nta.nic.in/",
  },
];

/* ---------- Storage ---------- */
const favKey = "aspirely_fav_exams";
const planKey = "aspirely_exam_plans";
const loadFavs = () => { try { return new Set(JSON.parse(localStorage.getItem(favKey) || "[]")); } catch { return new Set(); } };
const saveFavs = (set) => localStorage.setItem(favKey, JSON.stringify(Array.from(set)));
const loadPlans = () => { try { return JSON.parse(localStorage.getItem(planKey) || "{}"); } catch { return {}; } };
const savePlans = (obj) => localStorage.setItem(planKey, JSON.stringify(obj));

/* ---------- Study plan ---------- */
function generatePlan(exam, weeks = 8) {
  const topics = [];
  Object.entries(exam.syllabus || {}).forEach(([subj, arr]) => (arr || []).forEach((t) => topics.push(`${subj}: ${t}`)));
  if (topics.length < weeks) for (let i = topics.length; i < weeks; i++) topics.push(`Mixed practice & PYQs (block ${i + 1})`);
  const perWeek = Math.ceil(topics.length / weeks);
  return Array.from({ length: weeks }, (_, w) => ({
    week: w + 1,
    focus: topics.slice(w * perWeek, Math.min((w + 1) * perWeek, topics.length)),
    tasks: ["Revise NCERT/notes", "Timed questions", "Error log + flashcards", "1 mock / sectional test"],
  }));
}

/* ---------- UI atoms ---------- */
const Chip = ({ active, onClick, children, id }) => (
  <button
    id={id}
    onClick={onClick}
    aria-current={active ? "true" : undefined}
    className={[
      "inline-flex items-center gap-2 px-4 py-2 rounded-full border transition shrink-0 snap-start",
      active
        ? "bg-[#2B6CB0] text-white border-[#2B6CB0] shadow-sm"
        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
    ].join(" ")}
  >
    {children}
  </button>
);

function StarButton({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Remove from favourites" : "Add to favourites"}
      title={active ? "Pinned — click to unpin" : "Star to pin to favourites"}
      className={
        "relative rounded-full p-2 transition " +
        (active
          ? "bg-amber-100/90 text-amber-600 hover:bg-amber-200"
          : "bg-slate-100 text-slate-500 hover:text-amber-600 hover:bg-slate-200")
      }
    >
      <i className={"ph " + (active ? "ph-star-fill" : "ph-star")} />
      {active && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 shadow ring-2 ring-white" />}
    </button>
  );
}

function ExamCard({ exam, isFav, toggleFav, openPlan }) {
  const { ref, style, onMove, onLeave } = useTilt();
  return (
    <motion.div
      layout
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }}
      className="h-full"
    >
      <DepthShell className="h-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 grid place-items-center rounded-xl bg-[#2B6CB0]/10 text-[#2B6CB0]">
              <i className="ph ph-medal text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{exam.name}</h3>
                {isFav && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <i className="ph ph-star-fill" /> Pinned
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">{exam.stream}</div>
            </div>
          </div>
          <StarButton active={isFav} onClick={() => toggleFav(exam.id)} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Pattern</div><div className="mt-1">{exam.pattern}</div></div>
          <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Subjects</div><div className="mt-1">{exam.subjects.join(", ")}</div></div>
          <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Application</div><div className="mt-1">{exam.application}</div></div>
          <div className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">Exam Window</div><div className="mt-1">{exam.window}</div></div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {exam.resources.map((t, i) => (
            <span key={i} className="text-xs rounded-full border px-2.5 py-1 bg-white">{t}</span>
          ))}
        </div>

        {/* Actions: Study plan + Official link */}
        <div className="mt-4 flex gap-2 flex-wrap items-center">
          <button
            onClick={() => openPlan(exam)}
            className="inline-flex items-center gap-2 rounded-full bg-[#2B6CB0] text-white px-4 py-2 text-sm font-semibold hover:bg-[#255ea3] transition"
          >
            <i className="ph ph-note-pencil" /> Study plan
          </button>

          {exam.official && (
            <a
              href={exam.official}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:border-[#2B6CB0] hover:text-[#2B6CB0] bg-white"
              title="Official website"
            >
              <i className="ph ph-link-simple" /> Official
            </a>
          )}

          <span className="inline-flex items-center gap-1 text-xs text-slate-500 px-3">
            <i className="ph ph-star text-amber-500" /> Star to pin favourites on top
          </span>
        </div>
      </DepthShell>
    </motion.div>
  );
}

/* ---------- Page ---------- */
export default function ExamPrep() {
  const [query, setQuery] = useState("");
  const [stream, setStream] = useState("All");
  const [favs, setFavs] = useState(loadFavs());
  const [plans, setPlans] = useState(loadPlans());
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => saveFavs(favs), [favs]);
  useEffect(() => savePlans(plans), [plans]);

  // auto-center active chip into view
  const chipsRef = useRef(null);
  useEffect(() => {
    const el = document.getElementById(`chip-${stream}`);
    if (el && chipsRef.current) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [stream]);

  const lists = useMemo(() => {
    const q = query.trim().toLowerCase();

    // ✅ Relaxed stream match so "General (CUET-UG)" shows under "General"
    const base = EXAMS.filter((e) => {
      const s = (e.stream || "").toLowerCase();
      const want = stream.toLowerCase();
      const streamOK =
        stream === "All" || s === want || s.startsWith(want) || s.includes(want);
      const qOK = !q || e.name.toLowerCase().includes(q) || s.includes(q);
      return streamOK && qOK;
    });

    const favList = base.filter((e) => favs.has(e.id)).sort((a, b) => a.name.localeCompare(b.name));
    const restList = base.filter((e) => !favs.has(e.id)).sort((a, b) => a.name.localeCompare(b.name));
    return { favList, restList };
  }, [query, stream, favs]);

  function toggleFav(id) {
    setFavs((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function openPlan(exam) {
    const saved = plans[exam.id];
    setActivePlan({ exam, weeks: saved?.weeks || 8, data: saved?.data || generatePlan(exam, saved?.weeks || 8) });
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Sleek masked scrollbar for chip row only (no stray boxes) */}
      <style>{`
        .chips {
          overflow-x: auto; -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; scroll-behavior: smooth;
          mask-image: linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%);
        }
        .chips::-webkit-scrollbar { height: 6px; }
        .chips::-webkit-scrollbar-thumb { background: linear-gradient(90deg,#2B6CB044,#F6AD5544); border-radius: 9999px; }
        .chips::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* HERO */}
      <section className="relative pt-28 pb-8">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#2B6CB0]/15 blur-3xl -z-10" />
        <div className="absolute -bottom-24 -right-24 h-[26rem] w-[26rem] rounded-full bg-[#F6AD55]/20 blur-3xl -z-10" />
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Exam Prep <span className="text-[#2B6CB0]">&</span> Shortlists
          </h1>
          <p className="mt-3 text-[#2D3748]">⭐ <b>Pin</b> an exam to move it to the top Favourites section.</p>

          {/* Controls */}
          <div className="mt-6 grid md:grid-cols-[1fr_auto] gap-3 items-center max-w-4xl mx-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exams (e.g., JEE, NEET, CLAT, UCEED, CUET)…"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]"
            />

            {/* Chips — no extra wrapper; just the scroller */}
            <div ref={chipsRef} className="chips flex items-center gap-2 pr-1 rounded-xl">
              <Chip id="chip-All" active={stream === "All"} onClick={() => setStream("All")}>
                <i className="ph ph-squares-four" /> All
              </Chip>
              {STREAMS.map((s) => (
                <Chip
                  key={s.key}
                  id={`chip-${s.key}`}
                  active={stream === s.key}
                  onClick={() => setStream(s.key)}
                >
                  <i className={`ph ${s.icon}`} /> {s.key.replace("Health & Life Sciences", "Health")}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GRIDS */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          <AnimatePresence initial={false}>
            {lists.favList.length > 0 && (
              <motion.div layout key="fav">
                <div className="mb-2 flex items-center gap-2">
                  <i className="ph ph-star-fill text-amber-500" />
                  <h2 className="text-lg font-semibold">Favourites</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {lists.favList.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} isFav={true} toggleFav={toggleFav} openPlan={openPlan} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout>
            <div className="mb-2 flex items-center gap-2">
              <i className="ph ph-list-bullets text-slate-400" />
              <h2 className="text-lg font-semibold">All exams</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {lists.restList.map((exam) => (
                <ExamCard key={exam.id} exam={exam} isFav={false} toggleFav={toggleFav} openPlan={openPlan} />
              ))}
            </div>
            {lists.favList.length + lists.restList.length === 0 && (
              <div className="max-w-3xl mx-auto px-6 mt-8 text-center text-slate-500">
                Nothing matched your search. Try another stream or keyword.
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* PLAN MODAL */}
      {activePlan && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setActivePlan(null)} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-3xl">
              <DepthShell className="bg-white p-0">
                <div className="p-5 md:p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Study Plan — {activePlan.exam.name}</h3>
                    <button onClick={() => setActivePlan(null)} className="p-2 rounded-full hover:bg-slate-100">
                      <i className="ph ph-x" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <label className="col-span-2">
                      <span className="text-xs text-slate-500">Weeks</span>
                      <input
                        type="number" min={6} max={16} value={activePlan.weeks}
                        onChange={(e) => {
                          const weeks = Math.max(6, Math.min(16, Number(e.target.value || 8)));
                          setActivePlan((p) => ({ ...p, weeks, data: generatePlan(p.exam, weeks) }));
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]"
                      />
                    </label>
                    <div className="flex gap-2 items-end">
                      <button
                        onClick={() => savePlans({ ...plans, [activePlan.exam.id]: { weeks: activePlan.weeks, data: activePlan.data } })}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#2B6CB0] text-white px-4 py-2 font-semibold hover:bg-[#255ea3] transition"
                      >
                        <i className="ph ph-floppy-disk" /> Save
                      </button>
                      <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-slate-50">
                        <i className="ph ph-printer" /> Print
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-6 max-h-[60vh] overflow-auto print:max-h-none">
                  <div className="grid md:grid-cols-2 gap-6">
                    {activePlan.data.map((wk) => (
                      <div key={wk.week} className="rounded-xl border p-4">
                        <div className="font-semibold">Week {wk.week}</div>
                        <ul className="mt-2 list-disc pl-5 text-sm">
                          {wk.focus.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                        <div className="mt-2 text-xs text-slate-500">Tasks:</div>
                        <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
                          {wk.tasks.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-xs text-slate-500">
                    Tip: Mix PYQs weekly. Two mocks in the final fortnight. Sleep, food, and breaks matter.
                  </div>
                </div>
              </DepthShell>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
