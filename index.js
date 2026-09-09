import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen, PenLine, Timer, Mail, Megaphone, TrendingUp, Plus, X,
  AlertTriangle, ExternalLink, ChevronRight, Loader2, RefreshCw,
  CheckCircle2, ArrowLeft
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Data                                                                    */
/* ---------------------------------------------------------------------- */

const SPAM_WORDS = [
  "100% free","100% satisfied","additional income","be your own boss","best price",
  "big bucks","billion","cash bonus","cents on the dollar","consolidate debt",
  "double your cash","double your income","earn extra cash","earn money",
  "eliminate bad credit","extra cash","extra income","expect to earn","fast cash",
  "financial freedom","free access","free consultation","free gift","free hosting",
  "free info","free investment","free membership","free money","free preview",
  "free quote","free trial","full refund","get out of debt","get paid","giveaway",
  "guaranteed","increase sales","increase traffic","incredible deal","lower rates",
  "lowest price","make money","million dollars","miracle","money back",
  "once in a lifetime","one time","pennies a day","potential earnings","prize",
  "promise","pure profit","risk-free","satisfaction guaranteed","save big money",
  "save up to","special promotion","act now","apply now","become a member",
  "call now","click below","click here","get it now","do it today","don't delete",
  "exclusive deal","get started now","important information regarding",
  "information you requested","instant","limited time","new customers only",
  "order now","please read","see for yourself","sign up free","take action",
  "this won't last","urgent","what are you waiting for","while supplies last",
  "winner","winning","you are a winner","you have been selected","bulk email",
  "buy direct","cancel at any time","check or money order","congratulations",
  "confidentiality","cures","dear friend","direct email","direct marketing",
  "hidden charges","human growth hormone","internet marketing","lose weight",
  "mass email","meet singles","multi-level marketing","no catch","no cost",
  "no credit check","no fees","no gimmick","no hidden costs","no hidden fees",
  "no interest","no investment","no obligation","no purchase necessary",
  "no questions asked","no strings attached","not junk","not spam","obligation",
  "passwords","requires initial investment","social security number",
  "this isn't a scam","this isn't junk","this isn't spam","undisclosed",
  "unsecured credit","unsecured debt","unsolicited","weight loss","accept credit cards",
  "all new","as seen on","bargain","beneficiary","billing","bonus","cards accepted",
  "cash","certified","cheap","claims","clearance","compare rates","credit card offers",
  "deal","debt","discount","fantastic","income","investment","join millions",
  "lifetime","loans","luxury","marketing solution","message contains",
  "mortgage rates","name brand","offer","online marketing","opt in","pre-approved",
  "quote","rates","refinance","removal","reserves the right","score","search engine",
  "sent in compliance","subject to","terms and conditions","trial","unlimited",
  "warranty","web traffic","work from home"
];

const SEED_LIBRARY = [
  {
    id: "l1",
    type: "cold-email",
    title: "The \"Sent from iPhone\" re-engagement email",
    source: { name: "Email Matrix SOP", url: "" },
    reasonKind: "conversion",
    reasonDetail: "A 3-line fake-personal note to a 400k+ cold list generated thousands of replies and flooded sales with leads.",
    snippet: "Hey [name] did you get my [thing] special? Let me know\n\nSent from my iPhone"
  },
  {
    id: "l2",
    type: "email",
    title: "Investable-range video sequence",
    source: { name: "Email Matrix SOP", url: "" },
    reasonKind: "conversion",
    reasonDetail: "Segmenting a wealth-management list by stated investment range (not a generic blast) lifted engagement across every tier.",
    snippet: "A video sequence built per investable range ($1M-$5M vs $50M+), each addressing that tier's specific strategy concerns."
  },
  {
    id: "l3",
    type: "subject-line",
    title: "6\u201310 word, sub-60-character subject lines",
    source: { name: "Email Matrix SOP", url: "" },
    reasonKind: "skill",
    reasonDetail: "Measured across millions of sends: 6\u201310 words beat every other length band by ~12% open rate; punctuation and spam words both suppress delivery.",
    snippet: "no punctuation. lower case. under 60 characters. name or location worked in when possible."
  },
  {
    id: "l4",
    title: "ACAD WRITE \u2014 objection-handling chapter",
    type: "landing",
    source: { name: "Kwon \u2014 Acad Write copy", url: "" },
    reasonKind: "skill",
    reasonDetail: "Names the objection outright as a section header, then answers it directly instead of dodging \u2014 disarms rather than distracts.",
    snippet: "\"But it isn't ethical to use ghostwriting services.\" We place a premium on academic integrity, ensuring our collaboration adheres to ethical standards."
  },
  {
    id: "l5",
    type: "cold-email",
    title: "Credibility-stack reminder email",
    source: { name: "Email Matrix SOP", url: "" },
    reasonKind: "skill",
    reasonDetail: "Reminds a lead exactly where they came from (ad screenshot, form data, source link) before a sales call \u2014 raises show-rate by killing the \u201cwho is this\u201d moment.",
    snippet: "Screenshot of the ad they clicked + the form they filled + the answers they gave, framed as \u201chere's what you told us, here's who we are.\u201d"
  }
];

