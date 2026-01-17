"use client";

import { useState, useCallback } from "react";
import type {
  Gender,
  ActivityLevel,
  Goal,
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
  country: null,
};

export const useOnboardingStore = () => {
  const [state, setState] = useState<OnboardingState>(initialState);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 5) }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
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
    setState((prev) => ({ ...prev, goal }));
  }, []);

  const setCountry = useCallback((country: Country) => {
    setState((prev) => ({ ...prev, country }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const isComplete = useCallback((): boolean => {
    return !!(
      state.gender &&
      state.age &&
      state.weight &&
      state.height &&
      state.activity &&
      state.goal &&
      state.country
    );
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
    setCountry,
    reset,
    isComplete,
    getProfile,
    canProceed,
  };
};
