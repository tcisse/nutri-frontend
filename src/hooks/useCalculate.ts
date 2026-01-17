"use client";

import { useMutation } from "@tanstack/react-query";
import { calculateCalories } from "@/lib/api";
import type { UserProfile, CalculateResponse } from "@/types";

export const useCalculate = () => {
  return useMutation<CalculateResponse, Error, UserProfile>({
    mutationFn: calculateCalories,
    onSuccess: (data, variables) => {
      // Store the result in sessionStorage for the dashboard
      if (typeof window !== "undefined") {
        sessionStorage.setItem("nutritionPlan", JSON.stringify(data));
        sessionStorage.setItem("userProfile", JSON.stringify(variables));
      }
    },
  });
};