const MODES = [
  { id: "rewrite", label: "Rewrite", icon: PenLine, blurb: "Take real copy, swap the product/audience, rebuild it from scratch." },
  { id: "cloze", label: "Fill the Blank", icon: BookOpen, blurb: "Reconstruct the missing phrases in proven copy." },
  { id: "timed", label: "Timed Brief", icon: Timer, blurb: "A brief, a clock, a submission." },
  { id: "cold", label: "Cold Outreach", icon: Mail, blurb: "Email or call script to a cold or semi-warm lead." },
  { id: "ad", label: "Ad Script", icon: Megaphone, blurb: "A script for a paid ad on a named platform." }
];

const TIMED_TEMPLATES = [
  { kind: "subject-line", product: "a $3,000 zero-gravity office chair", audience: "past furniture buyers who haven't bought this item", seconds: 90,
    task: "Write a subject line only. 6\u201310 words, under 60 characters, minimal punctuation, no spam-trigger words." },
  { kind: "landing-hook", product: "a UK electrician lead-gen service", audience: "electricians tired of paying for bad leads", seconds: 150,
    task: "Write the hero headline + one supporting line for a landing page." },
  { kind: "value-email", product: "a self-built MBA-level learning curriculum", audience: "someone who already tried and quit self-education once", seconds: 180,
    task: "Write a short value-first email \u2014 no pitch, no CTA stacking, one genuinely useful idea." }
];

const COLD_TEMPLATES = [
  { persona: "Owner-operated electrician, 3-man crew, skeptical of marketers", context: "They've been burned by a lead-gen agency before.", channel: "email" },
  { persona: "Ops director at a mid-size logistics firm", context: "Cold, found via LinkedIn, no prior contact.", channel: "call" },
  { persona: "Solo MBA applicant, deadline in 3 weeks", context: "Downloaded a free guide, never replied to the follow-up.", channel: "email" }
];

const AD_TEMPLATES = [
  { platform: "Meta (Facebook/Instagram)", product: "a pay-per-shown-survey electrician lead service", angle: "cost-per-lead pain" },
  { platform: "TikTok", product: "a self-education / \"university in a box\" curriculum", angle: "credential skepticism" },
  { platform: "Google Search", product: "an MBA academic writing consultancy", angle: "deadline panic" }
];

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */

const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const punctCount = (s) => (s.match(/[.,!?;:'"()\-]/g) || []).length;
const findSpamWords = (s) => {
  const lower = " " + s.toLowerCase() + " ";
  return SPAM_WORDS.filter((w) => lower.includes(w));
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makeCloze(entry) {
  const words = entry.snippet.split(/(\s+)/);
  const candidates = words
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => /^[A-Za-z][A-Za-z'-]{4,}$/.test(w.trim()));
  const chosen = [];
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  for (const c of shuffled) {
    if (chosen.length >= 3) break;
    chosen.push(c);
  }
  chosen.sort((a, b) => a.i - b.i);
  const display = [...words];
  const blanks = chosen.map((c, idx) => {
    display[c.i] = `___${idx + 1}___`;
    return { id: idx + 1, answer: c.w };
  });
  return { displayText: display.join(""), blanks };
}

async function critique(system, userPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: userPrompt }]
    })
  });
  const data = await response.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function rubricFieldsForMode(mode, brief) {
  const base = ["clarity", "hook", "benefitVsFeature", "cta", "toneFit"];
  if (mode === "cold") return [...base, "openerStrength", "objectionHandling"];
  if (mode === "ad") return [...base, "hookQuality", "visualPairing"];
  if (mode === "timed" && brief?.kind === "landing-hook") return [...base, "contextSpecificity"];
  if (mode === "rewrite" || mode === "timed") return [...base, "contextSpecificity"];
  return base;
}

