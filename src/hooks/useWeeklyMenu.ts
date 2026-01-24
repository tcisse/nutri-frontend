"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateMonthlyMenu, regenerateMonthDay, getSessionMenuApi, saveMenuApi } from "@/lib/api";
import type { MonthlyMenuResponse, PortionBudget, DayOfMonth, Meal } from "@/types";

// Query key factory
export const monthlyMenuKeys = {
  all: ["monthlyMenu"] as const,
  session: (sessionId: string) => [...monthlyMenuKeys.all, sessionId] as const,
  detail: (portions: PortionBudget, region: string) =>
    [...monthlyMenuKeys.all, JSON.stringify(portions), region] as const,
};

/**
 * Hook pour récupérer le menu mensuel
 * - Essaie d'abord de charger le menu sauvegardé en BDD
 * - Sinon, génère un nouveau menu et le sauvegarde
 */
export const useMonthlyMenu = (portions: PortionBudget | null, region: string, days = 30) => {
  const sessionId = typeof window !== "undefined" ? sessionStorage.getItem("sessionId") : null;

  return useQuery<MonthlyMenuResponse, Error>({
    queryKey: monthlyMenuKeys.session(sessionId || "none"),
    queryFn: async () => {
      // 1. Try to load saved menu
      if (sessionId) {
        const saved = await getSessionMenuApi(sessionId);
        if (saved) return saved;
      }

      // 2. Generate new menu
      const generated = await generateMonthlyMenu(portions!, region, days);

      // 3. Save to DB
      if (sessionId) {
        try {
          await saveMenuApi(sessionId, generated);
        } catch {
          // Non-blocking: if save fails, still return the generated menu
        }
      }

      return generated;
    },
    enabled: !!portions && Object.keys(portions).length > 0,
    staleTime: Infinity, // Don't refetch automatically — menu is persisted
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
    onSuccess: (newMeals, { day }) => {
      const sessionId = typeof window !== "undefined" ? sessionStorage.getItem("sessionId") : null;

      // Update cache
      queryClient.setQueryData<MonthlyMenuResponse>(
        monthlyMenuKeys.session(sessionId || "none"),
        (old) => {
          if (!old) return old;
          const updated = {
            ...old,
            monthlyMenu: {
              ...old.monthlyMenu,
              [day]: newMeals,
            },
          };

          // Save updated menu to DB
          if (sessionId) {
            saveMenuApi(sessionId, updated).catch(() => {});
          }

          return updated;
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
    onSuccess: (data) => {
      const sessionId = typeof window !== "undefined" ? sessionStorage.getItem("sessionId") : null;

      queryClient.setQueryData(monthlyMenuKeys.session(sessionId || "none"), data);

      // Save to DB
      if (sessionId) {
        saveMenuApi(sessionId, data).catch(() => {});
      }
    },
  });
};
