"use client";

import { useEffect, useRef, useCallback } from "react";

interface FrameCaptureProps {
  videoElement: HTMLVideoElement | null;
  captureIntervalMs?: number;
  quality?: number;
  onFrameCaptured: (frameData: string, metadata: { sizeKb: number; timestamp: number }) => void;
  enabled?: boolean;
}

export function FrameCapture({
  videoElement,
  captureIntervalMs = 4000,
  quality = 0.7,
  onFrameCaptured,
  enabled = true,
}: FrameCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const captureFrame = useCallback(() => {
    if (!videoElement || !enabled) return;

    // Create canvas if it doesn't exist
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    const canvas = canvasRef.current;
    const video = videoElement;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to JPEG base64
    const frameData = canvas.toDataURL("image/jpeg", quality);

    // Calculate size in KB
    const sizeKb = Math.round((frameData.length * 3) / 4 / 1024);

    // Emit frame data
    onFrameCaptured(frameData, {
      sizeKb,
      timestamp: Date.now(),
    });
  }, [videoElement, quality, onFrameCaptured, enabled]);

  useEffect(() => {
    if (!enabled || !videoElement) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start capturing frames at the specified interval
    intervalRef.current = setInterval(captureFrame, captureIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [captureFrame, captureIntervalMs, enabled, videoElement]);

  // This component doesn't render anything
  return null;
}
