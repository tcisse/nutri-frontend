"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateMonthlyMenu, getSessionMenuApi, saveMenuApi } from "@/lib/api";
import type { MonthlyMenuResponse } from "@/types";

// Query key factory
export const monthlyMenuKeys = {
  all: ["monthlyMenu"] as const,
  session: (sessionId: string) => [...monthlyMenuKeys.all, sessionId] as const,
};

/**
 * Hook pour récupérer le menu mensuel depuis le plan PDF
 * - Essaie d'abord de charger le menu sauvegardé en BDD
 * - Sinon, génère le menu depuis le plan selon le pays de l'utilisateur
 */
export const useMonthlyMenu = (days = 28) => {
  const sessionId = typeof window !== "undefined" ? sessionStorage.getItem("sessionId") : null;
  const userProfile = typeof window !== "undefined" ? sessionStorage.getItem("userProfile") : null;
  const country = userProfile ? (() => { try { return JSON.parse(userProfile).country; } catch { return undefined; } })() : undefined;

  return useQuery<MonthlyMenuResponse, Error>({
    queryKey: monthlyMenuKeys.session(sessionId || "none"),
    queryFn: async () => {
      // 1. Try to load saved menu
      if (sessionId) {
        const saved = await getSessionMenuApi(sessionId);
        if (saved) return saved;
      }

      // 2. Generate from PDF plan (with country-specific plan)
      const generated = await generateMonthlyMenu(days, country);

      // 3. Save to DB
      if (sessionId) {
        try {
          await saveMenuApi(sessionId, generated);
        } catch {
          // Non-blocking
        }
      }

      return generated;
    },
    enabled: true,
    staleTime: Infinity,
    retry: 2,
  });
};

/**
 * Hook pour régénérer tout le menu mensuel (re-charge depuis le plan PDF)
 */
export const useRegenerateMonthlyMenu = () => {
  const queryClient = useQueryClient();

  return useMutation<MonthlyMenuResponse, Error, { days?: number }>({
    mutationFn: ({ days = 28 }) => {
      const userProfile = typeof window !== "undefined" ? sessionStorage.getItem("userProfile") : null;
      const country = userProfile ? (() => { try { return JSON.parse(userProfile).country; } catch { return undefined; } })() : undefined;
      return generateMonthlyMenu(days, country);
    },
    onSuccess: (data) => {
      const sessionId = typeof window !== "undefined" ? sessionStorage.getItem("sessionId") : null;

      queryClient.setQueryData(monthlyMenuKeys.session(sessionId || "none"), data);

      if (sessionId) {
        saveMenuApi(sessionId, data).catch(() => {});
      }
    },
  });
};

// Legacy export — keeps the same signature for dashboard compatibility
export const useRegenerateMonthDay = () => {
  return { mutateAsync: async () => {}, isPending: false };
};
