"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Play, Trash2, CheckCircle2, Pause, MoreVertical } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import type { AssemblySession } from "@/lib/db/schema";

interface SessionWithProject extends AssemblySession {
  project: {
    id: string;
    title: string;
    thumbnail: string | null;
    totalSteps: number;
  };
}

export default function SessionHistoryPage() {
  const [sessions, setSessions] = useState<SessionWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");
        
        const data = await response.json();
        const raw = data.data?.sessions ?? data.sessions ?? [];
        setSessions(Array.isArray(raw) ? raw : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(sessionId);
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete session");
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error("Failed to delete session:", err);
      // You might want to show a toast or error message here
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10";
      case "active":
        return "text-blue-400 bg-blue-400/10";
      case "paused":
        return "text-yellow-400 bg-yellow-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle2;
      case "active":
        return Play;
      case "paused":
        return Pause;
      default:
        return Clock;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateProgress = (session: SessionWithProject) => {
    return Math.round((session.completedSteps.length / session.project.totalSteps) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink">
        <Navbar />
        <main className="pt-24 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-ink-300 hover:text-volt transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              Session History
            </h1>
            <p className="text-ink-300">
              View and manage your assembly sessions
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="btn-ghost px-6 py-2"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!error && sessions.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-ink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No sessions yet</h3>
              <p className="text-ink-300 mb-6">Start your first assembly project to see sessions here.</p>
              <Link href="/projects" className="btn-primary px-6 py-3">
                Browse Projects
              </Link>
            </div>
          )}

          {/* Sessions List */}
          {!error && sessions.length > 0 && (
            <div className="space-y-4">
              {sessions.map((session) => {
                const StatusIcon = getStatusIcon(session.status);
                const progress = calculateProgress(session);

                return (
                  <div
                    key={session.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Project thumbnail */}
                      <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {session.project.thumbnail ? (
                          <img
                            src={session.project.thumbnail}
                            alt={session.project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Session info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white text-lg truncate">
                            {session.project.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {/* Status badge */}
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${getStatusColor(session.status)}`}>
                              <StatusIcon size={14} />
                              <span className="capitalize">{session.status}</span>
                            </div>

                            {/* Actions */}
                            <button
                              onClick={() => deleteSession(session.id)}
                              disabled={deletingId === session.id}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                              title="Delete session"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-ink-400 mb-1">
                            <span>Progress</span>
                            <span>{session.completedSteps.length} of {session.project.totalSteps} steps</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-volt h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-sm text-ink-400">
                          <div className="flex items-center gap-4">
                            <span>Started {formatDate(session.startedAt)}</span>
                            {session.completedAt && (
                              <span>Completed {formatDate(session.completedAt)}</span>
                            )}
                            {session.totalAiCalls > 0 && (
                              <span>{session.totalAiCalls} AI calls</span>
                            )}
                          </div>

                          {/* Resume/View button */}
                          {session.status !== "completed" ? (
                            <Link
                              href={`/session/${session.id}`}
                              className="btn-primary px-4 py-2 text-sm"
                            >
                              Resume
                            </Link>
                          ) : (
                            <Link
                              href={`/projects/${session.projectId}`}
                              className="btn-ghost px-4 py-2 text-sm"
                            >
                              View Project
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}