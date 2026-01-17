"use client";

import { cn } from "@/lib/utils";
import type { Goal } from "@/types";
import { GOAL_LABELS, GOAL_DESCRIPTIONS } from "@/types";
import { TrendingDown, Minus, TrendingUp } from "lucide-react";

interface StepGoalProps {
  value: Goal | null;
  onChange: (goal: Goal) => void;
}

const goalOptions: {
  value: Goal;
  icon: typeof TrendingDown;
  color: string;
  bgColor: string;
}[] = [
  {
    value: "lose",
    icon: TrendingDown,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
  {
    value: "maintain",
    icon: Minus,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    value: "gain",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
];

export const StepGoal = ({ value, onChange }: StepGoalProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Quel est votre objectif ?
        </h2>
        <p className="text-muted-foreground">
          Nous adapterons votre plan alimentaire en conséquence
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
        {goalOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(option.value);
                }
              }}
              tabIndex={0}
              aria-label={`Sélectionner ${GOAL_LABELS[option.value]}`}
              aria-pressed={isSelected}
              className={cn(
                "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer group opacity-0 animate-fade-up",
                `stagger-${index + 1}`,
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md"
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                  <svg
                    className="w-3 h-3 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  "flex items-center justify-center w-14 h-14 rounded-full mb-3 transition-transform",
                  option.bgColor,
                  isSelected ? "scale-110" : "group-hover:scale-105"
                )}
              >
                <Icon className={cn("w-7 h-7", option.color)} />
              </div>

              {/* Label */}
              <p
                className={cn(
                  "font-semibold text-sm transition-colors text-center",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {GOAL_LABELS[option.value]}
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {GOAL_DESCRIPTIONS[option.value]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
