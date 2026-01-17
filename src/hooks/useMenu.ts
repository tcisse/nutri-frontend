"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateMenu, regenerateMenu } from "@/lib/api";
import type { MenuResponse, PortionBudget } from "@/types";

// Query key factory
export const menuKeys = {
  all: ["menu"] as const,
  detail: (portions: PortionBudget, region: string) =>
    [...menuKeys.all, JSON.stringify(portions), region] as const,
};

/**
 * Hook pour récupérer le menu basé sur le budget de portions
 */
export const useMenu = (portions: PortionBudget | null, region: string) => {
  return useQuery<MenuResponse, Error>({
    queryKey: menuKeys.detail(portions || {} as PortionBudget, region),
    queryFn: () => generateMenu(portions!, region),
    enabled: !!portions && Object.keys(portions).length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook pour régénérer le menu
 * Note: Le backend n'a pas d'endpoint swap-food, donc on régénère tout le menu
 */
export const useRegenerateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MenuResponse,
    Error,
    { portions: PortionBudget; region: string }
  >({
    mutationFn: ({ portions, region }) => regenerateMenu(portions, region),
    onSuccess: (data, { portions, region }) => {
      // Mettre à jour le cache avec le nouveau menu
      queryClient.setQueryData(menuKeys.detail(portions, region), data);
    },
  });
};
