"use client";

import { cn } from "@/lib/utils";
import type { DayOfMonth } from "@/types";
import { MONTH_DAYS } from "@/types";

interface DaySelectorProps {
  selectedDay: DayOfMonth;
  onSelectDay: (day: DayOfMonth) => void;
  days?: number;
  className?: string;
}

export const DaySelector = ({
  selectedDay,
  onSelectDay,
  days = 30,
  className,
}: DaySelectorProps) => {
  const availableDays = MONTH_DAYS.filter((day) => day <= days);

  return (
    <div className={cn("grid grid-cols-7 gap-2", className)}>
      {availableDays.map((day) => {
        const isSelected = selectedDay === day;

        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDay(day)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectDay(day);
              }
            }}
            tabIndex={0}
            aria-label={`Sélectionner le jour ${day}`}
            aria-pressed={isSelected}
            className={cn(
              "flex items-center justify-center h-10 rounded-xl font-medium text-sm transition-all duration-200",
              isSelected
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
};
