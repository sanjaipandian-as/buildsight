"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  onStepChange?: (step: number) => void;
  allowNavigation?: boolean;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  completedSteps,
  onStepChange,
  allowNavigation = true,
}: ProgressBarProps) {
  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  const handlePrevious = () => {
    if (currentStep > 1 && allowNavigation) {
      onStepChange?.(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && allowNavigation) {
      onStepChange?.(currentStep + 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (allowNavigation) {
      onStepChange?.(step);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Progress
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {completedSteps.length} of {totalSteps} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Step {currentStep}</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;

          return (
            <button
              key={stepNumber}
              onClick={() => handleStepClick(stepNumber)}
              disabled={!allowNavigation}
              className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                isCurrent
                  ? "bg-blue-600 text-white ring-2 ring-blue-300"
                  : isCompleted
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              } ${
                allowNavigation
                  ? "hover:scale-110 cursor-pointer"
                  : "cursor-not-allowed"
              }`}
            >
              {stepNumber}
            </button>
          );
        })}
      </div>

      {/* Navigation Controls */}
      {allowNavigation && (
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === totalSteps}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}