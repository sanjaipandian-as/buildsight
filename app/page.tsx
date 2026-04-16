import Link from "next/link";
import { Camera, Zap, Shield, ChevronRight, ArrowRight, Cpu, Eye, Layers } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const features = [
  { icon: Eye, title: "Live Vision Analysis", desc: "AI scans your camera feed every few seconds and identifies exactly where you are in the build." },
  { icon: Zap, title: "Instant Step Detection", desc: "No buttons needed — the system detects step completion automatically and advances the guide." },
  { icon: Layers, title: "Any Project Type", desc: "Electronics, furniture, mechanical kits, LEGO — if it has steps, BuildSight can guide it." },
  { icon: Shield, title: "Privacy First", desc: "Camera frames are never stored. Processed in memory, discarded immediately. Always." },
  { icon: Cpu, title: "Works Offline", desc: "Project guides are cached locally. Continue your build even without an internet connection." },
  { icon: Camera, title: "No App Required", desc: "100% browser-based. Works on any device — phone, tablet, desktop. Just open and build." },
];

const steps = [
  { n: "01", title: "Pick a project", desc: "Browse our library or search for your kit by name." },
  { n: "02", title: "Allow camera", desc: "One-click permission. We only use your camera while the session is active." },
  { n: "03", title: "Follow the guide", desc: "Point your camera at your build. AI does the rest." },
];

const stats = [
  { value: "3s", label: "Avg analysis time" },
  { value: "94%", label: "Step detection accuracy" },
  { value: "0¢", label: "Cost to get started" },
  { value: "500+", label: "Projects in library" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#C8FF00 1px,transparent 1px),linear-gradient(90deg,#C8FF00 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
        {/* Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-volt/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="section-label">AI Assembly Guide</span>
              <span className="h-px flex-1 max-w-[40px] bg-volt/40" />
            </div>

            <h1 className="font-display text-6xl md:text-8xl font-800 text-white leading-[0.95] tracking-tight mb-6">
              Build anything.<br />
              <span className="text-volt">See every step.</span>
            </h1>

            <p className="font-body text-lg text-ink-300 max-w-xl mb-10 leading-relaxed">
              Point your camera at your project. AI identifies exactly where you are
              and tells you exactly what to do next — hands-free, real-time, zero confusion.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/projects" className="btn-primary px-8 py-3 text-sm font-display font-bold">
                Browse Projects <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="btn-ghost px-8 py-3 text-sm">
                Sign in free
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-x-10 gap-y-4 mt-14 pt-10 border-t border-white/5">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl font-bold text-volt">{s.value}</div>
                  <div className="text-xs font-body text-ink-300 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <span className="section-label">How it works</span>
            <h2 className="font-display text-4xl font-bold text-white mt-3">Three steps. That's it.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-0">
            {steps.map((s, i) => (
              <div key={s.n} className="relative p-8 border border-white/5 hover:border-volt/20 transition-colors group">
                <div className="font-mono text-6xl font-400 text-white/5 group-hover:text-volt/10 transition-colors select-none mb-6">{s.n}</div>
                <h3 className="font-display text-xl font-600 text-white mb-2">{s.title}</h3>
                <p className="font-body text-sm text-ink-300 leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight size={16} className="absolute top-8 -right-2 text-volt/30 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-ink-700/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <span className="section-label">Features</span>
            <h2 className="font-display text-4xl font-bold text-white mt-3">Built for real builders.</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {features.map((f) => (
              <div key={f.title} className="bg-ink p-8 hover:bg-ink-700 transition-colors group">
                <div className="w-9 h-9 border border-volt/30 flex items-center justify-center mb-5 group-hover:border-volt transition-colors">
                  <f.icon size={16} className="text-volt" />
                </div>
                <h3 className="font-display text-base font-600 text-white mb-2">{f.title}</h3>
                <p className="font-body text-sm text-ink-300 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="border border-volt/20 p-12 md:p-16 bg-volt/[0.03] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-volt/5 rounded-full blur-[80px]" />
            <span className="section-label">Get started</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 mb-4 max-w-lg">
              Ready to build smarter?
            </h2>
            <p className="font-body text-ink-300 mb-8 max-w-md">
              Free forever for personal projects. No credit card. No install. Just open and build.
            </p>
            <Link href="/projects" className="btn-primary px-10 py-4 text-base font-display">
              Start Building Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-400 font-body">
          <span className="font-display font-600 text-white">BuildSight</span>
          <span>© 2025 BuildSight. Camera frames never stored.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-volt transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-volt transition-colors">Terms</Link>
            <a href="https://github.com" className="hover:text-volt transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