const FIELD_LABELS = {
  clarity: "Clarity",
  hook: "Hook",
  benefitVsFeature: "Benefit vs. Feature",
  cta: "CTA",
  toneFit: "Tone Fit",
  contextSpecificity: "Context Specificity",
  openerStrength: "Opener Strength",
  objectionHandling: "Objection Handling",
  hookQuality: "Hook Quality",
  visualPairing: "Visual Pairing"
};

/* ---------------------------------------------------------------------- */
/* Small UI primitives                                                     */
/* ---------------------------------------------------------------------- */

function Pill({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-700"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function ScoreBar({ label, score }) {
  const pct = Math.max(0, Math.min(100, (score / 5) * 100));
  const color = score >= 4 ? "bg-emerald-500" : score >= 3 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span className="font-semibold text-slate-700">{score}/5</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Main app                                                                 */
/* ---------------------------------------------------------------------- */

export default function CopyTrainer() {
  const [tab, setTab] = useState("drill");
  const [mode, setMode] = useState("rewrite");
  const [library, setLibrary] = useState(SEED_LIBRARY);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoaded, setAttemptsLoaded] = useState(false);

  const [entry, setEntry] = useState(null);
  const [brief, setBrief] = useState(null);
  const [cloze, setCloze] = useState(null);
  const [blankValues, setBlankValues] = useState({});
  const [rewriteProduct, setRewriteProduct] = useState("");
  const [rewriteAudience, setRewriteAudience] = useState("");
  const [draft, setDraft] = useState("");
  const [gate, setGate] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: "", type: "email", sourceName: "", sourceUrl: "", reasonKind: "conversion", reasonDetail: "", snippet: "" });

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("attempts", false);
        setAttempts(r ? JSON.parse(r.value) : []);
      } catch (e) {
        setAttempts([]);
      }
      setAttemptsLoaded(true);
    })();
  }, []);

  const startRound = useCallback((m, lib) => {
    clearInterval(timerRef.current);
    setDraft("");
    setResult(null);
    setGate(null);
    setError(null);
    setBlankValues({});
    setRewriteProduct("");
    setRewriteAudience("");
    setTimeLeft(null);

    if (m === "rewrite" || m === "cloze") {
      const pool = lib.length ? lib : SEED_LIBRARY;
      const picked = pick(pool);
      setEntry(picked);
      setBrief(null);
      if (m === "cloze") {
        const c = makeCloze(picked);
        setCloze(c);
        const initial = {};
        c.blanks.forEach((b) => (initial[b.id] = ""));
        setBlankValues(initial);
      } else {
        setCloze(null);
      }
    } else {
      setEntry(null);
      setCloze(null);
      let b;
      if (m === "timed") b = pick(TIMED_TEMPLATES);
      if (m === "cold") b = pick(COLD_TEMPLATES);
      if (m === "ad") b = pick(AD_TEMPLATES);
      setBrief(b);
      if (m === "timed") {
        setTimeLeft(b.seconds);
        timerRef.current = setInterval(() => {
          setTimeLeft((t) => {
            if (t <= 1) {
              clearInterval(timerRef.current);
              return 0;
            }
            return t - 1;
          });
        }, 1000);
      }
    }
  }, []);

  useEffect(() => {
    startRound(mode, library);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function saveAttempt(a) {
    const next = [a, ...attempts].slice(0, 300);
    setAttempts(next);
    try {
      await window.storage.set("attempts", JSON.stringify(next), false);
    } catch (e) {
      /* best effort */
    }
  }

  function composedDraftForCloze() {
    if (!cloze) return "";
    let text = cloze.displayText;
    cloze.blanks.forEach((b) => {
      text = text.replace(`___${b.id}___`, blankValues[b.id] || `[blank ${b.id}]`);
    });
    return text;
  }

  function buildPrompt() {
    const fields = rubricFieldsForMode(mode, brief);
    const fieldList = fields.map((f) => `"${f}"`).join(", ");
    let context = "";
    let submission = "";

    if (mode === "rewrite") {
      context = `Original copy (${entry.type}): "${entry.snippet}"\nSource: ${entry.source.name}. Why it's in the library: ${entry.reasonDetail}\nThe writer was told to rewrite it for a new product: "${rewriteProduct || "(unspecified)"}" and new audience: "${rewriteAudience || "(unspecified)"}".`;
      submission = draft;
    } else if (mode === "cloze") {
      context = `The writer reconstructed blanked-out phrases in this proven piece of copy (${entry.type}, source: ${entry.source.name}). Original had ${cloze.blanks.length} blanks. Judge how well their filled-in version captures similarly persuasive, on-pattern phrasing \u2014 not whether it matches word-for-word.`;
      submission = composedDraftForCloze();
    } else if (mode === "timed") {
      context = `Timed brief (${brief.seconds}s): Product/service: "${brief.product}". Audience: "${brief.audience}". Task: ${brief.task}. Type: ${brief.kind}.`;
      submission = draft;
    } else if (mode === "cold") {
      context = `Cold outreach brief. Persona: "${brief.persona}". Context: ${brief.context} Channel: ${brief.channel === "call" ? "phone call opening script" : "email"}.`;
      submission = draft;
    } else if (mode === "ad") {
      context = `Ad script brief. Platform: ${brief.platform}. Product: "${brief.product}". Angle to work: ${brief.angle}.`;
      submission = draft;
    }

    const system = `You are a blunt, precise copy-craft evaluator. You never moralize about the content or subject matter \u2014 you judge only craft. Score strictly on merit, not effort. Return ONLY valid JSON, no markdown fences, no preamble, in exactly this shape:
{"scores": {${fieldList}: {"score": <1-5 integer>, "note": "<one short sentence>"}}, "overall": <0-100 integer>, "summary": "<1-2 sentences, direct>", "rewrite": "<a single sharper line/version of the weakest part, under 20 words>"}`;

    const user = `${context}\n\nSubmission:\n"""${submission}"""`;
    return { system, user };
  }

  async function handleSubmit() {
    setError(null);
    setBusy(true);
    try {
      let gateResult = null;
      const submissionText = mode === "cloze" ? composedDraftForCloze() : draft;
      const isSubjectLine = mode === "timed" && brief?.kind === "subject-line";
      if (isSubjectLine) {
        gateResult = {
          words: wordCount(submissionText),
          chars: submissionText.length,
          punct: punctCount(submissionText),
          spam: findSpamWords(submissionText)
        };
        setGate(gateResult);
      }
      const { system, user } = buildPrompt();
      const res = await critique(system, user);
      setResult(res);
      await saveAttempt({
        id: Date.now(),
        mode,
        title: entry?.title || (brief ? (brief.product || brief.persona || brief.platform) : "Drill"),
        overall: res.overall,
        timestamp: Date.now(),
        gateFailed: gateResult ? gateResult.spam.length > 0 || gateResult.words < 6 || gateResult.words > 10 || gateResult.chars > 60 || gateResult.punct > 3 : false
      });
    } catch (e) {
      setError("Critique failed \u2014 check connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleAddEntry() {
    if (!newEntry.title.trim() || !newEntry.sourceUrl.trim() || !newEntry.reasonDetail.trim() || !newEntry.snippet.trim()) {
      setError("Title, source URL, reason, and snippet are all required.");
      return;
    }
    const item = {
      id: `u-${Date.now()}`,
      type: newEntry.type,
      title: newEntry.title,
      source: { name: newEntry.sourceName || newEntry.sourceUrl, url: newEntry.sourceUrl },
      reasonKind: newEntry.reasonKind,
      reasonDetail: newEntry.reasonDetail,
      snippet: newEntry.snippet
    };
    const next = [item, ...library];
    setLibrary(next);
    setShowAddForm(false);
    setError(null);
    setNewEntry({ title: "", type: "email", sourceName: "", sourceUrl: "", reasonKind: "conversion", reasonDetail: "", snippet: "" });
  }

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.overall || 0), 0) / attempts.length)
    : null;

  const activeMode = MODES.find((m) => m.id === mode);
  const fields = rubricFieldsForMode(mode, brief);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        html, body { touch-action: manipulation; }
        textarea, input { font-size: 16px; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="font-semibold text-slate-900 text-base sm:text-lg truncate">Copy Trainer</div>
          <nav className="flex gap-1 bg-slate-100 rounded-lg p-1 shrink-0">
            {[
              { id: "drill", label: "Drill" },
              { id: "library", label: "Library" },
              { id: "progress", label: "Progress" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  tab === t.id ? "bg-white shadow text-slate-900" : "text-slate-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 sm:py-8 pb-16">
        {/* -------------------------------------------------------- DRILL */}
        {tab === "drill" && (
          <div>
            <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-4 px-4">
              {MODES.map((m) => {
                const Icon = m.icon;
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      active
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    <Icon size={15} />
                    {m.label}
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-slate-500 mb-4">{activeMode?.blurb}</p>

            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 mb-5">
              {/* Prompt / reference material */}
              {(mode === "rewrite" || mode === "cloze") && entry && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Pill>{entry.type}</Pill>
                    <Pill tone={entry.reasonKind === "conversion" ? "green" : "amber"}>
                      {entry.reasonKind === "conversion" ? "converted" : "craft example"}
                    </Pill>
                  </div>
                  <div className="font-semibold text-slate-900 mb-1 break-words">{entry.title}</div>
                  <div className="text-sm text-slate-500 mb-2">{entry.reasonDetail}</div>
                  <div className="text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap break-words text-slate-700">
                    {mode === "cloze" ? cloze?.displayText : entry.snippet}
                  </div>
                </div>
              )}

              {mode === "timed" && brief && (
                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Pill tone="amber">{brief.kind.replace("-", " ")}</Pill>
                    {timeLeft !== null && (
                      <span className={`font-mono text-lg font-semibold ${timeLeft <= 10 ? "text-rose-600" : "text-slate-800"}`}>
                        {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:{String(timeLeft % 60).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <div><span className="text-slate-500">Product:</span> {brief.product}</div>
                  <div><span className="text-slate-500">Audience:</span> {brief.audience}</div>
                  <div className="text-slate-700 font-medium">{brief.task}</div>
                </div>
              )}

              {mode === "cold" && brief && (
                <div className="mb-4 space-y-2 text-sm">
                  <Pill tone="amber">{brief.channel === "call" ? "call script" : "email"}</Pill>
                  <div><span className="text-slate-500">Persona:</span> {brief.persona}</div>
                  <div><span className="text-slate-500">Context:</span> {brief.context}</div>
                </div>
              )}

              {mode === "ad" && brief && (
                <div className="mb-4 space-y-2 text-sm">
                  <Pill tone="amber">{brief.platform}</Pill>
                  <div><span className="text-slate-500">Product:</span> {brief.product}</div>
                  <div><span className="text-slate-500">Angle:</span> {brief.angle}</div>
                </div>
              )}

              {/* Inputs */}
              {mode === "rewrite" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    value={rewriteProduct}
                    onChange={(e) => setRewriteProduct(e.target.value)}
                    placeholder="New product/service"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    value={rewriteAudience}
                    onChange={(e) => setRewriteAudience(e.target.value)}
                    placeholder="New audience"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}

              {mode === "cloze" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {cloze?.blanks.map((b) => (
                    <input
                      key={b.id}
                      value={blankValues[b.id] || ""}
                      onChange={(e) => setBlankValues((v) => ({ ...v, [b.id]: e.target.value }))}
                      placeholder={`Blank ${b.id}`}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-w-0"
                    />
                  ))}
                </div>
              ) : (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={mode === "timed" && brief?.kind === "subject-line" ? 2 : 6}
                  placeholder="Write here..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-y"
                />
              )}

              {error && (
                <div className="mt-3 flex items-start gap-2 text-sm text-rose-600 bg-rose-50 rounded-lg p-3">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleSubmit}
                  disabled={busy || (mode !== "cloze" && !draft.trim())}
                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                >
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  {busy ? "Grading..." : "Submit for critique"}
                </button>
                <button
                  onClick={() => startRound(mode, library)}
                  className="inline-flex items-center gap-1.5 text-slate-500 text-sm font-medium"
                >
                  <RefreshCw size={14} /> New round
                </button>
              </div>
            </div>

            {/* Gate results */}
            {gate && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 mb-5">
                <div className="font-semibold mb-3 text-sm">Subject-line gate</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-2">
                  <div>
                    <div className="text-slate-500 text-xs">Words</div>
                    <div className={gate.words >= 6 && gate.words <= 10 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                      {gate.words}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Characters</div>
                    <div className={gate.chars <= 60 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                      {gate.chars}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Punctuation</div>
                    <div className={gate.punct <= 3 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                      {gate.punct}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Spam words</div>
                    <div className={gate.spam.length === 0 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                      {gate.spam.length}
                    </div>
                  </div>
                </div>
                {gate.spam.length > 0 && (
                  <div className="text-xs text-rose-600 mt-1 break-words">Flagged: {gate.spam.join(", ")}</div>
                )}
              </div>
            )}

            {/* Rubric result */}
            {result && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="font-semibold">Critique</div>
                  <div className="text-2xl font-bold text-slate-900">{result.overall}<span className="text-sm text-slate-400 font-normal">/100</span></div>
                </div>
                <p className="text-sm text-slate-600 mb-4">{result.summary}</p>
                {fields.map((f) =>
                  result.scores?.[f] ? (
                    <div key={f}>
                      <ScoreBar label={FIELD_LABELS[f] || f} score={result.scores[f].score} />
                      <p className="text-xs text-slate-500 -mt-2 mb-3 break-words">{result.scores[f].note}</p>
                    </div>
                  ) : null
                )}
                {result.rewrite && (
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm">
                    <span className="font-medium text-amber-800">Sharper: </span>
                    <span className="text-amber-900 break-words">{result.rewrite}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------ LIBRARY */}
        {tab === "library" && (
          <div>
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="font-semibold text-slate-900">Library ({library.length})</div>
              <button
                onClick={() => setShowAddForm((s) => !s)}
                className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium shrink-0"
              >
                {showAddForm ? <X size={14} /> : <Plus size={14} />}
                {showAddForm ? "Close" : "Add"}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 mb-5 space-y-3">
                <input
                  value={newEntry.title}
                  onChange={(e) => setNewEntry((v) => ({ ...v, title: e.target.value }))}
                  placeholder="Title"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry((v) => ({ ...v, type: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="email">Email</option>
                    <option value="cold-email">Cold email</option>
                    <option value="subject-line">Subject line</option>
                    <option value="ad">Ad</option>
                    <option value="landing">Landing page</option>
                  </select>
                  <select
                    value={newEntry.reasonKind}
                    onChange={(e) => setNewEntry((v) => ({ ...v, reasonKind: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="conversion">Reason: it converted</option>
                    <option value="skill">Reason: skill demonstrated</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={newEntry.sourceName}
                    onChange={(e) => setNewEntry((v) => ({ ...v, sourceName: e.target.value }))}
                    placeholder="Source name"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    value={newEntry.sourceUrl}
                    onChange={(e) => setNewEntry((v) => ({ ...v, sourceUrl: e.target.value }))}
                    placeholder="Source URL (required)"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <input
                  value={newEntry.reasonDetail}
                  onChange={(e) => setNewEntry((v) => ({ ...v, reasonDetail: e.target.value }))}
                  placeholder="Why it's here \u2014 the specific conversion or skill (required)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
                <textarea
                  value={newEntry.snippet}
                  onChange={(e) => setNewEntry((v) => ({ ...v, snippet: e.target.value }))}
                  placeholder="The copy itself"
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-y"
                />
                {error && <div className="text-sm text-rose-600">{error}</div>}
                <button
                  onClick={handleAddEntry}
                  className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Save entry
                </button>
              </div>
            )}

            <div className="space-y-3">
              {library.map((l) => (
                <div key={l.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <Pill>{l.type}</Pill>
                    <Pill tone={l.reasonKind === "conversion" ? "green" : "amber"}>
                      {l.reasonKind === "conversion" ? "converted" : "craft example"}
                    </Pill>
                  </div>
                  <div className="font-semibold text-slate-900 mb-1 break-words">{l.title}</div>
                  <p className="text-sm text-slate-500 mb-2 break-words">{l.reasonDetail}</p>
                  <p className="text-sm bg-slate-50 rounded-lg p-3 whitespace-pre-wrap break-words text-slate-700 mb-2">{l.snippet}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    {l.source.url ? (
                      <a href={l.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-slate-600 break-all">
                        <ExternalLink size={11} /> {l.source.name}
                      </a>
                    ) : (
                      <span>{l.source.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------- PROGRESS */}
        {tab === "progress" && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-xs text-slate-500 mb-1">Attempts</div>
                <div className="text-2xl font-bold">{attempts.length}</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-xs text-slate-500 mb-1">Average score</div>
                <div className="text-2xl font-bold">{avgScore === null ? "\u2014" : avgScore}</div>
              </div>
            </div>

            {!attemptsLoaded ? (
              <div className="text-sm text-slate-400 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading...</div>
            ) : attempts.length === 0 ? (
              <div className="text-sm text-slate-400">No attempts yet \u2014 run a drill to start the log.</div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {attempts.map((a) => (
                  <div key={a.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{a.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Pill>{a.mode}</Pill>
                        {a.gateFailed && <Pill tone="red">gate failed</Pill>}
                        <span className="text-xs text-slate-400">{new Date(a.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-slate-900 shrink-0">{a.overall}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
