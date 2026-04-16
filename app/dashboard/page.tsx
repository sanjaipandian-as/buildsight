"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock, Play, CheckCircle2, Plus, Zap, BarChart2,
  Loader2, AlertCircle, Wand2, FolderOpen, ChevronRight,
  Trash2
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

/* ── types ─────────────────────────────────────────────────────────── */
interface SessionRow {
  id: string;
  projectId: string;
  currentStep: number;
  completedSteps: number[];
  status: "active" | "paused" | "completed";
  totalAiCalls: number;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  project: {
    id: string;
    title: string;
    thumbnail: string | null;
    totalSteps: number;
  } | null;
}

interface MyProject {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  totalSteps: number;
  estMinutes: number | null;
  createdAt: string;
}

interface DashStats {
  active: number;
  completed: number;
  aiCalls: number;
  myProjects: number;
}

const statusStyle: Record<string, string> = {
  active:    "text-volt    border-volt/30    bg-volt/5",
  completed: "text-green-400 border-green--400/30 bg-green-400/5",
  paused:    "text-ink-300  border-white/20  bg-white/5",
};

const difficultyColor: Record<string, string> = {
  beginner:     "text-green-400",
  intermediate: "text-amber-400",
  advanced:     "text-red-400",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ══════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const [sessions,   setSessions]   = useState<SessionRow[]>([]);
  const [myProjects, setMyProjects] = useState<MyProject[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── fetch both in parallel ── */
  useEffect(() => {
    (async () => {
      try {
        const [sessRes, projRes] = await Promise.all([
          fetch("/api/sessions"),
          fetch("/api/projects/my"),
        ]);

        if (!sessRes.ok) throw new Error("Failed to load sessions");
        if (!projRes.ok) throw new Error("Failed to load your projects");

        const sessData = await sessRes.json();
        const projData = await projRes.json();

        // ok() wrapper puts data under data.data
        const rawSessions  = sessData.data?.sessions  ?? sessData.sessions  ?? [];
        const rawProjects  = projData.data?.items      ?? projData.items     ?? [];

        setSessions(Array.isArray(rawSessions) ? rawSessions : []);
        setMyProjects(Array.isArray(rawProjects) ? rawProjects : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── derived stats ── */
  const stats: DashStats = {
    active:     sessions.filter(s => s.status === "active").length,
    completed:  sessions.filter(s => s.status === "completed").length,
    aiCalls:    sessions.reduce((sum, s) => sum + (s.totalAiCalls ?? 0), 0),
    myProjects: myProjects.length,
  };

  /* ── delete session ── */
  const deleteSession = async (id: string) => {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch {
      // silent — user can retry
    } finally {
      setDeletingId(null);
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-7 h-7 animate-spin text-volt mx-auto mb-3" />
          <p className="text-ink-400 text-sm font-body">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  /* ── render ── */
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="pt-24 pb-24 px-6">
        <div className="max-w-6xl mx-auto">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
            <div>
              <span className="section-label">Dashboard</span>
              <h1 className="font-display text-4xl font-bold text-white mt-2">Your builds.</h1>
            </div>
            <Link href="/projects/new" className="btn-primary px-5 py-2.5 text-sm font-display font-bold flex items-center gap-2">
              <Wand2 size={14} /> AI-Generate a project
            </Link>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="flex items-center gap-3 text-red-400 bg-red-400/5 border border-red-400/20 px-5 py-4 mb-8">
              <AlertCircle size={16} />
              <span className="text-sm font-body">{error}</span>
            </div>
          )}

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
            {[
              { label: "Active sessions",   value: stats.active,     icon: Play,          color: "text-volt" },
              { label: "Completed builds",  value: stats.completed,  icon: CheckCircle2,  color: "text-green-400" },
              { label: "AI analyses run",   value: stats.aiCalls,    icon: Zap,           color: "text-blue-400" },
              { label: "My projects",        value: stats.myProjects, icon: FolderOpen,    color: "text-amber-400" },
            ].map(s => (
              <div key={s.label} className="card p-5">
                <s.icon size={16} className={`${s.color} mb-3`} />
                <div className="font-display text-3xl font-bold text-white">{s.value}</div>
                <div className="text-xs font-body text-ink-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Recent Sessions ── */}
          <section className="mb-14">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-white">Recent sessions</h2>
              {sessions.length > 0 && (
                <Link href="/dashboard/history" className="text-xs font-mono text-ink-400 hover:text-volt transition-colors flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </Link>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="card p-12 text-center">
                <BarChart2 size={28} className="text-ink-400 mx-auto mb-3" />
                <p className="font-body text-ink-400 text-sm mb-4">No sessions yet.</p>
                <Link href="/projects" className="btn-primary px-8 py-3 inline-flex font-display font-bold text-sm">
                  Start your first build
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 5).map(s => {
                  const total    = s.project?.totalSteps ?? 1;
                  const progress = Math.round((s.completedSteps.length / total) * 100);
                  const isActive = s.status !== "completed";
                  return (
                    <div key={s.id} className="card p-5 flex items-center gap-5">
                      {/* ring */}
                      <div className="flex-shrink-0 w-12 h-12 relative">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#252530" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15" fill="none"
                            stroke={progress === 100 ? "#4ade80" : "#C8FF00"}
                            strokeWidth="3"
                            strokeDasharray={`${progress * 0.942} 94.2`}
                            strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-ink-300">
                          {progress}%
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-display text-sm font-bold text-white truncate">
                            {s.project?.title ?? "Unknown project"}
                          </h3>
                          <span className={`tag border text-[10px] ${statusStyle[s.status] ?? ""}`}>
                            {s.status}
                          </span>
                        </div>
                        <div className="text-xs font-body text-ink-400">
                          Step {s.currentStep}/{total} · {timeAgo(s.updatedAt)}
                          {s.totalAiCalls > 0 && ` · ${s.totalAiCalls} AI calls`}
                        </div>

                        <div className="mt-2 w-full h-0.5 bg-ink-600">
                          <div className="h-full transition-all duration-500"
                            style={{ width: `${progress}%`, background: progress === 100 ? "#4ade80" : "#C8FF00" }} />
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex items-center gap-2">
                        {isActive ? (
                          <Link href={`/session/${s.id}`} className="btn-primary text-xs px-4 py-2 font-display">
                            <Play size={11} /> Resume
                          </Link>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-mono text-green-400">
                            <CheckCircle2 size={13} /> Done
                          </span>
                        )}
                        <button
                          onClick={() => deleteSession(s.id)}
                          disabled={deletingId === s.id}
                          className="text-ink-500 hover:text-red-400 transition-colors disabled:opacity-30"
                        >
                          {deletingId === s.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── My Projects ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-white">My projects</h2>
                <p className="text-xs font-body text-ink-500 mt-0.5">Projects you created with AI</p>
              </div>
              <Link href="/projects/new" className="text-xs font-mono text-volt hover:underline flex items-center gap-1">
                <Plus size={11} /> New
              </Link>
            </div>

            {myProjects.length === 0 ? (
              <div className="card p-12 text-center border-dashed">
                <Wand2 size={28} className="text-ink-400 mx-auto mb-3" />
                <p className="font-body text-ink-400 text-sm mb-4">You haven't created any projects yet.</p>
                <Link href="/projects/new" className="btn-primary px-8 py-3 inline-flex font-display font-bold text-sm gap-2">
                  <Wand2 size={14} /> Generate my first project
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProjects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/projects/${p.id}`)}
                    className="card p-5 hover:border-volt/30 transition-colors flex flex-col gap-3 group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm font-bold text-white group-hover:text-volt transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                      {p.difficulty && (
                        <span className={`text-[10px] font-mono shrink-0 ${difficultyColor[p.difficulty] ?? "text-ink-400"}`}>
                          {p.difficulty}
                        </span>
                      )}
                    </div>

                    {p.description && (
                      <p className="text-xs font-body text-ink-400 line-clamp-2">{p.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] font-mono text-ink-500 mt-auto">
                      <span>{p.totalSteps} steps</span>
                      {p.estMinutes && <span>~{p.estMinutes}m</span>}
                      {p.category && <span className="capitalize">{p.category}</span>}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/projects/${p.id}`); }}
                      className="btn-primary text-xs py-2 w-full justify-center font-display font-bold mt-1"
                    >
                      <Play size={11} /> Start building
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
