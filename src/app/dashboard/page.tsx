"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  MealCard,
  MealCardSkeleton,
  DaySelector,
  WeeklyCalorieHeader,
} from "@/components/dashboard";
import { useWeeklyMenu, useRegenerateDay, useRegenerateWeeklyMenu } from "@/hooks/useWeeklyMenu";
import type { CalculateResponse, Country, MealType, DayOfWeek } from "@/types";
import { DAY_LABELS } from "@/types";
import {
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Loader2,
  Calendar,
  FileDown,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [planData, setPlanData] = useState<CalculateResponse | null>(null);
  const [country, setCountry] = useState<Country>("general");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [isReady, setIsReady] = useState(false);

  // Load plan data from sessionStorage
  useEffect(() => {
    const storedPlan = sessionStorage.getItem("nutritionPlan");
    const storedProfile = sessionStorage.getItem("userProfile");

    if (!storedPlan) {
      router.push("/onboarding");
      return;
    }

    try {
      const parsed = JSON.parse(storedPlan);
      
      // Vérifier si les données ont le bon format
      if (parsed.calories && parsed.portions) {
        setPlanData(parsed as CalculateResponse);
        setIsReady(true);
      } else {
        // Ancien format incompatible, rediriger vers onboarding
        console.log("Format de données incompatible, redirection...");
        sessionStorage.removeItem("nutritionPlan");
        sessionStorage.removeItem("userProfile");
        router.push("/onboarding");
        return;
      }
    } catch {
      router.push("/onboarding");
      return;
    }

    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        setCountry(profile.country || "general");
      } catch {
        // Ignore parsing errors
      }
    }
  }, [router]);

  // Fetch weekly menu from API
  const {
    data: weeklyMenuData,
    isLoading,
    isError,
    error,
  } = useWeeklyMenu(isReady ? planData?.portions || null : null, country);

  // Hooks pour régénérer
  const regenerateDayMutation = useRegenerateDay();
  const regenerateWeekMutation = useRegenerateWeeklyMenu();

  // Récupérer les repas du jour sélectionné
  const currentDayMeals = weeklyMenuData?.weeklyMenu[selectedDay] || [];

  // Fonction pour "changer" un aliment - régénère le jour
  const handleSwapFood = async (_mealType: MealType, _foodId: string) => {
    if (!planData?.portions) return;

    try {
      await regenerateDayMutation.mutateAsync({
        day: selectedDay,
        portions: planData.portions,
        region: country,
      });
      toast.success(`${DAY_LABELS[selectedDay]} régénéré !`);
    } catch {
      toast.error("Impossible de régénérer le jour");
    }
  };

  const handleRegenerateDay = async () => {
    if (!planData?.portions) return;

    try {
      await regenerateDayMutation.mutateAsync({
        day: selectedDay,
        portions: planData.portions,
        region: country,
      });
      toast.success(`${DAY_LABELS[selectedDay]} régénéré !`);
    } catch {
      toast.error("Impossible de régénérer le jour");
    }
  };

  const handleRegenerateWeek = async () => {
    if (!planData?.portions) return;

    try {
      await regenerateWeekMutation.mutateAsync({
        portions: planData.portions,
        region: country,
      });
      toast.success("Menu de la semaine régénéré !");
    } catch {
      toast.error("Impossible de régénérer la semaine");
    }
  };

  const handleBack = useCallback(() => {
    router.push("/onboarding");
  }, [router]);

  const handleExportPDF = useCallback(() => {
    router.push("/dashboard/export");
  }, [router]);

  // Show loading while checking sessionStorage
  if (!isReady || !planData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isRegenerating =
    regenerateDayMutation.isPending || regenerateWeekMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">NutriPlan</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Menu de la semaine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              aria-label="Modifier mon profil"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Modifier</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              aria-label="Exporter en PDF"
              className="text-primary border-primary/30 hover:bg-primary/10"
            >
              <FileDown className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateWeek}
              disabled={isLoading || isRegenerating}
              aria-label="Régénérer la semaine"
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Calorie header */}
        <section className="opacity-0 animate-fade-up">
          <WeeklyCalorieHeader
            calories={planData.calories}
            portions={planData.portions}
            selectedDay={selectedDay}
          />
        </section>

        {/* Day selector */}
        <section className="opacity-0 animate-fade-up stagger-1">
          <DaySelector
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </section>

        {/* Meals for selected day */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground opacity-0 animate-fade-up stagger-2">
              {DAY_LABELS[selectedDay]}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateDay}
              disabled={isLoading || isRegenerating}
              className="opacity-0 animate-fade-up stagger-2"
            >
              {regenerateDayMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              Régénérer ce jour
            </Button>
          </div>

          {isError && (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">
                Erreur lors du chargement : {error?.message}
              </p>
              <Button onClick={handleRegenerateWeek} variant="outline">
                Réessayer
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <MealCardSkeleton key={i} />
              ))}
            </div>
          ) : currentDayMeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentDayMeals.map((meal, index) => (
                <MealCard
                  key={`${selectedDay}-${meal.type}`}
                  meal={meal}
                  onSwapFood={handleSwapFood}
                  className={`opacity-0 animate-fade-up stagger-${Math.min(index + 3, 5)}`}
                />
              ))}
            </div>
          ) : (
            !isError && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Aucun menu généré pour ce jour.
                </p>
                <Button onClick={handleRegenerateWeek} disabled={isRegenerating}>
                  {isRegenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Générer le menu
                </Button>
              </div>
            )
          )}
        </section>

        {/* Navigation hint */}
        {currentDayMeals.length > 0 && (
          <section className="text-center py-6 opacity-0 animate-fade-up stagger-5">
            <p className="text-sm text-muted-foreground">
              💡 Utilisez les onglets pour naviguer entre les jours •
              Cliquez sur &quot;Changer&quot; pour régénérer un repas
            </p>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          © 2026 NutriPlan • Mangez équilibré, vivez mieux
        </p>
      </footer>
    </div>
  );
}
