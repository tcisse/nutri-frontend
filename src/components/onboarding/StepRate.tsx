"use client";

import { cn } from "@/lib/utils";
import type { WeightChangeRate, Goal } from "@/types";
import { RATE_LABELS, RATE_DESCRIPTIONS, RATE_KCAL_PER_DAY } from "@/types";
import { Zap, Gauge, Rocket, Flame } from "lucide-react";

interface StepRateProps {
  value: WeightChangeRate | null;
  goal: Goal | null;
  onChange: (rate: WeightChangeRate) => void;
}

const rateOptions: {
  value: WeightChangeRate;
  icon: typeof Zap;
  color: string;
  bgColor: string;
}[] = [
  {
    value: "0.5",
    icon: Gauge,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    value: "1",
    icon: Zap,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    value: "1.5",
    icon: Rocket,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    value: "2",
    icon: Flame,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
  },
];

export const StepRate = ({ value, goal, onChange }: StepRateProps) => {
  const isLosing = goal === "lose";
  const actionWord = isLosing ? "perdre" : "prendre";
  const kcalWord = isLosing ? "Déficit" : "Surplus";

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          À quel rythme souhaitez-vous {actionWord} du poids ?
        </h2>
        <p className="text-muted-foreground">
          Choisissez un rythme adapté à votre mode de vie
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        {rateOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          const kcalPerDay = RATE_KCAL_PER_DAY[option.value];

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
              aria-label={`Sélectionner ${RATE_LABELS[option.value]}`}
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

              {/* Recommended badge */}
              {option.value === "1" && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                  Recommandé
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
              <span
                className={cn(
                  "text-lg font-bold transition-colors",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {RATE_LABELS[option.value]}
              </span>

              {/* Kcal info */}
              <span className="text-sm font-medium text-muted-foreground mt-1">
                {kcalWord}: {kcalPerDay} kcal/jour
              </span>

              {/* Description */}
              <span className="text-xs text-muted-foreground mt-2">
                {RATE_DESCRIPTIONS[option.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Warning for aggressive rates */}
      {(value === "1.5" || value === "2") && (
        <div className="max-w-xl mx-auto p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm opacity-0 animate-fade-up stagger-5">
          <p className="font-medium">⚠️ Attention</p>
          <p className="mt-1">
            Un rythme de plus de 1 kg/semaine peut être difficile à maintenir et
            nécessite un suivi médical. Assurez-vous de consulter un
            professionnel de santé.
          </p>
        </div>
      )}
    </div>
  );
};
