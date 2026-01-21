"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateMonthlyMenu, regenerateMonthDay } from "@/lib/api";
import type { MonthlyMenuResponse, PortionBudget, DayOfMonth, Meal } from "@/types";

// Query key factory
export const monthlyMenuKeys = {
  all: ["monthlyMenu"] as const,
  detail: (portions: PortionBudget, region: string) =>
    [...monthlyMenuKeys.all, JSON.stringify(portions), region] as const,
};

/**
 * Hook pour récupérer le menu mensuel
 */
export const useMonthlyMenu = (portions: PortionBudget | null, region: string, days = 30) => {
  return useQuery<MonthlyMenuResponse, Error>({
    queryKey: monthlyMenuKeys.detail(portions || ({} as PortionBudget), `${region}-${days}`),
    queryFn: () => generateMonthlyMenu(portions!, region, days),
    enabled: !!portions && Object.keys(portions).length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

/**
 * Hook pour régénérer un jour spécifique du mois
 */
export const useRegenerateMonthDay = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Meal[],
    Error,
    { day: DayOfMonth; portions: PortionBudget; region: string; days?: number }
  >({
    mutationFn: ({ day, portions, region }) =>
      regenerateMonthDay(day, portions, region),
    onSuccess: (newMeals, { day, portions, region, days = 30 }) => {
      queryClient.setQueryData<MonthlyMenuResponse>(
        monthlyMenuKeys.detail(portions, `${region}-${days}`),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            monthlyMenu: {
              ...old.monthlyMenu,
              [day]: newMeals,
            },
          };
        }
      );
    },
  });
};

/**
 * Hook pour régénérer tout le menu mensuel
 */
export const useRegenerateMonthlyMenu = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MonthlyMenuResponse,
    Error,
    { portions: PortionBudget; region: string; days?: number }
  >({
    mutationFn: ({ portions, region, days = 30 }) => generateMonthlyMenu(portions, region, days),
    onSuccess: (data, { portions, region, days = 30 }) => {
      queryClient.setQueryData(monthlyMenuKeys.detail(portions, `${region}-${days}`), data);
    },
  });
};
