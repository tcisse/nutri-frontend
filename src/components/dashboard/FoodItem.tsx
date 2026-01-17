"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Food, MealType } from "@/types";
import { FOOD_GROUP_LABELS, FOOD_GROUP_COLORS } from "@/types";
import { RefreshCw, Loader2 } from "lucide-react";

interface FoodItemProps {
  food: Food;
  mealType: MealType;
  onSwap: (foodId: string) => Promise<void>;
  isSwapping: boolean;
}

export const FoodItem = ({
  food,
  mealType,
  onSwap,
  isSwapping,
}: FoodItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleSwap = async () => {
    await onSwap(food.id);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-xl transition-all duration-200",
        isHovered ? "bg-secondary/80" : "bg-secondary/30",
        isSwapping && "opacity-60"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Food info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Quantity badge */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">{food.quantity}</span>
        </div>

        {/* Food details */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{food.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                FOOD_GROUP_COLORS[food.group]
              )}
            >
              {FOOD_GROUP_LABELS[food.group]}
            </span>
            <span className="text-xs text-muted-foreground">
              {food.portion}
            </span>
          </div>
        </div>
      </div>

      {/* Swap button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSwap}
        disabled={isSwapping}
        className={cn(
          "flex-shrink-0 ml-2 transition-opacity",
          isHovered ? "opacity-100" : "opacity-0 sm:opacity-50"
        )}
        aria-label={`Changer ${food.name}`}
      >
        {isSwapping ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        <span className="ml-1 hidden sm:inline">Changer</span>
      </Button>
    </div>
  );
};
