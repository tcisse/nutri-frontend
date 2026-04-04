"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ProgressBar,
  StepIdentity,
  StepPhysical,
  StepActivity,
  StepGoal,
  StepRate,
  StepCountry,
} from "@/components/onboarding";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { createUserApi, createSessionApi } from "@/lib/api";
import { activateLicenseApi } from "@/lib/licenseApi";
import { setUserToken } from "@/lib/cookies";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    state,
    nextStep,
    prevStep,
    setIdentity,
    setPhysicalInfo,
    setActivity,
    setGoal,
    setRate,
    setCountry,
    canProceed,
    getProfile,
    getTotalSteps,
  } = useOnboardingStore();

  const handleSubmit = async () => {
    const profile = getProfile();
    if (!profile) {
      toast.error("Veuillez compléter toutes les informations");
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse fullName into firstName/lastName
      const nameParts = (state.fullName || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || firstName;

      // Create user account
      const { user: newUser, token } = await createUserApi({
        email: state.email!,
        firstName,
        lastName,
        password: state.password!,
        gender: state.gender!,
        height: state.height!,
        country: state.country!,
      });

      // Store auth token
      setUserToken(token);

      // Activate license (required)
      if (!state.licenseCode || !state.licenseCode.trim()) {
        toast.error("Une licence est requise pour continuer");
        return;
      }

      try {
        await activateLicenseApi(newUser.id, state.licenseCode.trim());
        toast.success("Licence activée avec succès!");
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } } };
        toast.error(err?.response?.data?.error || "Code de licence invalide ou déjà utilisé");
        return;
      }

      // Create session (no calorie calculation needed)
      await createSessionApi(newUser.id, {
        weight: state.weight!,
        age: state.age!,
        activityLevel: state.activity!,
        goal: state.goal!,
        rate: state.goal !== "maintain" ? state.rate! : undefined,
      });

      toast.success("Votre compte est créé, bienvenue !");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    const totalSteps = getTotalSteps(state.goal);
    if (state.step === totalSteps) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <StepIdentity
            values={{
              fullName: state.fullName,
              email: state.email,
              password: state.password,
              gender: state.gender,
            }}
            onChange={setIdentity}
          />
        );
      case 2:
        return (
          <StepPhysical
            values={{
              age: state.age,
              weight: state.weight,
              height: state.height,
            }}
            onChange={setPhysicalInfo}
          />
        );
      case 3:
        return <StepActivity value={state.activity} onChange={setActivity} />;
      case 4:
        return <StepGoal value={state.goal} onChange={setGoal} />;
      case 5:
        if (state.goal === "maintain") {
          return (
            <StepCountry
              value={state.country}
              licenseCode={state.licenseCode || null}
              onChange={setCountry}
            />
          );
        }
        return <StepRate value={state.rate} goal={state.goal} onChange={setRate} />;
      case 6:
        return (
          <StepCountry
            value={state.country}
            licenseCode={state.licenseCode || null}
            onChange={setCountry}
          />
        );
      default:
        return null;
    }
  };

  const totalSteps = getTotalSteps(state.goal);
  const isLastStep = state.step === totalSteps;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with logo */}
      <header className="py-6 px-4 border-b border-border/50">
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">NutriPlan</span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="py-6 px-4 bg-secondary/30">
        <ProgressBar currentStep={state.step} totalSteps={totalSteps} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col justify-center py-8 px-4">
        <div className="max-w-2xl mx-auto w-full">{renderStep()}</div>
      </main>

      {/* Navigation buttons */}
      <footer className="py-6 px-4 border-t border-border/50 bg-card/50">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={prevStep}
            disabled={state.step === 1 || isSubmitting}
            className="flex-1 h-12"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <Button
            size="lg"
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="flex-1 h-12"
            aria-label={isLastStep ? "Créer mon compte" : "Suivant"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : isLastStep ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Créer mon compte
              </>
            ) : (
              <>
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
