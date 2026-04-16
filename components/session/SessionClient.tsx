"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Camera, ChevronLeft, ChevronRight, CheckCircle2, Loader2,
  AlertCircle, Volume2, VolumeX, Home, Send, MicOff,
  MessageSquare, Mic, X
} from "lucide-react";
import Link from "next/link";
import { CameraFeed } from "@/components/camera/CameraFeed";
import { useSession } from "@/hooks/useSession";
import { useStepGuide } from "@/hooks/useStepGuide";

type AIStatus = "idle" | "scanning" | "speaking" | "error" | "low_confidence";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

export default function SessionClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  /* ── session & step state ── */
  const { session, project, isLoading: sessionLoading, error: sessionError, updateStepProgress, updateStatus } = useSession({ sessionId });

  const stepGuide = useStepGuide({
    project,
    initialStep: session?.currentStep || 1,
    initialCompletedSteps: session?.completedSteps || [],
    autoAdvance: false,
    onStepChange: (step) => { if (session) updateStepProgress(step, stepGuide.completedSteps); },
    onStepComplete: (step) => { if (session) updateStepProgress(stepGuide.currentStep, [...stepGuide.completedSteps, step]); },
    onAllStepsComplete: () => updateStatus("completed"),
  });

  /* ── camera ── */
  // captureFrame reads from the hidden video element (videoRef) which receives
  // the MediaStream via handleStreamReady once CameraFeed initialises.
  const captureFrame = useCallback((videoEl: HTMLVideoElement, quality = 0.7) => {
    if (!videoEl || videoEl.readyState < 2) return null;
    const canvas = document.createElement("canvas");
    canvas.width  = videoEl.videoWidth  || 640;
    canvas.height = videoEl.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(videoEl, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    return { dataUrl, sizeKb: Math.round((dataUrl.length * 3) / 4 / 1024) };
  }, []);

  /* ── AI & UI state ── */
  const [aiStatus, setAiStatus] = useState<AIStatus>("idle");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [scanActive, setScanActive] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(0);

  /* subtitle / live speech text */
  const [subtitle, setSubtitle] = useState("");
  const [subtitleVisible, setSubtitleVisible] = useState(false);

  /* chat history */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");

  /* lock input while AI is scanning or speaking */
  const isLocked = aiStatus === "scanning" || aiStatus === "speaking";

  /* ── helpers ── */
  const addMessage = (role: "user" | "ai", text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, text, timestamp: new Date() },
    ]);
  };

  // auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── speak via Web Speech API ── */
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.pitch = 1;
    utt.volume = 1;
    utt.lang = "en-US";

    // Show subtitle word-by-word (boundary events)
    utt.onboundary = (e: SpeechSynthesisEvent) => {
      const word = text.substring(e.charIndex, e.charIndex + e.charLength);
      setSubtitle((prev) => (e.name === "sentence" ? word : prev + " " + word).trim());
    };
    utt.onstart = () => { setSubtitleVisible(true); setSubtitle(""); };
    utt.onend = () => {
      setAiStatus("idle");
      setTimeout(() => setSubtitleVisible(false), 2000);
      onEnd?.();
    };
    utt.onerror = () => { setAiStatus("idle"); onEnd?.(); };

    utteranceRef.current = utt;
    speechSynthesis.speak(utt);
  }, [voiceEnabled]);

  /* ── analyse frame ── */
  const analyse = useCallback(async (prompt: string, isAutoScan = false) => {
    if (!videoRef.current || !session || !project) return;

    const frame = captureFrame(videoRef.current);
    if (!frame) {
      addMessage("ai", "⚠️ Could not capture camera frame. Make sure the camera is active.");
      return;
    }

    setAiStatus("scanning");
    setScanActive(true);
    if (!isAutoScan) addMessage("user", prompt);

    try {
      const res = await fetch("/api/ai/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: frame.dataUrl.split(",")[1],
          projectId: project.id,
          stepNumber: stepGuide.currentStep,
          sessionId: session.id,
          userPrompt: prompt,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Error ${res.status}`);
      }

      const data = await res.json();
      const payload = data.data ?? data; // unwrap ok() wrapper: { success, data: { ... } }
      const guidance: string = payload.guidance || "AI could not generate guidance. Please try again.";
      const confidence: number = payload.confidence ?? 0;

      setAiConfidence(confidence);
      addMessage("ai", guidance);

      // Start speaking — lock input while speaking
      setAiStatus("speaking");
      setSubtitle(guidance); // fallback for browsers without boundary events
      speak(guidance, () => setAiStatus("idle"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Analysis failed.";
      setAiStatus("error");
      addMessage("ai", `⚠️ ${msg}`);
      setTimeout(() => setAiStatus("idle"), 2000);
    } finally {
      setScanActive(false);
    }
  }, [session, project, stepGuide.currentStep, captureFrame, speak]);

  /* ── initial object scan on step load ── */
  useEffect(() => {
    if (!session || !project) return;
    const step = (project.steps as any[])?.[stepGuide.currentStep - 1];
    if (!step) return;
    // small delay so camera has time to start
    const t = setTimeout(() => {
      analyse(`Identify what you see and tell me what to do for step ${stepGuide.currentStep}: ${step.title}`, true);
    }, 2500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepGuide.currentStep, session?.id]);

  /* ── camera stream → hidden videoRef for captureFrame ── */
  const handleStreamReady = useCallback((mediaStream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = mediaStream;
    video.play().catch(() => {}); // ensure it's playing
  }, []);

  /* ── user sends message ── */
  const sendMessage = () => {
    const q = userInput.trim();
    if (!q || isLocked) return;
    setUserInput("");
    analyse(q, false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ── step navigation ── */
  const completeStep = () => {
    stepGuide.markCurrentStepComplete();
    if (stepGuide.currentStep < stepGuide.totalSteps) {
      stepGuide.nextStep();
      setMessages([]);
      setSubtitle("");
      setSubtitleVisible(false);
    }
  };
  const prevStep = () => { if (stepGuide.previousStep()) { setMessages([]); setSubtitle(""); setSubtitleVisible(false); } };
  const nextStep = () => { if (stepGuide.nextStep()) { setMessages([]); setSubtitle(""); setSubtitleVisible(false); } };

  /* ────────────── render states ────────────── */
  if (sessionLoading || !session || !project) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-volt mx-auto mb-4" />
          <p className="text-ink-300 font-body text-sm">Loading session…</p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Session Error</h1>
          <p className="text-ink-300 mb-6">{sessionError}</p>
          <Link href="/projects" className="btn-primary px-6 py-3">Back to Projects</Link>
        </div>
      </div>
    );
  }

  const isCompleted = stepGuide.completedSteps.length === stepGuide.totalSteps;
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-volt/10 border border-volt/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-volt" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">Build complete!</h1>
          <p className="font-body text-ink-300 mb-8">You finished all {stepGuide.totalSteps} steps. Great work.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/projects" className="btn-ghost px-8 py-3">Browse more</Link>
            <Link href="/dashboard" className="btn-primary px-8 py-3 font-display font-bold">View dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── status colour ── */
  const statusColor = {
    idle: "text-ink-400",
    scanning: "text-amber-400",
    speaking: "text-volt",
    error: "text-red-400",
    low_confidence: "text-orange-400",
  }[aiStatus];

  const statusLabel = {
    idle: "Ready",
    scanning: "Analysing…",
    speaking: "Speaking…",
    error: "Error",
    low_confidence: "Low confidence",
  }[aiStatus];

  return (
    <div className="min-h-screen bg-ink flex flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-ink/80 backdrop-blur-xl shrink-0 z-10">
        <Link href="/projects" className="flex items-center gap-1.5 text-xs font-mono text-ink-400 hover:text-volt transition-colors">
          <Home size={13} /> Projects
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-ink-500">{project.title}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-ink-400">{stepGuide.completedSteps.length}/{stepGuide.totalSteps}</span>
            <div className="w-24 h-0.5 bg-ink-600">
              <div className="h-full bg-volt transition-all duration-500" style={{ width: `${stepGuide.progress}%` }} />
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setVoiceEnabled((v) => !v);
            if (speechSynthesis.speaking) speechSynthesis.cancel();
          }}
          className="text-ink-400 hover:text-volt transition-colors"
          title={voiceEnabled ? "Mute AI voice" : "Unmute AI voice"}
        >
          {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* ── Main split layout ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ════════════════════════════
            LEFT — Camera + Subtitle
            ════════════════════════════ */}
        <div className="relative flex-1 flex flex-col bg-black min-h-[300px] lg:min-h-0">

          {/* AI status pill — TOP of video */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-ink/70 backdrop-blur px-3 py-1.5 border border-white/10">
            <span className={`w-1.5 h-1.5 rounded-full ${aiStatus === "scanning" ? "animate-ping bg-amber-400" : aiStatus === "speaking" ? "animate-pulse bg-volt" : "bg-ink-400"}`} />
            <span className={`text-xs font-mono ${statusColor}`}>{statusLabel}</span>
            {aiConfidence > 0 && (
              <span className="text-[10px] font-mono text-ink-400">· {Math.round(aiConfidence * 100)}%</span>
            )}
          </div>

          {/* LIVE badge */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-red-600/90 px-2.5 py-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-white font-bold tracking-widest">LIVE</span>
          </div>

          {/* Camera feed fills remaining space */}
          <div className="flex-1 relative overflow-hidden">
            <CameraFeed onStreamReady={handleStreamReady} className="w-full h-full" />

            {/* Hidden video element — same stream, used only for captureFrame */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="hidden"
              aria-hidden="true"
            />

            {/* scan overlay */}
            {scanActive && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="w-full h-0.5 bg-volt/70 animate-bounce" style={{ animationDuration: "1.2s" }} />
              </div>
            )}

            {/* corner brackets  */}
            <div className="absolute inset-6 pointer-events-none z-10">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-volt/50" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-volt/50" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-volt/50" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-volt/50" />
            </div>
          </div>

          {/* ── Subtitle bar — BELOW video ── */}
          <div className={`shrink-0 bg-ink/90 backdrop-blur border-t border-white/5 px-6 py-3 min-h-[52px] flex items-center transition-all duration-300 ${subtitleVisible ? "opacity-100" : "opacity-0"}`}>
            {aiStatus === "speaking" && (
              <span className="text-[10px] font-mono text-volt mr-3 shrink-0">▶ AI</span>
            )}
            <p className="font-body text-sm text-white leading-snug">{subtitle || <span className="text-ink-500">—</span>}</p>
          </div>

          {/* ── Step info bar ── */}
          <div className="shrink-0 bg-ink-700/80 backdrop-blur border-t border-white/5 px-6 py-3 flex items-center justify-between">
            <div>
              <span className="section-label">Step {stepGuide.currentStep} of {stepGuide.totalSteps}</span>
              <p className="text-white font-display font-bold text-sm mt-0.5 truncate max-w-xs">
                {stepGuide.currentStepData?.title}
              </p>
            </div>
            {stepGuide.isStepCompleted(stepGuide.currentStep) && (
              <span className="flex items-center gap-1 text-xs font-mono text-volt shrink-0">
                <CheckCircle2 size={11} /> Done
              </span>
            )}
          </div>
        </div>

        {/* ════════════════════════════
            RIGHT — Chat panel
            ════════════════════════════ */}
        <div className="w-full lg:w-[380px] flex flex-col border-t lg:border-t-0 lg:border-l border-white/5 bg-ink-700">

          {/* chat header */}
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <MessageSquare size={14} className="text-volt" />
            <span className="text-xs font-mono text-white">AI Guidance Chat</span>
            {isLocked && (
              <span className="ml-auto text-[10px] font-mono text-amber-400 flex items-center gap-1">
                <MicOff size={10} /> {aiStatus === "scanning" ? "Analysing…" : "Speaking…"}
              </span>
            )}
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center">
                  <Camera size={18} className="text-ink-400" />
                </div>
                <p className="text-xs font-body text-ink-400 max-w-[200px]">
                  AI is scanning your build… Ask questions when it's done speaking.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-4 py-3 text-sm font-body leading-relaxed ${
                  msg.role === "user"
                    ? "bg-volt/10 border border-volt/20 text-white"
                    : "bg-ink-600 border border-white/5 text-ink-100"
                }`}>
                  {msg.role === "ai" && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-1 h-1 bg-volt rounded-full" />
                      <span className="text-[10px] font-mono text-volt">AI Guidance</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-[9px] font-mono text-ink-400 mt-1.5 block text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {/* scanning indicator */}
            {aiStatus === "scanning" && (
              <div className="flex justify-start">
                <div className="bg-ink-600 border border-white/5 px-4 py-3 flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin text-amber-400" />
                  <span className="text-xs font-mono text-amber-400">Analysing frame…</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* quick prompts */}
          {!isLocked && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {["What do you see?", "Is this correct?", "What's next?", "Any mistakes?"].map((q) => (
                <button
                  key={q}
                  onClick={() => analyse(q, false)}
                  className="text-[10px] px-2.5 py-1 bg-ink-600 border border-white/10 text-ink-300 hover:border-volt/50 hover:text-volt transition-colors font-mono"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* input bar */}
          <div className="px-4 pb-4 pt-2 border-t border-white/5">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={isLocked}
                placeholder={isLocked ? (aiStatus === "scanning" ? "Analysing…" : "AI is speaking…") : "Ask the AI anything…"}
                className="flex-1 input text-sm pr-12 disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <button
                onClick={sendMessage}
                disabled={isLocked || !userInput.trim()}
                className="absolute right-2 w-8 h-8 flex items-center justify-center bg-volt hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={13} className="text-ink" />
              </button>
            </div>
            {isLocked && (
              <p className="text-[10px] font-mono text-amber-400/70 mt-1.5 text-center">
                {aiStatus === "speaking" ? "🔇 Wait for AI to finish speaking to ask a question" : "🔍 Scanning your build…"}
              </p>
            )}
          </div>

          {/* step navigation */}
          <div className="px-4 pb-4 flex gap-2">
            <button onClick={prevStep} disabled={stepGuide.isFirstStep}
              className="btn-ghost px-3 py-2.5 text-xs disabled:opacity-30">
              <ChevronLeft size={14} />
            </button>
            <button onClick={completeStep}
              className="btn-primary flex-1 justify-center py-2.5 text-sm font-display font-bold">
              {stepGuide.isLastStep ? "Complete Build ✓" : "Step Done →"}
            </button>
            <button onClick={nextStep} disabled={stepGuide.isLastStep}
              className="btn-ghost px-3 py-2.5 text-xs disabled:opacity-30">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* step dots */}
          <div className="px-4 pb-4 flex flex-wrap gap-1.5">
            {stepGuide.steps.map((s) => (
              <button key={s.step_number} onClick={() => { stepGuide.goToStep(s.step_number); setMessages([]); }}
                className={`w-5 h-5 text-[9px] font-mono flex items-center justify-center border transition-all
                  ${s.step_number === stepGuide.currentStep ? "bg-volt border-volt text-ink" :
                    stepGuide.isStepCompleted(s.step_number) ? "bg-volt/20 border-volt/40 text-volt" :
                    "border-white/10 text-ink-400 hover:border-volt/30"}`}>
                {s.step_number}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
