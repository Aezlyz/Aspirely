// Trending.jsx — Aspirely • Trending Careers (India)
// Self-contained: data + UI. Tailwind + Framer Motion + Phosphor icons.
// Features: search, stream chips (masked scrollbar), sort, remote/entry filters,
// favourites (pinned), animated reordering, quick-view modal.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Utilities ---------- */

function rupeeLPA(n) {
  if (n == null) return "—";
  return `₹ ${n.toFixed(1)} LPA`;
}

/* ---------- Tilt shell (same style as other pages) ---------- */
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

/* ---------- Streams + Data ---------- */

const STREAMS = [
  { key: "Engineering/Tech", icon: "ph-cpu" },
  { key: "Health & Life Sciences", icon: "ph-heartbeat" },
  { key: "Business/Management", icon: "ph-briefcase" },
  { key: "Finance & Commerce", icon: "ph-currency-inr" },
  { key: "Design", icon: "ph-pen-nib" },
  { key: "Architecture", icon: "ph-buildings" },
  { key: "Law", icon: "ph-scales" },
  { key: "Media & Communication", icon: "ph-megaphone" },
  { key: "Science & Research", icon: "ph-flask" },
  { key: "Government/PSU", icon: "ph-seal-check" },
];

const TRENDING = [
  // Engineering/Tech
  { id:"soft-eng", title:"Software Engineer", stream:"Engineering/Tech", growth:9.2, salaryMid:12.0, remote:true, entry:true, tags:["B.Tech CSE/IT","DSA","Web"], skills:["JavaScript","React","APIs","SQL"], edu:{ug:"B.Tech (CSE/IT) 4y", pg:"M.Tech/MS (optional)"},
    blurb:"Build and ship web/mobile/cloud software; huge demand across startups and MNCs." },
  { id:"ml-eng", title:"Machine Learning Engineer", stream:"Engineering/Tech", growth:9.6, salaryMid:18.0, remote:true, entry:false, tags:["AI/ML","Python","MLOps"], skills:["Python","PyTorch","Data Pipelines"], edu:{ug:"B.Tech (AI/DS/CSE) 4y", pg:"M.Tech/MS (AI) optional"},
    blurb:"Design models for recommendations, vision, NLP; strong maths/data foundations." },
  { id:"data-sci", title:"Data Scientist", stream:"Engineering/Tech", growth:9.0, salaryMid:16.0, remote:true, entry:false, tags:["Stats","Python","SQL"], skills:["EDA","ML","Storytelling"], edu:{ug:"B.Tech/B.Sc (Stats/CS) 3–4y", pg:"M.Sc/M.Tech (Data) optional"},
    blurb:"Analyze data to drive decisions; blend statistics, ML, and business context." },
  { id:"sre", title:"Site Reliability Engineer", stream:"Engineering/Tech", growth:8.5, salaryMid:15.0, remote:true, entry:false, tags:["DevOps","Cloud","Linux"], skills:["Kubernetes","AWS","Monitoring"], edu:{ug:"B.Tech (CSE/IT) 4y", pg:"—"},
    blurb:"Keep production systems reliable and fast using automation and observability." },
  { id:"cybersec", title:"Cybersecurity Analyst", stream:"Engineering/Tech", growth:9.1, salaryMid:14.0, remote:true, entry:true, tags:["Security","Risk"], skills:["Threat intel","SIEM","VAPT"], edu:{ug:"B.Tech (CSE/IT) or B.Sc (CS) 3–4y", pg:"PG Dip (Cyber) optional"},
    blurb:"Protect orgs from threats; SOC monitoring, red/blue teams, compliance." },
  { id:"product-mgr", title:"Product Manager (Tech)", stream:"Engineering/Tech", growth:8.8, salaryMid:20.0, remote:true, entry:false, tags:["PM","Roadmaps"], skills:["Discovery","Specs","Analytics"], edu:{ug:"B.Tech any + skills 4y", pg:"MBA (optional)"},
    blurb:"Own product outcomes; work with design/eng to ship features and drive metrics." },
  { id:"ui-ux", title:"UX/UI Designer", stream:"Design", growth:8.7, salaryMid:11.0, remote:true, entry:true, tags:["B.Des","HCI"], skills:["Figma","Research","IA"], edu:{ug:"B.Des (Interaction/Comm) 4y", pg:"M.Des (optional)"},
    blurb:"Design intuitive products via research, wireframes, prototyping and testing." },
  // Business/Management
  { id:"biz-analyst", title:"Business Analyst", stream:"Business/Management", growth:8.2, salaryMid:9.0, remote:true, entry:true, tags:["BBA","SQL","Excel"], skills:["Dashboards","Req. gathering"], edu:{ug:"BBA/B.Com/BA(Econ) 3y", pg:"MBA (optional)"},
    blurb:"Translate business problems into data-backed insights and requirements." },
  { id:"growth-mkt", title:"Growth/Performance Marketer", stream:"Business/Management", growth:8.4, salaryMid:10.5, remote:true, entry:true, tags:["Ads","Analytics"], skills:["Meta/Google Ads","CRO"], edu:{ug:"BBA/Any 3y", pg:"—"},
    blurb:"Run measurable campaigns; focus on CAC/LTV, funnels and creative testing." },
  { id:"ops-mgr", title:"Operations Manager", stream:"Business/Management", growth:7.9, salaryMid:10.0, remote:false, entry:false, tags:["Ops","Supply"], skills:["Process","Vendor","Excel"], edu:{ug:"BBA/BMS/BE(Prod) 3–4y", pg:"MBA (Ops) optional"},
    blurb:"Scale processes, vendors and SLAs; optimise cost, quality and speed." },
  // Finance & Commerce
  { id:"financial-analyst", title:"Financial Analyst", stream:"Finance & Commerce", growth:7.8, salaryMid:9.5, remote:true, entry:true, tags:["Valuation","Excel"], skills:["DCF","FP&A","Reporting"], edu:{ug:"B.Com/BBA(Fin) 3y", pg:"MBA/CFA (optional)"},
    blurb:"Model revenues/costs, track KPIs, and support investment or corporate finance." },
  { id:"accounting", title:"Accounts Associate", stream:"Finance & Commerce", growth:7.0, salaryMid:6.0, remote:false, entry:true, tags:["GST","Tally"], skills:["Book-keeping","Compliance"], edu:{ug:"B.Com 3y", pg:"CA/CS (optional)"},
    blurb:"Manage day-to-day accounting, taxation and statutory compliance." },
  // Health & Life Sciences
  { id:"biomed", title:"Biomedical Engineer", stream:"Health & Life Sciences", growth:8.1, salaryMid:8.5, remote:false, entry:true, tags:["Devices","Hospitals"], skills:["Instrumentation","QA"], edu:{ug:"B.Tech (Biomedical) 4y", pg:"M.Tech (optional)"},
    blurb:"Work on medical devices, hospital systems and regulatory compliance." },
  { id:"public-health", title:"Public Health Analyst", stream:"Health & Life Sciences", growth:8.3, salaryMid:8.0, remote:true, entry:true, tags:["Epidemiology","Data"], skills:["Stata/R","Monitoring"], edu:{ug:"BPH/B.Sc (Life Sci) 3y", pg:"MPH (preferred)"},
    blurb:"Analyze health programs and data to improve outcomes and policy." },
  // Law
  { id:"corp-law", title:"Corporate Lawyer", stream:"Law", growth:7.6, salaryMid:12.0, remote:false, entry:false, tags:["BA LL.B","Contracts"], skills:["Drafting","Negotiation"], edu:{ug:"BA LL.B (Hons) 5y", pg:"LL.M (optional)"},
    blurb:"Advisory and transactions for companies — contracts, compliance, diligence." },
  { id:"lit-law", title:"Litigation Associate", stream:"Law", growth:7.2, salaryMid:7.0, remote:false, entry:true, tags:["Courts","Research"], skills:["Pleadings","Case law"], edu:{ug:"BA LL.B 5y", pg:"—"},
    blurb:"Court work with seniors; drafting, research and appearances." },
  // Design
  { id:"comm-design", title:"Communication Designer", stream:"Design", growth:8.0, salaryMid:9.0, remote:true, entry:true, tags:["B.Des","Brand"], skills:["Visual","Motion"], edu:{ug:"B.Des (Communication) 4y", pg:"M.Des optional"},
    blurb:"Visual systems for brands, campaigns, motion and content." },
  { id:"game-artist", title:"Game/3D Artist", stream:"Design", growth:8.4, salaryMid:10.0, remote:true, entry:true, tags:["3D","Realtime"], skills:["Blender","Unity/UE"], edu:{ug:"B.Des/B.Sc (Animation/Game) 3–4y", pg:"—"},
    blurb:"Assets and environments for games and XR; stylised or realistic." },
  // Architecture
  { id:"architect", title:"Architect (Junior)", stream:"Architecture", growth:7.5, salaryMid:7.5, remote:false, entry:true, tags:["B.Arch","Design"], skills:["Studio","Revit"], edu:{ug:"B.Arch 5y + NATA", pg:"M.Arch optional"},
    blurb:"Concept to construction drawings; residential, commercial or urban." },
  // Media & Communication
  { id:"content-strat", title:"Content Strategist", stream:"Media & Communication", growth:8.2, salaryMid:8.0, remote:true, entry:true, tags:["Editorial","SEO"], skills:["Writing","Research"], edu:{ug:"BJMC/Any 3y", pg:"—"},
    blurb:"Own voice & tone, plan content calendars, and coordinate creators." },
  { id:"video-editor", title:"Video Editor", stream:"Media & Communication", growth:8.0, salaryMid:7.0, remote:true, entry:true, tags:["Premiere","After Effects"], skills:["Editing","Motion"], edu:{ug:"BJMC/B.Des 3–4y", pg:"—"},
    blurb:"Short-form and long-form edits for brands, creators and OTT." },
  // Science & Research
  { id:"env-scientist", title:"Environmental Scientist", stream:"Science & Research", growth:8.1, salaryMid:8.0, remote:false, entry:true, tags:["Field","Lab"], skills:["Sampling","GIS"], edu:{ug:"B.Sc (Env/Geo) 3y", pg:"M.Sc preferred"},
    blurb:"Assess impact, remediation and policy for air/water/soil." },
  // Government/PSU
  { id:"ias", title:"Civil Services (IAS/IPS etc.)", stream:"Government/PSU", growth:6.8, salaryMid:10.0, remote:false, entry:true, tags:["UPSC","Gov"], skills:["General Studies","Ethics"], edu:{ug:"Any UG 3–4y", pg:"—"},
    blurb:"Nationwide competitive roles in administration, policing, foreign service." },
  // Add more… (you can extend this list; UI scales automatically)
];

