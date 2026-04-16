"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Clock, BarChart2, ArrowRight, Cpu, Sofa, Wrench, Palette, Plus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import type { Project } from "@/lib/db/schema";

const categories = [
  { key: "", label: "All", icon: Filter },
  { key: "electronics", label: "Electronics", icon: Cpu },
  { key: "furniture", label: "Furniture", icon: Sofa },
  { key: "mechanical", label: "Mechanical", icon: Wrench },
  { key: "craft", label: "Craft", icon: Palette },
];

const difficulties = [
  { key: "", label: "All difficulties" },
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Use navigation guard to handle authentication and navigation
  const { isAuthenticated, isLoading: authLoading } = useNavigationGuard({
    allowedBackPaths: ["/", "/projects", "/dashboard", "/login"]
  });

  const fetchProjects = async (reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: reset ? "1" : page.toString(),
        limit: "12",
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedDifficulty && { difficulty: selectedDifficulty }),
      });

      const response = await fetch(`/api/projects?${params}`);
      if (!response.ok) throw new Error("Failed to fetch projects");
      
      const data = await response.json();

      // Normalise response shape: support { items }, { projects }, { data: { items } }, or bare array
      const items: Project[] = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.projects)
        ? data.projects
        : Array.isArray(data.data?.items)
        ? data.data.items
        : Array.isArray(data.data)
        ? data.data
        : [];

      if (reset) {
        setProjects(items);
        setPage(2);
      } else {
        setProjects(prev => [...(prev ?? []), ...items]);
        setPage(prev => prev + 1);
      }

      setHasMore(items.length === 12);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(true);
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDifficulty(e.target.value);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProjects(false);
    }
  };
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <span className="section-label">Project Library</span>
              <h1 className="font-display text-5xl font-bold text-white mt-3 mb-2">Choose your build.</h1>
              <p className="font-body text-ink-300">Browse guided projects or let AI build a guide for you instantly.</p>
            </div>
            <Link href="/projects/new" className="btn-primary px-5 py-3 flex items-center gap-2 shrink-0">
              <Plus size={14} /> AI-Generate a guide
            </Link>
          </div>


          {/* Search + filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input 
                placeholder="Search projects..." 
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <select 
              className="input md:w-48"
              value={selectedDifficulty}
              onChange={handleDifficultyChange}
            >
              {difficulties.map(diff => (
                <option key={diff.key} value={diff.key}>{diff.label}</option>
              ))}
            </select>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-10 flex-wrap">
            {categories.map((c) => (
              <button 
                key={c.key}
                onClick={() => handleCategoryChange(c.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono border transition-colors
                  ${selectedCategory === c.key ? "border-volt text-volt bg-volt/5" : "border-white/10 text-ink-300 hover:border-volt/30 hover:text-volt"}`}
              >
                <c.icon size={11} />
                {c.label}
              </button>
            ))}
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => fetchProjects(true)}
                className="btn-ghost px-6 py-2"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && projects.length === 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-700 rounded-t-lg" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-700 rounded mb-2" />
                    <div className="h-3 bg-gray-700 rounded mb-4 w-3/4" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects Grid */}
          {!error && projects.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-ink-300 mb-4">No projects found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedDifficulty("");
                }}
                className="btn-ghost px-6 py-2"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Load more */}
          {!error && projects.length > 0 && hasMore && (
            <div className="text-center mt-12">
              <button 
                onClick={loadMore}
                disabled={loading}
                className="btn-ghost px-10 py-3 font-body disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load more projects"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
