"use client";

import { cn } from "@/lib/utils";
import type { ActivityLevel } from "@/types";
import { ACTIVITY_LABELS, ACTIVITY_DESCRIPTIONS } from "@/types";
import { Armchair, Footprints, Bike, Dumbbell, Flame } from "lucide-react";

interface StepActivityProps {
  value: ActivityLevel | null;
  onChange: (activity: ActivityLevel) => void;
}

const activityOptions: {
  value: ActivityLevel;
  icon: typeof Armchair;
}[] = [
  { value: "sedentary", icon: Armchair },
  { value: "light", icon: Footprints },
  { value: "moderate", icon: Bike },
  { value: "active", icon: Dumbbell },
  { value: "extra_active", icon: Flame },
];

export const StepActivity = ({ value, onChange }: StepActivityProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Quel est votre niveau d&apos;activité ?
        </h2>
        <p className="text-muted-foreground">
          Choisissez celui qui correspond le mieux à votre quotidien
        </p>
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        {activityOptions.map((option, index) => {
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
              aria-label={`Sélectionner ${ACTIVITY_LABELS[option.value]}`}
              aria-pressed={isSelected}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group opacity-0 animate-fade-up",
                `stagger-${index + 1}`,
                isSelected
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Text */}
              <div className="flex-1 text-left">
                <p
                  className={cn(
                    "font-semibold transition-colors",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {ACTIVITY_LABELS[option.value]}
                </p>
                <p className="text-sm text-muted-foreground">
                  {ACTIVITY_DESCRIPTIONS[option.value]}
                </p>
              </div>

              {/* Selection indicator */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                )}
              >
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-primary-foreground animate-scale-in"
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
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
