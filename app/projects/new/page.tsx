"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Loader2, ChevronRight, CheckCircle2, AlertCircle,
  RefreshCw, Play, Pencil, ChevronDown, ChevronUp, Clock, BarChart2,
  ArrowLeft, Wand2, Eye
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

/* ── types ────────────────────────────────────────────────────────────── */
interface GeneratedStep {
  step_number: number;
  title: string;
  instruction: string;
  visual_cues: string[];
  ai_prompt_hint?: string;
}

interface GeneratedPlan {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estMinutes: number;
  steps: GeneratedStep[];
}

/* ── suggestions to spark ideas ──────────────────────────────────────── */
const EXAMPLES = [
  "Assemble an IKEA KALLAX shelf",
  "Build a basic Arduino LED circuit",
  "Install a ceiling light fixture",
  "Set up a mechanical keyboard",
  "Assemble a gaming PC",
  "Install a bathroom faucet",
  "Build a wooden birdhouse",
  "Wire a home network switch",
];

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "text-green-400 border-green-400/30 bg-green-400/5",
  intermediate: "text-amber-400 border-amber-400/30 bg-amber-400/5",
  advanced: "text-red-400 border-red-400/30 bg-red-400/5",
};

type UIPhase = "input" | "generating" | "review" | "saving" | "done";

