"use client";

import { cn } from "@/lib/utils";
import type { Food } from "@/types";

interface FoodItemProps {
  food: Food;
}

export const FoodItem = ({ food }: FoodItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-secondary/30 transition-all duration-200"
      )}
    >
      {/* Bullet */}
      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary/60 mt-0.5" />

      {/* Food description */}
      <p className="text-sm text-foreground leading-snug">{food.name}</p>
    </div>
  );
};
