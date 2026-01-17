"use client";

import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "@/types";
import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
}

export const ProgressBar = ({ currentStep }: ProgressBarProps) => {
  const progress = ((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Step indicators */}
      <div className="relative flex items-center justify-between mb-2">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-secondary -translate-y-1/2 rounded-full" />

        {/* Progress line */}
        <div
          className="absolute left-0 top-1/2 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />

        {/* Step dots */}
        {ONBOARDING_STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                "relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-secondary text-muted-foreground"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs font-semibold">{step.id}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current step label */}
      <div className="text-center mt-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Étape {currentStep} sur {ONBOARDING_STEPS.length}
        </p>
        <p className="text-sm font-medium text-foreground mt-1">
          {ONBOARDING_STEPS[currentStep - 1]?.title}
        </p>
      </div>
    </div>
  );
};
