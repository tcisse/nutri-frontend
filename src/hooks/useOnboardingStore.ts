"use client";

import { useState, useCallback } from "react";
import type {
  Gender,
  ActivityLevel,
  Goal,
  WeightChangeRate,
  Country,
  UserProfile,
} from "@/types";

export interface OnboardingState {
  step: number;
  gender: Gender | null;
  age: number | null;
  weight: number | null;
  height: number | null;
  activity: ActivityLevel | null;
  goal: Goal | null;
  rate: WeightChangeRate | null;
  country: Country | null;
}

const initialState: OnboardingState = {
  step: 1,
  gender: null,
  age: null,
  weight: null,
  height: null,
  activity: null,
  goal: null,
  rate: null,
  country: null,
};

export const useOnboardingStore = () => {
  const [state, setState] = useState<OnboardingState>(initialState);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  // Nombre total d'étapes: 6 si goal != maintain, sinon 5 (on skip rate)
  const getTotalSteps = useCallback((goal: Goal | null): number => {
    return goal === "maintain" ? 5 : 6;
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const totalSteps = getTotalSteps(prev.goal);
      // Si on est à l'étape 4 (goal) et goal == maintain, skip l'étape 5 (rate)
      if (prev.step === 4 && prev.goal === "maintain") {
        return { ...prev, step: Math.min(prev.step + 2, totalSteps) };
      }
      return { ...prev, step: Math.min(prev.step + 1, totalSteps) };
    });
  }, [getTotalSteps]);

  const prevStep = useCallback(() => {
    setState((prev) => {
      // Si on est à l'étape 6 (country) et goal == maintain, on revient à 4 (goal)
      if (prev.step === 6 && prev.goal === "maintain") {
        return { ...prev, step: 4 };
      }
      return { ...prev, step: Math.max(prev.step - 1, 1) };
    });
  }, []);

  const setGender = useCallback((gender: Gender) => {
    setState((prev) => ({ ...prev, gender }));
  }, []);

  const setPhysicalInfo = useCallback(
    (info: { age: number; weight: number; height: number }) => {
      setState((prev) => ({ ...prev, ...info }));
    },
    []
  );

  const setActivity = useCallback((activity: ActivityLevel) => {
    setState((prev) => ({ ...prev, activity }));
  }, []);

  const setGoal = useCallback((goal: Goal) => {
    setState((prev) => ({
      ...prev,
      goal,
      // Reset rate si on passe à "maintain"
      rate: goal === "maintain" ? null : prev.rate,
    }));
  }, []);

  const setRate = useCallback((rate: WeightChangeRate) => {
    setState((prev) => ({ ...prev, rate }));
  }, []);

  const setCountry = useCallback((country: Country) => {
    setState((prev) => ({ ...prev, country }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const isComplete = useCallback((): boolean => {
    const baseComplete = !!(
      state.gender &&
      state.age &&
      state.weight &&
      state.height &&
      state.activity &&
      state.goal &&
      state.country
    );

    // Si goal != maintain, on doit aussi avoir rate
    if (state.goal && state.goal !== "maintain") {
      return baseComplete && !!state.rate;
    }

    return baseComplete;
  }, [state]);

  const getProfile = useCallback((): UserProfile | null => {
    if (!isComplete()) return null;

    return {
      gender: state.gender!,
      age: state.age!,
      weight: state.weight!,
      height: state.height!,
      activity: state.activity!,
      goal: state.goal!,
      rate: state.goal !== "maintain" ? state.rate! : undefined,
      country: state.country!,
    };
  }, [state, isComplete]);

  const canProceed = useCallback((): boolean => {
    switch (state.step) {
      case 1:
        return !!state.gender;
      case 2:
        return !!(state.age && state.weight && state.height);
      case 3:
        return !!state.activity;
      case 4:
        return !!state.goal;
      case 5:
        // Si goal == maintain, cette étape est country (skipped rate)
        // Sinon c'est l'étape rate
        if (state.goal === "maintain") {
          return !!state.country;
        }
        return !!state.rate;
      case 6:
        return !!state.country;
      default:
        return false;
    }
  }, [state]);

  return {
    state,
    setStep,
    nextStep,
    prevStep,
    setGender,
    setPhysicalInfo,
    setActivity,
    setGoal,
    setRate,
    setCountry,
    reset,
    isComplete,
    getProfile,
    canProceed,
    getTotalSteps,
  };
};
