"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodItem } from "./FoodItem";
import type { Meal, MealType } from "@/types";
import { MEAL_LABELS, MEAL_ICONS } from "@/types";
import { cn } from "@/lib/utils";

interface MealCardProps {
  meal: Meal;
  onSwapFood: (mealType: MealType, foodId: string) => Promise<void>;
  className?: string;
}

const mealColors: Record<MealType, string> = {
  breakfast: "border-amber-200/50",
  snack: "border-rose-200/50",
  lunch: "border-emerald-200/50",
  dinner: "border-indigo-200/50",
};

const mealIconBg: Record<MealType, string> = {
  breakfast: "bg-amber-100",
  snack: "bg-rose-100",
  lunch: "bg-emerald-100",
  dinner: "bg-indigo-100",
};

export const MealCard = ({ meal, onSwapFood, className }: MealCardProps) => {
  const [swappingFoodId, setSwappingFoodId] = useState<string | null>(null);

  const handleSwap = async (foodId: string) => {
    setSwappingFoodId(foodId);
    try {
      await onSwapFood(meal.type, foodId);
    } finally {
      setSwappingFoodId(null);
    }
  };

  const totalItems = meal.foods.reduce((sum, food) => sum + food.quantity, 0);

  return (
    <Card
      className={cn(
        "overflow-hidden border transition-all duration-300 hover:shadow-[2px]",
        `bg-linear-to-br ${mealColors[meal.type]}`,
        className
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                mealIconBg[meal.type]
              )}
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {MEAL_ICONS[meal.type]}
              </span>
            </div>

            {/* Meal name */}
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {MEAL_LABELS[meal.type]}
              </h3>
              <p className="text-xs text-muted-foreground font-normal">
                {totalItems} portion{totalItems > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {meal.foods.map((food) => (
          <FoodItem
            key={food.id}
            food={food}
            mealType={meal.type}
            onSwap={handleSwap}
            isSwapping={swappingFoodId === food.id}
          />
        ))}

        {meal.foods.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun aliment pour ce repas
          </p>
        )}
      </CardContent>
    </Card>
  );
};
