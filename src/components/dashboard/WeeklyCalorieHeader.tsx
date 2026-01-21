"use client";

import { Utensils, Calendar } from "lucide-react";
import type { PortionBudget } from "@/types";
import { FOOD_GROUP_LABELS } from "@/types";

interface WeeklyCalorieHeaderProps {
  calories: number;
  portions: PortionBudget;
  selectedDayLabel: string;
}

export const WeeklyCalorieHeader = ({
  calories,
  portions,
  selectedDayLabel,
}: WeeklyCalorieHeaderProps) => {
  const portionItems = [
    { key: "starch" as const, emoji: "🍚" },
    { key: "protein" as const, emoji: "🍗" },
    { key: "veg" as const, emoji: "🥬" },
    { key: "fruit" as const, emoji: "🍎" },
    { key: "milk" as const, emoji: "🥛" },
    { key: "fat" as const, emoji: "🫒" },
  ];

  return (
    <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-6 sm:p-8 border border-primary/10">
      {/* Day indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">
          {selectedDayLabel}
        </span>
      </div>

      {/* Calorie display */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground font-medium">
            Objectif quotidien
          </p>
          <p className="text-4xl font-bold text-foreground">
            {(calories ?? 0).toLocaleString("fr-FR")}
            <span className="text-lg font-medium text-muted-foreground ml-1">
              Kcal
            </span>
          </p>
        </div>
      </div>

      {/* Portion summary */}
      <div className="border-t border-border/50 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Portions par jour
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {portionItems.map((item) => (
            <div
              key={item.key}
              className="flex flex-col items-center p-2 rounded-xl bg-card border border-border/50"
            >
              <span className="text-lg mb-1" role="img" aria-hidden="true">
                {item.emoji}
              </span>
              <span className="text-lg font-bold text-foreground">
                {portions?.[item.key] ?? 0}
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {FOOD_GROUP_LABELS[item.key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
