"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, AlertCircle } from "lucide-react";

interface CameraFeedProps {
  onStreamReady?: (stream: MediaStream) => void;
  className?: string;
}

export function CameraFeed({ onStreamReady, className = "" }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false); // true once video is playing

  // stable callback ref so the useEffect below doesn't re-run when the parent
  // passes a new inline function on every render
  const onStreamReadyRef = useRef(onStreamReady);
  useEffect(() => { onStreamReadyRef.current = onStreamReady; }, [onStreamReady]);

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width:  { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!mounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = mediaStream;

        const video = videoRef.current;
        if (!video) return;

        // Attach stream BEFORE play() so the browser has data to display
        video.srcObject = mediaStream;

        // Wait for hardware to be ready before calling play()
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error("Video element error"));
          // safety timeout
          setTimeout(resolve, 3000);
        });

        if (!mounted) return;

        try {
          await video.play();
        } catch {
          // autoplay may already be running — not an error
        }

        setReady(true);
        onStreamReadyRef.current?.(mediaStream);
      } catch (err) {
        if (!mounted) return;

        let msg = "Failed to access camera.";
        if (err instanceof Error) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
            msg = "Camera permission denied. Please allow camera access.";
          else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError")
            msg = "No camera found. Please connect a camera.";
          else if (err.name === "NotReadableError" || err.name === "TrackStartError")
            msg = "Camera is in use by another app.";
          else
            msg = `Camera error: ${err.message}`;
        }
        setError(msg);
      }
    }

    start();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []); // ← empty: only run once on mount, never re-run

  /* ── error state ── */
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-black text-white ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-sm text-gray-300 text-center max-w-xs">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-xs bg-volt text-ink font-bold hover:bg-volt/80 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`relative bg-black overflow-hidden ${className}`}>
      {/* The video element is ALWAYS in the DOM so the ref is valid when srcObject is set */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ display: "block" }}
      />

      {/* Loading overlay — shown until first frame arrives */}
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
          <Camera className="w-10 h-10 text-volt mb-3 animate-pulse" />
          <p className="text-xs font-mono text-ink-400">Starting camera…</p>
        </div>
      )}
    </div>
  );
}