/* ---------- Storage ---------- */
const favKey = "aspirely_trending_fav";
const loadFavs = () => { try { return new Set(JSON.parse(localStorage.getItem(favKey) || "[]")); } catch { return new Set(); } };
const saveFavs = (set) => localStorage.setItem(favKey, JSON.stringify(Array.from(set)));

/* ---------- UI atoms ---------- */

const Chip = ({ active, onClick, children, id }) => (
  <button
    id={id}
    onClick={onClick}
    className={[
      "inline-flex items-center gap-2 px-4 py-2 rounded-full border transition shrink-0 snap-start",
      active ? "bg-[#2B6CB0] text-white border-[#2B6CB0] shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
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
      title={active ? "Pinned — click to unpin" : "Star to pin to favourites"}
      className={
        "relative rounded-full p-2 transition " +
        (active ? "bg-amber-100/90 text-amber-600 hover:bg-amber-200" : "bg-slate-100 text-slate-500 hover:text-amber-600 hover:bg-slate-200")
      }
    >
      <i className={"ph " + (active ? "ph-star-fill" : "ph-star")} />
      {active && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 shadow ring-2 ring-white" />}
    </button>
  );
}

/* ---------- Card & Modal ---------- */

function CareerCard({ item, isFav, toggleFav, open }) {
  const { ref, style, onMove, onLeave } = useTilt();
  return (
    <motion.div layout ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={style}
      initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }} className="h-full">
      <DepthShell className="h-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 grid place-items-center rounded-xl bg-[#2B6CB0]/10 text-[#2B6CB0]">
              <i className="ph ph-briefcase" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                {isFav && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <i className="ph ph-star-fill" /> Pinned
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">{item.stream}</div>
            </div>
          </div>
          <StarButton active={isFav} onClick={() => toggleFav(item.id)} />
        </div>

        <p className="mt-3 text-sm text-slate-700 line-clamp-3">{item.blurb}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((t, i) => (
            <span key={i} className="text-xs rounded-full border px-2.5 py-1 bg-white">{t}</span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-slate-500">Momentum</div>
            <div className="font-semibold">{item.growth.toFixed(1)}/10</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-slate-500">Median</div>
            <div className="font-semibold">{rupeeLPA(item.salaryMid)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-slate-500">Remote</div>
            <div className="font-semibold">{item.remote ? "Yes" : "Hybrid/On-site"}</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={() => open(item)}
            className="inline-flex items-center gap-2 rounded-full bg-[#2B6CB0] text-white px-4 py-2 text-sm font-semibold hover:bg-[#255ea3] transition">
            <i className="ph ph-info" /> Quick view
          </button>
          {item.entry && <span className="text-xs rounded-full border px-2.5 py-1 bg-white">Entry-friendly</span>}
        </div>
      </DepthShell>
    </motion.div>
  );
}

/* ---------- Main Page ---------- */

export default function Trending() {
  const [query, setQuery] = useState("");
  const [stream, setStream] = useState("All");
  const [sort, setSort] = useState("growth"); // growth | salary | remote
  const [onlyRemote, setOnlyRemote] = useState(false);
  const [onlyEntry, setOnlyEntry] = useState(false);
  const [favs, setFavs] = useState(loadFavs());
  const [active, setActive] = useState(null); // career object

  useEffect(() => saveFavs(favs), [favs]);

  // auto-center active chip
  const chipsRef = useRef(null);
  useEffect(() => {
    const el = document.getElementById(`chip-${stream}`);
    if (el && chipsRef.current) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [stream]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = TRENDING.filter(
      (c) =>
        (stream === "All" || c.stream === stream) &&
        (!q || c.title.toLowerCase().includes(q) || c.stream.toLowerCase().includes(q)) &&
        (!onlyRemote || c.remote) &&
        (!onlyEntry || c.entry)
    );

    const cmp = {
      growth: (a, b) => b.growth - a.growth || b.salaryMid - a.salaryMid,
      salary: (a, b) => b.salaryMid - a.salaryMid || b.growth - a.growth,
      remote: (a, b) => (Number(b.remote) - Number(a.remote)) || b.growth - a.growth,
    }[sort];

    list = list.slice().sort(cmp);

    const favList = list.filter((c) => favs.has(c.id)).sort(cmp);
    const restList = list.filter((c) => !favs.has(c.id)).sort(cmp);
    return { favList, restList };
  }, [query, stream, sort, onlyRemote, onlyEntry, favs]);

  function toggleFav(id) {
    setFavs((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <main className="min-h-screen bg-white">
      {/* sleek masked scrollbar just for chip row */}
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
            Trending Careers in India
          </h1>
          <p className="mt-3 text-[#2D3748]">
            Real roles, not vague labels — pin favourites ⭐, filter by stream or remote, and scan momentum vs salary.
          </p>

          {/* Controls */}
          <div className="mt-6 grid gap-3 max-w-5xl mx-auto md:grid-cols-[1fr_auto]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search careers (e.g., Software, UX, Lawyer, Analyst)…"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]"
            />
            <div className="flex items-center gap-2 justify-end">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="accent-[#2B6CB0]" checked={onlyRemote} onChange={(e)=>setOnlyRemote(e.target.checked)} />
                Remote only
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="accent-[#2B6CB0]" checked={onlyEntry} onChange={(e)=>setOnlyEntry(e.target.checked)} />
                Entry-friendly
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]"
              >
                <option value="growth">Sort: Hiring momentum</option>
                <option value="salary">Sort: Median salary</option>
                <option value="remote">Sort: Remote-friendliness</option>
              </select>
            </div>
          </div>

          {/* Stream chips */}
          <div ref={chipsRef} className="chips mt-4 flex items-center gap-2 px-1">
            <Chip id="chip-All" active={stream==="All"} onClick={()=>setStream("All")}>
              <i className="ph ph-squares-four" /> All
            </Chip>
            {STREAMS.map((s)=>(
              <Chip key={s.key} id={`chip-${s.key}`} active={stream===s.key} onClick={()=>setStream(s.key)}>
                <i className={`ph ${s.icon}`} /> {s.key.replace("Health & Life Sciences","Health")}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* Favourites + All */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          <AnimatePresence initial={false}>
            {filtered.favList.length>0 && (
              <motion.div layout key="fav">
                <div className="mb-2 flex items-center gap-2">
                  <i className="ph ph-star-fill text-amber-500" />
                  <h2 className="text-lg font-semibold">Favourites</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {filtered.favList.map((c)=>(
                    <CareerCard key={c.id} item={c} isFav={true} toggleFav={toggleFav} open={setActive} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout>
            <div className="mb-2 flex items-center gap-2">
              <i className="ph ph-list-bullets text-slate-400" />
              <h2 className="text-lg font-semibold">All careers</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filtered.restList.map((c)=>(
                <CareerCard key={c.id} item={c} isFav={false} toggleFav={toggleFav} open={setActive} />
              ))}
            </div>
            {filtered.favList.length + filtered.restList.length === 0 && (
              <div className="max-w-3xl mx-auto px-6 mt-8 text-center text-slate-500">
                Nothing matched your filters. Try another stream or keyword.
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Quick View Modal */}
      {active && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setActive(null)} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-3xl">
              <DepthShell className="bg-white p-0">
                <div className="p-5 md:p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 grid place-items-center rounded-xl bg-[#2B6CB0]/10 text-[#2B6CB0]">
                        <i className="ph ph-briefcase" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{active.title}</h3>
                        <div className="text-xs text-slate-500">{active.stream}</div>
                      </div>
                    </div>
                    <button onClick={()=>setActive(null)} className="p-2 rounded-full hover:bg-slate-100">
                      <i className="ph ph-x" />
                    </button>
                  </div>
                </div>

                <div className="p-5 md:p-6 space-y-4">
                  <p className="text-slate-700">{active.blurb}</p>

                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-lg border p-3">
                      <div className="text-slate-500 text-xs">Hiring momentum</div>
                      <div className="text-lg font-semibold">{active.growth.toFixed(1)}/10</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-slate-500 text-xs">Median salary</div>
                      <div className="text-lg font-semibold">{rupeeLPA(active.salaryMid)}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-slate-500 text-xs">Work mode</div>
                      <div className="text-lg font-semibold">{active.remote ? "Remote-friendly" : "Hybrid/On-site"}</div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border p-4">
                      <div className="font-semibold mb-2">Core Skills</div>
                      <ul className="list-disc pl-5 text-slate-700">
                        {active.skills?.map((s,i)=>(<li key={i}>{s}</li>))}
                      </ul>
                    </div>
                    <div className="rounded-xl border p-4">
                      <div className="font-semibold mb-2">UG Path (India)</div>
                      <div className="text-sm">
                        <div><b>UG:</b> {active.edu?.ug || "—"}</div>
                        {active.edu?.pg && <div className="mt-1 text-slate-600"><b>PG (optional):</b> {active.edu.pg}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {active.tags?.map((t, i) => (
                      <span key={i} className="text-xs rounded-full border px-2.5 py-1 bg-white">{t}</span>
                    ))}
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