/* ══════════════════════════════════════════════════════════════════════ */
export default function NewProjectPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<UIPhase>("input");

  /* input phase */
  const [goal, setGoal] = useState("");
  const [genError, setGenError] = useState<string | null>(null);
  const [generatingMsg, setGeneratingMsg] = useState("");

  /* review phase */
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  /* ── generate plan ── */
  const generate = async () => {
    const trimmed = goal.trim();
    if (!trimmed) return;
    setGenError(null);
    setPhase("generating");

    // cycle through friendly loading messages
    const msgs = [
      "Understanding your project…",
      "Planning the build steps…",
      "Adding visual cues for the camera…",
      "Finalising your guide…",
    ];
    let i = 0;
    setGeneratingMsg(msgs[0]);
    const ticker = setInterval(() => {
      i = (i + 1) % msgs.length;
      setGeneratingMsg(msgs[i]);
    }, 2200);

    try {
      const res = await fetch("/api/ai/generate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      const generatedPlan: GeneratedPlan = data.data?.plan ?? data.plan;
      if (!generatedPlan?.steps?.length) throw new Error("AI couldn't generate steps. Try rephrasing your goal.");

      setPlan(generatedPlan);
      setPhase("review");
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Generation failed. Please try again.");
      setPhase("input");
    } finally {
      clearInterval(ticker);
    }
  };

  /* ── save and start ── */
  const saveAndStart = async () => {
    if (!plan) return;
    setSaveError(null);
    setPhase("saving");
    try {
      // 1. Create project
      const projRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: plan.title,
          description: plan.description,
          category: plan.category,
          difficulty: plan.difficulty,
          estMinutes: plan.estMinutes,
          isPublic: false, // user-created projects are private by default
          steps: plan.steps,
        }),
      });
      const projData = await projRes.json();
      if (!projRes.ok) throw new Error(projData.error || `Error ${projRes.status}`);
      const projectId = projData.data?.project?.id ?? projData.project?.id;

      // 2. Create session immediately
      const sessRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const sessData = await sessRes.json();
      if (!sessRes.ok) throw new Error(sessData.error || "Failed to start session");
      const sessionId = sessData.data?.session?.id ?? sessData.session?.id;

      setPhase("done");
      setTimeout(() => router.push(`/session/${sessionId}`), 800);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("review");
    }
  };

  /* ══ render ══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="pt-24 pb-32 px-6">
        <div className="max-w-2xl mx-auto">

          {/* breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-ink-400 mb-10">
            <Link href="/projects" className="hover:text-volt transition-colors flex items-center gap-1">
              <ArrowLeft size={11} /> Projects
            </Link>
            <span>/</span>
            <span className="text-volt">New project</span>
          </div>

          {/* ══ INPUT PHASE ══ */}
          {(phase === "input" || phase === "generating") && (
            <div>
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 size={16} className="text-volt" />
                  <span className="section-label">AI-Powered Guide Builder</span>
                </div>
                <h1 className="font-display text-4xl font-bold text-white mb-3 leading-tight">
                  What do you want<br />to build today?
                </h1>
                <p className="font-body text-ink-400 text-sm leading-relaxed">
                  Just tell us in plain English — our AI will create a complete beginner-friendly
                  step-by-step guide for you instantly.
                </p>
              </div>

              {/* main input */}
              <div className="relative mb-4">
                <textarea
                  disabled={phase === "generating"}
                  className="input min-h-[110px] resize-none text-base leading-relaxed pr-4 disabled:opacity-50"
                  placeholder={`e.g. "Assemble an IKEA KALLAX shelf" or "Wire a basic Arduino LED circuit"`}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
                  }}
                />
              </div>

              {/* generate button */}
              <button
                onClick={generate}
                disabled={!goal.trim() || phase === "generating"}
                className="w-full btn-primary py-4 text-base flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed mb-6"
              >
                {phase === "generating" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="font-body">{generatingMsg}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate my guide
                  </>
                )}
              </button>

              {genError && (
                <div className="flex items-start gap-2 text-red-400 text-sm bg-red-400/5 border border-red-400/20 px-4 py-3 mb-6">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{genError}</span>
                </div>
              )}

              {/* example chips */}
              {phase === "input" && (
                <div>
                  <p className="text-[10px] font-mono text-ink-500 uppercase tracking-widest mb-3">Try one of these</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setGoal(ex)}
                        className="text-xs px-3 py-1.5 bg-ink-700 border border-white/10 text-ink-300 hover:border-volt/50 hover:text-volt transition-colors font-body"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>

                  <div className="mt-10 bg-ink-700 border border-white/5 p-5 space-y-3">
                    <p className="text-[10px] font-mono text-volt uppercase tracking-widest">How it works</p>
                    {[
                      { icon: "①", text: "Tell us what you want to build in plain English" },
                      { icon: "②", text: "AI generates a complete step-by-step guide tailored for beginners" },
                      { icon: "③", text: "Review the steps, then start — the AI guides you live via camera" },
                    ].map((item) => (
                      <div key={item.icon} className="flex items-start gap-3">
                        <span className="text-volt font-mono text-sm shrink-0">{item.icon}</span>
                        <p className="text-ink-300 text-sm font-body">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* generating animation */}
              {phase === "generating" && (
                <div className="mt-8 space-y-3">
                  {[80, 60, 90, 50, 70].map((w, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-ink-600 border border-white/5 shrink-0 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                      <div className="h-3 bg-ink-600 rounded animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }} />
                    </div>
                  ))}
                  <p className="text-[10px] font-mono text-ink-500 text-center pt-3">This takes 10–20 seconds…</p>
                </div>
              )}
            </div>
          )}

          {/* ══ REVIEW PHASE ══ */}
          {(phase === "review" || phase === "saving") && plan && (
            <div>
              {/* header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={14} className="text-volt" />
                  <span className="section-label">Guide ready</span>
                  <button
                    onClick={() => { setPhase("input"); setPlan(null); }}
                    className="ml-auto text-[10px] font-mono text-ink-400 hover:text-volt transition-colors flex items-center gap-1"
                  >
                    <RefreshCw size={10} /> Start over
                  </button>
                </div>

                <h1 className="font-display text-3xl font-bold text-white mb-2">{plan.title}</h1>
                <p className="font-body text-ink-400 text-sm mb-5">{plan.description}</p>

                {/* metadata pills */}
                <div className="flex flex-wrap gap-3">
                  <span className={`tag border ${DIFFICULTY_COLOR[plan.difficulty] ?? "text-ink-400 border-white/10"}`}>
                    {plan.difficulty}
                  </span>
                  <span className="tag border border-white/10 text-ink-300">
                    {plan.category}
                  </span>
                  <span className="tag border border-white/10 text-ink-300 flex items-center gap-1">
                    <Clock size={10} /> ~{plan.estMinutes} min
                  </span>
                  <span className="tag border border-white/10 text-ink-300 flex items-center gap-1">
                    <BarChart2 size={10} /> {plan.steps.length} steps
                  </span>
                </div>
              </div>

              {/* steps preview */}
              <div className="space-y-2 mb-8">
                <p className="text-[10px] font-mono text-ink-500 uppercase tracking-widest mb-3">AI-Generated Steps</p>
                {plan.steps.map((step) => (
                  <div
                    key={step.step_number}
                    className="bg-ink-700 border border-white/5 hover:border-volt/20 transition-colors overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center gap-4 px-5 py-4 text-left"
                      onClick={() => setExpandedStep(expandedStep === step.step_number ? null : step.step_number)}
                    >
                      <div className="w-7 h-7 flex items-center justify-center text-xs font-mono bg-volt/10 border border-volt/20 text-volt shrink-0">
                        {step.step_number}
                      </div>
                      <span className="font-body text-sm text-white font-medium flex-1">{step.title}</span>
                      {expandedStep === step.step_number
                        ? <ChevronUp size={14} className="text-ink-400 shrink-0" />
                        : <ChevronDown size={14} className="text-ink-400 shrink-0" />}
                    </button>

                    {expandedStep === step.step_number && (
                      <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
                        <p className="font-body text-sm text-ink-200 leading-relaxed">{step.instruction}</p>
                        {step.visual_cues?.length > 0 && (
                          <div>
                            <p className="text-[9px] font-mono text-ink-500 uppercase tracking-widest mb-2">Camera will look for</p>
                            <div className="flex flex-wrap gap-1.5">
                              {step.visual_cues.map((cue, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 bg-ink-600 border border-white/10 text-ink-300 font-mono">
                                  <Eye size={8} className="inline mr-1" />{cue}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {step.ai_prompt_hint && (
                          <div>
                            <p className="text-[9px] font-mono text-ink-500 uppercase tracking-widest mb-1">AI verification hint</p>
                            <p className="text-xs text-ink-400 font-body italic">"{step.ai_prompt_hint}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {saveError && (
                <div className="flex items-start gap-2 text-red-400 text-sm bg-red-400/5 border border-red-400/20 px-4 py-3 mb-6">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={saveAndStart}
                  disabled={phase === "saving"}
                  className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {phase === "saving" ? (
                    <><Loader2 size={16} className="animate-spin" /> Setting up your session…</>
                  ) : (
                    <><Play size={15} /> Looks good — start building!</>
                  )}
                </button>
                <p className="text-center text-[10px] font-mono text-ink-500">
                  Not happy? <button onClick={() => { setPhase("input"); setPlan(null); }} className="text-volt hover:underline">Regenerate</button> or just close and try again.
                </p>
              </div>
            </div>
          )}

          {/* ══ DONE PHASE ══ */}
          {phase === "done" && (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 bg-volt/10 border border-volt/30 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} className="text-volt" />
              </div>
              <h1 className="font-display text-3xl font-bold text-white">Guide created!</h1>
              <p className="font-body text-ink-400">Starting your session…</p>
              <Loader2 size={20} className="animate-spin text-volt mx-auto" />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
