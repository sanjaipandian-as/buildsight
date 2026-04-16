"use client";

import { Brain, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type AIStatus = "idle" | "analyzing" | "step_detected" | "error" | "low_confidence";

interface AIStatusBadgeProps {
  status: AIStatus;
  confidence?: number;
  errorMessage?: string;
  className?: string;
}

export function AIStatusBadge({
  status,
  confidence,
  errorMessage,
  className = "",
}: AIStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "idle":
        return {
          icon: Brain,
          text: "AI Ready",
          bgColor: "bg-gray-100 dark:bg-gray-800",
          textColor: "text-gray-700 dark:text-gray-300",
          iconColor: "text-gray-500",
          animate: false,
        };
      case "analyzing":
        return {
          icon: Loader2,
          text: "Analyzing...",
          bgColor: "bg-blue-100 dark:bg-blue-900",
          textColor: "text-blue-800 dark:text-blue-200",
          iconColor: "text-blue-600",
          animate: true,
        };
      case "step_detected":
        return {
          icon: CheckCircle2,
          text: confidence ? `Step Detected (${confidence}%)` : "Step Detected",
          bgColor: "bg-green-100 dark:bg-green-900",
          textColor: "text-green-800 dark:text-green-200",
          iconColor: "text-green-600",
          animate: false,
        };
      case "low_confidence":
        return {
          icon: AlertCircle,
          text: confidence ? `Low Confidence (${confidence}%)` : "Low Confidence",
          bgColor: "bg-yellow-100 dark:bg-yellow-900",
          textColor: "text-yellow-800 dark:text-yellow-200",
          iconColor: "text-yellow-600",
          animate: false,
        };
      case "error":
        return {
          icon: AlertCircle,
          text: "AI Error",
          bgColor: "bg-red-100 dark:bg-red-900",
          textColor: "text-red-800 dark:text-red-200",
          iconColor: "text-red-600",
          animate: false,
        };
      default:
        return {
          icon: Brain,
          text: "Unknown",
          bgColor: "bg-gray-100 dark:bg-gray-800",
          textColor: "text-gray-700 dark:text-gray-300",
          iconColor: "text-gray-500",
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor} ${className}`}
    >
      <Icon
        className={`w-4 h-4 ${config.iconColor} ${
          config.animate ? "animate-spin" : ""
        }`}
      />
      <span>{config.text}</span>
      
      {status === "error" && errorMessage && (
        <div className="ml-2 group relative">
          <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}