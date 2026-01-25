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
  fullName: string | null;
  email: string | null;
  password: string | null;
  gender: Gender | null;
  age: number | null;
  weight: number | null;
  height: number | null;
  activity: ActivityLevel | null;
  goal: Goal | null;
  rate: WeightChangeRate | null;
  country: Country | null;
  licenseCode?: string | null;
}

const initialState: OnboardingState = {
  step: 1,
  fullName: null,
  email: null,
  password: null,
  gender: null,
  age: null,
  weight: null,
  height: null,
  activity: null,
  goal: null,
  rate: null,
  country: null,
  licenseCode: null,
};

export const useOnboardingStore = () => {
  const [state, setState] = useState<OnboardingState>(initialState);

  // Steps:
  // 1: Identity (fullName, password, gender)
  // 2: Physical (age, weight, height)
  // 3: Activity
  // 4: Goal
  // 5: Rate (only if goal != maintain) / Country (if maintain)
  // 6: Country (only if goal != maintain)
  const getTotalSteps = useCallback((goal: Goal | null): number => {
    return goal === "maintain" ? 5 : 6;
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const totalSteps = getTotalSteps(prev.goal);
      if (prev.step === 4 && prev.goal === "maintain") {
        // Skip rate step, go directly to country (step 5 in maintain flow)
        return { ...prev, step: Math.min(prev.step + 1, totalSteps) };
      }
      return { ...prev, step: Math.min(prev.step + 1, totalSteps) };
    });
  }, [getTotalSteps]);

  const prevStep = useCallback(() => {
    setState((prev) => {
      return { ...prev, step: Math.max(prev.step - 1, 1) };
    });
  }, []);

  const setIdentity = useCallback(
    (info: { fullName: string; email: string; password: string; gender: Gender }) => {
      setState((prev) => ({ ...prev, ...info }));
    },
    []
  );

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
      rate: goal === "maintain" ? null : prev.rate,
    }));
  }, []);

  const setRate = useCallback((rate: WeightChangeRate) => {
    setState((prev) => ({ ...prev, rate }));
  }, []);

  const setCountry = useCallback((country: Country, licenseCode?: string) => {
    setState((prev) => ({
      ...prev,
      country,
      ...(licenseCode !== undefined && { licenseCode })
    }));
  }, []);

  const setLicenseCode = useCallback((licenseCode: string | null) => {
    setState((prev) => ({ ...prev, licenseCode }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const isComplete = useCallback((): boolean => {
    const baseComplete = !!(
      state.fullName &&
      state.email &&
      state.password &&
      state.gender &&
      state.age &&
      state.weight &&
      state.height &&
      state.activity &&
      state.goal &&
      state.country
    );

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
        return !!(
          state.fullName &&
          state.fullName.length >= 3 &&
          state.email &&
          state.email.includes("@") &&
          state.password &&
          state.password.length >= 6 &&
          state.gender
        );
      case 2:
        return !!(state.age && state.weight && state.height);
      case 3:
        return !!state.activity;
      case 4:
        return !!state.goal;
      case 5:
        if (state.goal === "maintain") {
          // At step 5 for maintain goal, need country AND license
          return !!(state.country && state.licenseCode && state.licenseCode.trim());
        }
        return !!state.rate;
      case 6:
        // At step 6, need country AND license
        return !!(state.country && state.licenseCode && state.licenseCode.trim());
      default:
        return false;
    }
  }, [state]);

  return {
    state,
    nextStep,
    prevStep,
    setIdentity,
    setPhysicalInfo,
    setActivity,
    setGoal,
    setRate,
    setCountry,
    setLicenseCode,
    reset,
    isComplete,
    getProfile,
    canProceed,
    getTotalSteps,
  };
};
