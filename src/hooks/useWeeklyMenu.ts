"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateWeeklyMenu, regenerateDay } from "@/lib/api";
import type { WeeklyMenuResponse, PortionBudget, DayOfWeek, Meal } from "@/types";

// Query key factory
export const weeklyMenuKeys = {
  all: ["weeklyMenu"] as const,
  detail: (portions: PortionBudget, region: string) =>
    [...weeklyMenuKeys.all, JSON.stringify(portions), region] as const,
};

/**
 * Hook pour récupérer le menu hebdomadaire
 */
export const useWeeklyMenu = (portions: PortionBudget | null, region: string) => {
  return useQuery<WeeklyMenuResponse, Error>({
    queryKey: weeklyMenuKeys.detail(portions || ({} as PortionBudget), region),
    queryFn: () => generateWeeklyMenu(portions!, region),
    enabled: !!portions && Object.keys(portions).length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes (plus long car c'est une semaine)
    retry: 2,
  });
};

/**
 * Hook pour régénérer un jour spécifique
 */
export const useRegenerateDay = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Meal[],
    Error,
    { day: DayOfWeek; portions: PortionBudget; region: string }
  >({
    mutationFn: ({ day, portions, region }) =>
      regenerateDay(day, portions, region),
    onSuccess: (newMeals, { day, portions, region }) => {
      // Mettre à jour le cache avec le nouveau jour
      queryClient.setQueryData<WeeklyMenuResponse>(
        weeklyMenuKeys.detail(portions, region),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            weeklyMenu: {
              ...old.weeklyMenu,
              [day]: newMeals,
            },
          };
        }
      );
    },
  });
};

/**
 * Hook pour régénérer tout le menu hebdomadaire
 */
export const useRegenerateWeeklyMenu = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WeeklyMenuResponse,
    Error,
    { portions: PortionBudget; region: string }
  >({
    mutationFn: ({ portions, region }) => generateWeeklyMenu(portions, region),
    onSuccess: (data, { portions, region }) => {
      queryClient.setQueryData(weeklyMenuKeys.detail(portions, region), data);
    },
  });
};
