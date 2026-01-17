"use client";

import { cn } from "@/lib/utils";
import type { DayOfWeek } from "@/types";
import { DAY_SHORT_LABELS, DAYS_ORDER } from "@/types";

interface DaySelectorProps {
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  className?: string;
}

export const DaySelector = ({
  selectedDay,
  onSelectDay,
  className,
}: DaySelectorProps) => {
  return (
    <div className={cn("flex gap-1 sm:gap-2 overflow-x-auto pb-2", className)}>
      {DAYS_ORDER.map((day) => {
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
            aria-label={`Sélectionner ${DAY_SHORT_LABELS[day]}`}
            aria-pressed={isSelected}
            className={cn(
              "flex-shrink-0 px-3 sm:px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200",
              isSelected
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {DAY_SHORT_LABELS[day]}
          </button>
        );
      })}
    </div>
  );
};
