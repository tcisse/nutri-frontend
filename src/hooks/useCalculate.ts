"use client";

import { useMutation } from "@tanstack/react-query";

/**
 * Hook vide — le calcul calorique a été supprimé.
 * Le plan alimentaire est désormais basé sur le PDF Togo (28 jours fixes).
 * Conservé pour compatibilité avec le code existant.
 */
export const useCalculate = () => {
  return useMutation<void, Error, void>({
    mutationFn: async () => {},
    onSuccess: () => {},
  });
};
