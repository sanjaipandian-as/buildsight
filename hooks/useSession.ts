"use client";

import { useState, useCallback, useEffect } from "react";
import type { AssemblySession, Project } from "@/lib/db/schema";

interface UseSessionOptions {
  sessionId?: string;
  autoSave?: boolean;
  saveInterval?: number;
}

interface SessionState {
  session: AssemblySession | null;
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  lastSaved: Date | null;
}

export function useSession({ sessionId, autoSave = true, saveInterval = 30000 }: UseSessionOptions = {}) {
  const [state, setState] = useState<SessionState>({
    session: null,
    project: null,
    isLoading: false,
    error: null,
    isDirty: false,
    lastSaved: null,
  });

  // Load session
  const loadSession = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/sessions/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load session: ${response.statusText}`);
      }

      const data = await response.json();
      const payload = data.data ?? data; // handle ok() wrapper
      
      setState(prev => ({
        ...prev,
        session: payload.session,
        project: payload.project,
        isLoading: false,
        isDirty: false,
        lastSaved: new Date(),
      }));

      return payload;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load session";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  // Create new session
  const createSession = useCallback(async (projectId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const data = await response.json();
      const payload = data.data ?? data;
      
      setState(prev => ({
        ...prev,
        session: payload.session,
        project: payload.project,
        isLoading: false,
        isDirty: false,
        lastSaved: new Date(),
      }));

      return payload;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create session";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  // Update session
  const updateSession = useCallback(async (updates: Partial<AssemblySession>) => {
    if (!state.session) {
      throw new Error("No active session to update");
    }

    // Optimistically update local state
    setState(prev => ({
      ...prev,
      session: prev.session ? { ...prev.session, ...updates } : null,
      isDirty: true,
    }));

    try {
      const response = await fetch(`/api/sessions/${state.session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update session: ${response.statusText}`);
      }

      const data = await response.json();
      const payload = data.data ?? data;
      
      setState(prev => ({
        ...prev,
        session: payload.session,
        isDirty: false,
        lastSaved: new Date(),
        error: null,
      }));

      return payload.session;
    } catch (error) {
      // Revert optimistic update on error
      setState(prev => ({
        ...prev,
        session: state.session,
        error: error instanceof Error ? error.message : "Failed to update session",
      }));
      throw error;
    }
  }, [state.session]);

  // Save session (manual save)
  const saveSession = useCallback(async () => {
    if (!state.session || !state.isDirty) {
      return state.session;
    }

    return updateSession({});
  }, [state.session, state.isDirty, updateSession]);

  // Delete session
  const deleteSession = useCallback(async (id?: string) => {
    const sessionIdToDelete = id || state.session?.id;
    
    if (!sessionIdToDelete) {
      throw new Error("No session ID provided");
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/sessions/${sessionIdToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.statusText}`);
      }

      // Clear state if we deleted the current session
      if (sessionIdToDelete === state.session?.id) {
        setState(prev => ({
          ...prev,
          session: null,
          project: null,
          isLoading: false,
          isDirty: false,
          lastSaved: null,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete session";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [state.session?.id]);

  // Update step progress
  const updateStepProgress = useCallback(async (currentStep: number, completedSteps: number[]) => {
    if (!state.session) return;

    return updateSession({
      currentStep,
      completedSteps,
    });
  }, [state.session, updateSession]);

  // Update session status
  const updateStatus = useCallback(async (status: "active" | "paused" | "completed") => {
    if (!state.session) return;

    const updates: Partial<AssemblySession> = { status };
    
    if (status === "completed") {
      updates.completedAt = new Date();
    }

    return updateSession(updates);
  }, [state.session, updateSession]);

  // Load session on mount if sessionId provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId).catch(console.error);
    }
  }, [sessionId, loadSession]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !state.isDirty || !state.session) {
      return;
    }

    const timer = setTimeout(() => {
      saveSession().catch(console.error);
    }, saveInterval);

    return () => clearTimeout(timer);
  }, [autoSave, state.isDirty, state.session, saveInterval, saveSession]);

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state.isDirty && state.session) {
        // Use sendBeacon for reliable saving on page unload
        navigator.sendBeacon(
          `/api/sessions/${state.session.id}`,
          JSON.stringify({
            currentStep: state.session.currentStep,
            completedSteps: state.session.completedSteps,
            status: state.session.status,
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.isDirty, state.session]);

  return {
    // State
    ...state,

    // Actions
    loadSession,
    createSession,
    updateSession,
    saveSession,
    deleteSession,
    updateStepProgress,
    updateStatus,
  };
}