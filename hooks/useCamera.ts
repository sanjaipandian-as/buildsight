"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseCameraOptions {
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
}

interface CameraState {
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
  permissionState: "granted" | "denied" | "prompt" | "unknown";
}

export function useCamera(options: UseCameraOptions = {}) {
  const {
    facingMode = "environment",
    width = 1280,
    height = 720,
  } = options;

  const [state, setState] = useState<CameraState>({
    stream: null,
    error: null,
    isLoading: false,
    isSupported: false,
    permissionState: "unknown",
  });

  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  // Check if camera is supported
  useEffect(() => {
    const isSupported = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );
    
    setState(prev => ({ ...prev, isSupported }));
  }, []);

  // Check permission state
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setState(prev => ({ ...prev, permissionState: "unknown" }));
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: "camera" as PermissionName });
      setState(prev => ({ ...prev, permissionState: permission.state as any }));
      
      permission.addEventListener("change", () => {
        if (mountedRef.current) {
          setState(prev => ({ ...prev, permissionState: permission.state as any }));
        }
      });
    } catch (error) {
      setState(prev => ({ ...prev, permissionState: "unknown" }));
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: "Camera is not supported in this browser",
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      // Stop previous stream if exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      streamRef.current = stream;
      setState(prev => ({
        ...prev,
        stream,
        isLoading: false,
        error: null,
        permissionState: "granted",
      }));
    } catch (error) {
      if (!mountedRef.current) return;

      let errorMessage = "Failed to access camera";
      
      if (error instanceof Error) {
        switch (error.name) {
          case "NotAllowedError":
          case "PermissionDeniedError":
            errorMessage = "Camera permission denied. Please allow camera access.";
            setState(prev => ({ ...prev, permissionState: "denied" }));
            break;
          case "NotFoundError":
          case "DevicesNotFoundError":
            errorMessage = "No camera found. Please connect a camera.";
            break;
          case "NotReadableError":
          case "TrackStartError":
            errorMessage = "Camera is already in use by another application.";
            break;
          case "OverconstrainedError":
            errorMessage = "Camera constraints could not be satisfied.";
            break;
          default:
            errorMessage = `Camera error: ${error.message}`;
        }
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        stream: null,
      }));
    }
  }, [state.isSupported, facingMode, width, height]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      stream: null,
      isLoading: false,
    }));
  }, []);

  // Capture frame from video element
  const captureFrame = useCallback((
    videoElement: HTMLVideoElement,
    quality: number = 0.7
  ): { dataUrl: string; sizeKb: number } | null => {
    if (!videoElement || videoElement.readyState !== 4) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(videoElement, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

    return { dataUrl, sizeKb };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    checkPermission();

    return () => {
      mountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [checkPermission]);

  return {
    ...state,
    startCamera,
    stopCamera,
    captureFrame,
  };
}