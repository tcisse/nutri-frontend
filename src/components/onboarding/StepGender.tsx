"use client";

import { cn } from "@/lib/utils";
import type { Gender } from "@/types";

interface StepGenderProps {
  value: Gender | null;
  onChange: (gender: Gender) => void;
}

const genderOptions: { value: Gender; label: string; icon: string }[] = [
  { value: "male", label: "Homme", icon: "👨" },
  { value: "female", label: "Femme", icon: "👩" },
];

export const StepGender = ({ value, onChange }: StepGenderProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Quel est votre genre ?
        </h2>
        <p className="text-muted-foreground">
          Cela nous aide à calculer vos besoins caloriques
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {genderOptions.map((option, index) => (
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
            aria-label={`Sélectionner ${option.label}`}
            aria-pressed={value === option.value}
            className={cn(
              "relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer group opacity-0 animate-fade-up",
              index === 0 ? "stagger-1" : "stagger-2",
              value === option.value
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border bg-card hover:border-primary/50 hover:shadow-md"
            )}
          >
            {/* Selection indicator */}
            {value === option.value && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                <svg
                  className="w-4 h-4 text-primary-foreground"
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
            <span
              className={cn(
                "text-5xl mb-3 transition-transform duration-300",
                value === option.value ? "scale-110" : "group-hover:scale-105"
              )}
              role="img"
              aria-hidden="true"
            >
              {option.icon}
            </span>

            {/* Label */}
            <span
              className={cn(
                "text-lg font-semibold transition-colors",
                value === option.value
                  ? "text-primary"
                  : "text-foreground group-hover:text-primary"
              )}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
