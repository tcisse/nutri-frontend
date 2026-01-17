"use client";

import { Flame, Utensils } from "lucide-react";
import type { PortionBudget } from "@/types";
import { FOOD_GROUP_LABELS } from "@/types";

interface CalorieHeaderProps {
  calories: number;
  portions: PortionBudget;
}

export const CalorieHeader = ({ calories, portions }: CalorieHeaderProps) => {
  const portionItems = [
    { key: "starch" as const, emoji: "🍚" },
    { key: "protein" as const, emoji: "🍗" },
    { key: "veg" as const, emoji: "🥬" },
    { key: "fruit" as const, emoji: "🍎" },
    { key: "milk" as const, emoji: "🥛" },
    { key: "fat" as const, emoji: "🫒" },
  ];

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-6 sm:p-8 border border-primary/10">
      {/* Calorie display */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Flame className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">
            Objectif quotidien
          </p>
          <p className="text-4xl font-bold text-foreground">
            {calories.toLocaleString("fr-FR")}
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
            Répartition des portions
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
                {portions[item.key]}
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
