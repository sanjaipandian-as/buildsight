"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, BarChart2, Play, Users, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import type { Project } from "@/lib/db/schema";

interface ProjectDetailPageProps {
  params: { id: string };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingSession, setStartingSession] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Project not found");
          }
          throw new Error("Failed to load project");
        }
        
        const data = await response.json();
        setProject(data.data?.project ?? data.project);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  const startSession = async () => {
    if (!project) return;
    
    try {
      setStartingSession(true);
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to start session");
      }

      const data = await response.json();
      const sessionId = data.data?.session?.id ?? data.session?.id;
      router.push(`/session/${sessionId}`);
    } catch (err) {
      console.error("Failed to start session:", err);
      // You might want to show a toast or error message here
    } finally {
      setStartingSession(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-400 border-green-400/30";
      case "intermediate":
        return "text-yellow-400 border-yellow-400/30";
      case "advanced":
        return "text-red-400 border-red-400/30";
      default:
        return "text-gray-400 border-gray-400/30";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "electronics":
        return "text-blue-400 border-blue-400/30";
      case "furniture":
        return "text-purple-400 border-purple-400/30";
      case "mechanical":
        return "text-orange-400 border-orange-400/30";
      case "craft":
        return "text-pink-400 border-pink-400/30";
      default:
        return "text-gray-400 border-gray-400/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink">
        <Navbar />
        <main className="pt-24 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/3 mb-6" />
              <div className="h-12 bg-gray-700 rounded w-2/3 mb-4" />
              <div className="h-4 bg-gray-700 rounded w-full mb-8" />
              <div className="h-64 bg-gray-700 rounded mb-8" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-ink">
        <Navbar />
        <main className="pt-24 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              {error || "Project not found"}
            </h1>
            <Link href="/projects" className="btn-ghost px-6 py-2">
              Back to Projects
            </Link>
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
            href="/projects"
            className="inline-flex items-center gap-2 text-ink-300 hover:text-volt transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Link>

          {/* Project header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 mb-4">
              {project.difficulty && (
                <span className={`tag border ${getDifficultyColor(project.difficulty)}`}>
                  {project.difficulty}
                </span>
              )}
              {project.category && (
                <span className={`tag border ${getCategoryColor(project.category)}`}>
                  {project.category}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl font-bold text-white mb-4">
              {project.title}
            </h1>

            <p className="font-body text-lg text-ink-300 leading-relaxed mb-6">
              {project.description}
            </p>

            {/* Project metadata */}
            <div className="flex items-center gap-6 text-sm text-ink-400 mb-8">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{project.estMinutes ? `${project.estMinutes} minutes` : "Time varies"}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 size={16} />
                <span>{project.totalSteps} steps</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>Guided assembly</span>
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={startSession}
              disabled={startingSession}
              className="btn-primary px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {startingSession ? (
                "Starting..."
              ) : (
                <>
                  <Play size={20} />
                  Start Building
                </>
              )}
            </button>
          </div>

          {/* Project thumbnail */}
          {project.thumbnail && (
            <div className="mb-8">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Steps preview */}
          <div className="card p-6">
            <h2 className="font-display text-2xl font-bold text-white mb-6">
              Assembly Steps
            </h2>
            
            <div className="space-y-4">
              {project.steps?.map((step, index) => (
                <div key={step.step_number} className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-volt/20 text-volt flex items-center justify-center text-sm font-bold">
                      {step.step_number}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-ink-300 text-sm leading-relaxed">
                      {step.instruction}
                    </p>
                    
                    {step.visual_cues && step.visual_cues.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-ink-400 mb-2">Look for:</p>
                        <div className="flex flex-wrap gap-2">
                          {step.visual_cues.map((cue, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-white/10 text-ink-300 rounded text-xs"
                            >
                              {cue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}