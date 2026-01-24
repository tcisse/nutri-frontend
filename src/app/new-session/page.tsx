"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSessionApi, calculateCalories } from "@/lib/api";
import type { ActivityLevel, Goal, WeightChangeRate, UserProfile, Country } from "@/types";
import { ACTIVITY_LABELS, GOAL_LABELS, RATE_LABELS } from "@/types";
import { Sparkles, Loader2, Weight, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewSessionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Form state
  const [weight, setWeight] = useState<number | "">("");
  const [age, setAge] = useState<number | "">("");
  const [activity, setActivity] = useState<ActivityLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [rate, setRate] = useState<WeightChangeRate | null>(null);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    const storedProfile = sessionStorage.getItem("userProfile");

    if (!storedUserId) {
      router.push("/login");
      return;
    }

    setUserId(storedUserId);

    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile) as UserProfile;
        setUserProfile(profile);
        setWeight(profile.weight);
        setAge(profile.age);
        setActivity(profile.activity);
        setGoal(profile.goal);
        setRate(profile.rate || null);
      } catch {
        // Ignore
      }
    }
  }, [router]);

  const canSubmit = weight && age && activity && goal && (goal === "maintain" || rate);

  const handleSubmit = async () => {
    if (!canSubmit || !userId || !userProfile) return;

    setIsLoading(true);
    try {
      const session = await createSessionApi(userId, {
        weight: Number(weight),
        age: Number(age),
        activityLevel: activity!,
        goal: goal!,
        rate: goal !== "maintain" ? rate! : undefined,
      });

      const profile: UserProfile = {
        ...userProfile,
        weight: Number(weight),
        age: Number(age),
        activity: activity!,
        goal: goal!,
        rate: goal !== "maintain" ? rate! : undefined,
      };

      const result = await calculateCalories(profile);

      sessionStorage.setItem("sessionId", session.id);
      sessionStorage.setItem("userProfile", JSON.stringify(profile));
      sessionStorage.setItem("nutritionPlan", JSON.stringify(result));
      sessionStorage.setItem("userMonth", String(session.month));

      toast.success("Nouveau plan généré !");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activityOptions: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "extra_active"];
  const goalOptions: Goal[] = ["lose", "maintain", "gain"];
  const rateOptions: WeightChangeRate[] = ["0.5", "1", "1.5", "2"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-6 px-4 border-b border-border/50">
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Nouveau mois</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-sm mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Mettez à jour vos infos
            </h2>
            <p className="text-muted-foreground text-sm">
              Renseignez votre poids actuel pour générer votre nouveau plan
            </p>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium flex items-center gap-2">
              <Weight className="w-4 h-4 text-primary" />
              Poids actuel
            </Label>
            <div className="relative">
              <Input
                id="weight"
                type="number"
                inputMode="numeric"
                value={weight}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : "")}
                placeholder="70"
                className="pr-12 h-12 text-lg bg-card border-2 border-border focus:border-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">kg</span>
            </div>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Âge
            </Label>
            <div className="relative">
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                placeholder="25"
                className="pr-12 h-12 text-lg bg-card border-2 border-border focus:border-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">ans</span>
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Niveau d&apos;activité</Label>
            <div className="grid grid-cols-1 gap-2">
              {activityOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setActivity(opt)}
                  className={cn(
                    "text-left px-4 py-3 rounded-lg border-2 transition-all text-sm",
                    activity === opt
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {ACTIVITY_LABELS[opt]}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Objectif</Label>
            <div className="grid grid-cols-3 gap-2">
              {goalOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setGoal(opt);
                    if (opt === "maintain") setRate(null);
                  }}
                  className={cn(
                    "px-3 py-3 rounded-lg border-2 transition-all text-sm text-center",
                    goal === opt
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {GOAL_LABELS[opt]}
                </button>
              ))}
            </div>
          </div>

          {/* Rate (only if goal != maintain) */}
          {goal && goal !== "maintain" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Rythme</Label>
              <div className="grid grid-cols-2 gap-2">
                {rateOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setRate(opt)}
                    className={cn(
                      "px-3 py-3 rounded-lg border-2 transition-all text-sm text-center",
                      rate === opt
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    {RATE_LABELS[opt]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className="w-full h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calcul en cours...
              </>
            ) : (
              <>
                Générer mon plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
