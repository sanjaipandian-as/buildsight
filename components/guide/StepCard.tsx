"use client";

import { CheckCircle2, Circle } from "lucide-react";
import type { ProjectStep } from "@/lib/db/schema";

interface StepCardProps {
  step: ProjectStep;
  isActive: boolean;
  isCompleted: boolean;
  totalSteps: number;
}

export function StepCard({ step, isActive, isCompleted, totalSteps }: StepCardProps) {
  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all ${
        isActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
          : isCompleted
          ? "border-green-500 bg-green-50 dark:bg-green-950"
          : "border-gray-300 bg-white dark:bg-gray-800"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          ) : (
            <Circle
              className={`w-8 h-8 ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`}
            />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {step.title}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Step {step.step_number} of {totalSteps}
            </span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {step.instruction}
          </p>

          {step.visual_cues && step.visual_cues.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Look for:
              </p>
              <div className="flex flex-wrap gap-2">
                {step.visual_cues.map((cue, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {cue}
                  </span>
                ))}
              </div>
            </div>
          )}

          {step.image_url && (
            <div className="mt-4">
              <img
                src={step.image_url}
                alt={step.title}
                className="rounded-lg w-full max-w-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
