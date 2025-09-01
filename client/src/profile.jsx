// src/profile.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "./auth.jsx";

/* ---------- constants / utils ---------- */
const QUIZ_KEY_RES = "aspirely:lastResult";
const QUIZ_KEY_ANS = "aspirely:lastAnswers";

function usePhosphorCSS() {
  useEffect(() => {
    if (document.getElementById("phosphor-css")) return;
    const link = document.createElement("link");
    link.id = "phosphor-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/@phosphor-icons/web@2.1.1/src/css/phosphor.css";
    document.head.appendChild(link);
  }, []);
}

async function ensureJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load jsPDF CDN"));
    document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

function normalizeResult(raw) {
  if (!raw) return null;
  const explanation = raw.explanation || {};
  const details = explanation.career_details || {};
  const title = explanation.career || details.title || raw.career || "Career Match";
  const summary = explanation.summary || details.description || "";
  const skills = Array.isArray(details.skills) ? details.skills : [];
  const edu = Array.isArray(details.education) ? details.education : [];
  const exams = Array.isArray(details.entrance_exams) ? details.entrance_exams : [];
  const colleges = Array.isArray(details.colleges) ? details.colleges : [];
  const extras = {
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    score: typeof raw.score === "number" ? raw.score : null,
  };
  return { title, summary, skills, edu, exams, colleges, extras, raw };
}

/* ---------- small UI bits ---------- */
const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 shadow-sm">
    {children}
  </span>
);
const Card = ({ children }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_42px_-24px_rgba(2,6,23,.25)]">
    {children}
  </div>
);

