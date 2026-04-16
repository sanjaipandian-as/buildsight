"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Project, ProjectStep } from "@/lib/db/schema";

interface UseStepGuideOptions {
  project: Project | null;
  initialStep?: number;
  initialCompletedSteps?: number[];
  autoAdvance?: boolean;
  onStepChange?: (step: number) => void;
  onStepComplete?: (step: number) => void;
  onAllStepsComplete?: () => void;
}

interface StepGuideState {
  currentStep: number;
  completedSteps: number[];
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
  currentStepData: ProjectStep | null;
}

export function useStepGuide({
  project,
  initialStep = 1,
  initialCompletedSteps = [],
  autoAdvance = false,
  onStepChange,
  onStepComplete,
  onAllStepsComplete,
}: UseStepGuideOptions) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>(initialCompletedSteps);

  const totalSteps = project?.totalSteps || 0;
  const steps = project?.steps || [];

  // Derived state
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const progress = totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0;
  const currentStepData = steps.find(step => step.step_number === currentStep) || null;

  // Navigation functions
  const goToStep = useCallback((stepNumber: number) => {
    if (stepNumber < 1 || stepNumber > totalSteps) {
      return false;
    }

    setCurrentStep(stepNumber);
    onStepChange?.(stepNumber);
    return true;
  }, [totalSteps, onStepChange]);

  const nextStep = useCallback(() => {
    if (isLastStep) return false;
    return goToStep(currentStep + 1);
  }, [currentStep, isLastStep, goToStep]);

  const previousStep = useCallback(() => {
    if (isFirstStep) return false;
    return goToStep(currentStep - 1);
  }, [currentStep, isFirstStep, goToStep]);

  const goToFirstStep = useCallback(() => {
    return goToStep(1);
  }, [goToStep]);

  const goToLastStep = useCallback(() => {
    return goToStep(totalSteps);
  }, [totalSteps, goToStep]);

  // Step completion functions
  const markStepComplete = useCallback((stepNumber: number) => {
    if (stepNumber < 1 || stepNumber > totalSteps) {
      return false;
    }

    setCompletedSteps(prev => {
      if (prev.includes(stepNumber)) {
        return prev; // Already completed
      }
      
      const newCompleted = [...prev, stepNumber].sort((a, b) => a - b);
      
      // Check if all steps are now complete
      if (newCompleted.length === totalSteps) {
        setTimeout(() => onAllStepsComplete?.(), 0);
      }
      
      return newCompleted;
    });

    onStepComplete?.(stepNumber);

    // Auto-advance if enabled and this is the current step
    if (autoAdvance && stepNumber === currentStep && !isLastStep) {
      setTimeout(() => nextStep(), 1000);
    }

    return true;
  }, [totalSteps, onStepComplete, autoAdvance, currentStep, isLastStep, nextStep, onAllStepsComplete]);

  const markStepIncomplete = useCallback((stepNumber: number) => {
    if (stepNumber < 1 || stepNumber > totalSteps) {
      return false;
    }

    setCompletedSteps(prev => prev.filter(step => step !== stepNumber));
    return true;
  }, [totalSteps]);

  const markCurrentStepComplete = useCallback(() => {
    return markStepComplete(currentStep);
  }, [currentStep, markStepComplete]);

  const toggleStepComplete = useCallback((stepNumber: number) => {
    const isCompleted = completedSteps.includes(stepNumber);
    return isCompleted 
      ? markStepIncomplete(stepNumber)
      : markStepComplete(stepNumber);
  }, [completedSteps, markStepComplete, markStepIncomplete]);

  // Reset functions
  const resetProgress = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps([]);
  }, []);

  const resetToStep = useCallback((stepNumber: number) => {
    if (stepNumber < 1 || stepNumber > totalSteps) {
      return false;
    }

    setCurrentStep(stepNumber);
    // Keep only completed steps before the target step
    setCompletedSteps(prev => prev.filter(step => step < stepNumber));
    return true;
  }, [totalSteps]);

  // Validation functions
  const isStepCompleted = useCallback((stepNumber: number) => {
    return completedSteps.includes(stepNumber);
  }, [completedSteps]);

  const canGoToStep = useCallback((stepNumber: number) => {
    // Can always go to step 1
    if (stepNumber === 1) return true;
    
    // Can go to any step if it's completed or the previous step is completed
    return isStepCompleted(stepNumber) || isStepCompleted(stepNumber - 1);
  }, [isStepCompleted]);

  const getStepStatus = useCallback((stepNumber: number) => {
    if (stepNumber === currentStep) return "current";
    if (isStepCompleted(stepNumber)) return "completed";
    if (stepNumber < currentStep) return "available";
    return "locked";
  }, [currentStep, isStepCompleted]);

  // Update current step only when initialStep actually changes value
  const prevInitialStep = useRef(initialStep);
  useEffect(() => {
    if (prevInitialStep.current !== initialStep) {
      prevInitialStep.current = initialStep;
      setCurrentStep(initialStep);
    }
  }, [initialStep]);

  // Update completed steps only when the array content changes (not reference)
  const prevCompletedJSON = useRef(JSON.stringify(initialCompletedSteps));
  useEffect(() => {
    const next = JSON.stringify(initialCompletedSteps);
    if (prevCompletedJSON.current !== next) {
      prevCompletedJSON.current = next;
      setCompletedSteps(initialCompletedSteps);
    }
  }, [initialCompletedSteps]);

  const state: StepGuideState = {
    currentStep,
    completedSteps,
    isFirstStep,
    isLastStep,
    progress,
    currentStepData,
  };

  return {
    // State
    ...state,
    totalSteps,
    steps,

    // Navigation
    goToStep,
    nextStep,
    previousStep,
    goToFirstStep,
    goToLastStep,

    // Completion
    markStepComplete,
    markStepIncomplete,
    markCurrentStepComplete,
    toggleStepComplete,

    // Reset
    resetProgress,
    resetToStep,

    // Validation
    isStepCompleted,
    canGoToStep,
    getStepStatus,
  };
}