/* ---------- main ---------- */
export default function Profile() {
  usePhosphorCSS();
  const { user } = useAuth();

  // Load once from localStorage (only updates after you press “Save” on the quiz screen)
  const [result] = useState(() => {
    try {
      return normalizeResult(JSON.parse(localStorage.getItem(QUIZ_KEY_RES) || "null"));
    } catch {
      return null;
    }
  });

  const [pdfBusy, setPdfBusy] = useState(false);
  const [error, setError] = useState("");

  const hasResult = !!result;

  async function downloadPDF() {
    if (!result) return;
    setPdfBusy(true);
    setError("");
    try {
      const jsPDF = await ensureJsPDF();
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 56;
      const width = doc.internal.pageSize.getWidth() - margin * 2;
      let y = margin;

      const h1 = (t) => { doc.setFont("helvetica","bold"); doc.setFontSize(20); doc.text(t, margin, y); y += 26; };
      const h2 = (t) => { doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.text(t, margin, y); y += 18; };
      const para = (t) => {
        doc.setFont("helvetica","normal"); doc.setFontSize(11);
        doc.splitTextToSize(t, width).forEach(line => { if (y>780){doc.addPage(); y=margin;} doc.text(line, margin, y); y+=15; });
        y += 4;
      };
      const list = (arr) => {
        doc.setFont("helvetica","normal"); doc.setFontSize(11);
        arr.forEach(it => {
          doc.splitTextToSize(`• ${it}`, width).forEach(line => { if (y>780){doc.addPage(); y=margin;} doc.text(line, margin, y); y+=15; });
        });
        y += 6;
      };

      h1(`Aspirely — ${result.title}`);
      doc.setFontSize(10); doc.setTextColor(120);
      doc.text(`Generated for ${user?.email || "guest"} — ${new Date().toLocaleString()}`, margin, y);
      y += 18; doc.setTextColor(0);

      if (result.summary) { h2("Summary"); para(result.summary); }
      if (result.skills?.length) { h2("Skills"); list(result.skills); }
      if (result.edu?.length) { h2("Education Path"); list(result.edu); }
      if (result.exams?.length) { h2("Entrance Exams"); list(result.exams); }
      if (result.colleges?.length) { h2("Top Colleges"); list(result.colleges); }

      if (result.extras?.score != null || (result.extras?.tags || []).length) {
        h2("Additional");
        const ex = [];
        if (result.extras.score != null) ex.push(`Score: ${result.extras.score}`);
        if ((result.extras.tags || []).length) ex.push(`Tags: ${result.extras.tags.join(", ")}`);
        list(ex);
      }

      doc.save(`Aspirely_${result.title.replace(/\s+/g,"_")}.pdf`);
    } catch (e) {
      setError(`PDF failed (${e.message}). Use Print → Save as PDF.`);
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className="min-h-[100vh] bg-[#F7FAFC] text-[#1A202C]">
      {/* hero (same vibe as homepage) */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#2B6CB0]/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -top-28 -right-24 h-[26rem] w-[26rem] rounded-full bg-[#F6AD55]/25 blur-3xl" />
        <div className="max-w-6xl mx-auto px-6 pt-28 pb-14">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="text-sm text-gray-500">Profile</div>
            <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A202C]">
              {user?.email || "Guest"}
            </h1>
            <p className="mt-3 text-gray-700">Your saved career result, beautifully packaged.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge><i className="ph ph-seal-check mr-2" />Verified locally</Badge>
              <Badge><i className="ph ph-file-text mr-2" />One-click PDF</Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* body */}
      <main className="max-w-6xl mx-auto px-6 pb-16 grid lg:grid-cols-3 gap-8">
        {/* main result */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            {!hasResult ? (
              <div className="text-gray-700">
                No saved result yet. Open the quiz and press <span className="font-semibold">Save</span> to store it here.
              </div>
            ) : (
              <div className="space-y-6">
                {/* header row */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-2xl md:text-3xl font-extrabold text-[#2B6CB0]">
                      {result.title}
                    </div>
                    {result.summary && (
                      <p className="mt-2 text-gray-700 max-w-3xl">{result.summary}</p>
                    )}
                  </div>

                  <button
                    onClick={downloadPDF}
                    disabled={pdfBusy}
                    className="relative overflow-hidden rounded-xl bg-[#2B6CB0] px-4 py-2 text-white font-semibold shadow hover:bg-[#255ea3] transition disabled:opacity-60"
                  >
                    <span className="relative z-10 inline-flex items-center gap-2">
                      {pdfBusy ? <i className="ph ph-circle-notch animate-spin" /> : <i className="ph ph-download-simple" />}
                      Download PDF
                    </span>
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shine_1.4s_ease-in-out_infinite]" />
                  </button>
                </div>

                {/* info grids */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <div className="flex items-center gap-2 font-semibold">
                      <i className="ph ph-wrench" /> Skills
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.skills?.length ? (
                        result.skills.map((s, i) => <Badge key={i}>{s}</Badge>)
                      ) : (
                        <div className="text-gray-500 text-sm">—</div>
                      )}
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center gap-2 font-semibold">
                      <i className="ph ph-graduation-cap" /> Education Path
                    </div>
                    <ul className="mt-3 list-disc list-inside text-sm text-gray-700 space-y-1">
                      {result.edu?.length ? (
                        result.edu.map((s, i) => <li key={i}>{s}</li>)
                      ) : (
                        <li className="text-gray-500">—</li>
                      )}
                    </ul>
                  </Card>

                  <Card>
                    <div className="flex items-center gap-2 font-semibold">
                      <i className="ph ph-file-text" /> Entrance Exams
                    </div>
                    <ul className="mt-3 list-disc list-inside text-sm text-gray-700 space-y-1">
                      {result.exams?.length ? (
                        result.exams.map((s, i) => <li key={i}>{s}</li>)
                      ) : (
                        <li className="text-gray-500">—</li>
                      )}
                    </ul>
                  </Card>

                  <Card>
                    <div className="flex items-center gap-2 font-semibold">
                      <i className="ph ph-buildings" /> Top Colleges
                    </div>
                    <ul className="mt-3 list-disc list-inside text-sm text-gray-700 space-y-1">
                      {result.colleges?.length ? (
                        result.colleges.map((s, i) => <li key={i}>{s}</li>)
                      ) : (
                        <li className="text-gray-500">—</li>
                      )}
                    </ul>
                  </Card>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* side column */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 font-semibold">
              <i className="ph ph-user" /> Account
            </div>
            <div className="mt-2 text-sm">
              Signed in as <span className="font-semibold">{user?.email || "Guest"}</span>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Your quiz result is stored locally from the last time you pressed <b>Save</b> on the quiz page.
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 font-semibold">
              <i className="ph ph-lightbulb-filament" /> Tips
            </div>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>Retake the quiz with different choices to compare results.</li>
              <li>Share the PDF with mentors or counselors.</li>
            </ul>
          </Card>
        </div>
      </main>

      <style>{`@keyframes shine { from { transform: translateX(-120%) } to { transform: translateX(120%) } }`}</style>
    </div>
  );
}
