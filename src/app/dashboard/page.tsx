"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  MealCard,
  MealCardSkeleton,
  DaySelector,
  WeeklyCalorieHeader,
} from "@/components/dashboard";
import { useMonthlyMenu, useRegenerateMonthDay, useRegenerateMonthlyMenu } from "@/hooks/useWeeklyMenu";
import type { CalculateResponse, Country, MealType, DayOfMonth } from "@/types";
import {
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Loader2,
  Calendar,
  FileDown,
  TrendingUp,
  CalendarPlus,
  User,
  Key,
} from "lucide-react";

const loadInitialData = (): {
  planData: CalculateResponse | null;
  country: Country;
  shouldRedirect: boolean;
} => {
  if (typeof window === "undefined") {
    return { planData: null, country: "general", shouldRedirect: false };
  }

  const storedPlan = sessionStorage.getItem("nutritionPlan");
  const storedProfile = sessionStorage.getItem("userProfile");

  if (!storedPlan) {
    return { planData: null, country: "general", shouldRedirect: true };
  }

  try {
    const parsed = JSON.parse(storedPlan);
    if (parsed.calories && parsed.portions) {
      let country: Country = "general";
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          country = profile.country || "general";
        } catch {
          // Ignore
        }
      }
      return { planData: parsed as CalculateResponse, country, shouldRedirect: false };
    } else {
      sessionStorage.removeItem("nutritionPlan");
      sessionStorage.removeItem("userProfile");
      return { planData: null, country: "general", shouldRedirect: true };
    }
  } catch {
    return { planData: null, country: "general", shouldRedirect: true };
  }
};

export default function DashboardPage() {
  const router = useRouter();
  
  // Charger les données initiales de manière synchrone
  const initialData = useMemo(() => loadInitialData(), []);
  
  const [planData] = useState<CalculateResponse | null>(initialData.planData);
  const [country] = useState<Country>(initialData.country);
  const [selectedDay, setSelectedDay] = useState<DayOfMonth>(1);

  // Redirection si pas de données
  useEffect(() => {
    if (initialData.shouldRedirect) {
      router.push("/onboarding");
    }
  }, [initialData.shouldRedirect, router]);

  // Restore original sessionId if viewing an old session's menu
  useEffect(() => {
    const previousSessionId = sessionStorage.getItem("previousSessionId");
    if (previousSessionId) {
      sessionStorage.setItem("sessionId", previousSessionId);
      sessionStorage.removeItem("previousSessionId");
    }
  }, []);

  const isReady = planData !== null;

  // Fetch weekly menu from API
  const {
    data: monthlyMenuData,
    isLoading,
    isError,
    error,
  } = useMonthlyMenu(isReady ? planData?.portions || null : null, country);

  const regenerateDayMutation = useRegenerateMonthDay();
  const regenerateMonthMutation = useRegenerateMonthlyMenu();

  const currentDayMeals = monthlyMenuData?.monthlyMenu[selectedDay] || [];


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSwapFood = async (mealType: MealType, foodId: string) => {
    if (!planData?.portions) return;

    try {
      await regenerateDayMutation.mutateAsync({
        day: selectedDay,
        portions: planData.portions,
        region: country,
      });
      toast.success(`Jour ${selectedDay} régénéré !`);
    } catch (error: any) {
      const errorMessage = error?.message || "Impossible de régénérer le jour";
      if (errorMessage.includes("licence") || errorMessage.includes("Aucune licence active")) {
        toast.error("Licence requise pour générer des menus", {
          description: "Activez une licence depuis votre profil",
          action: {
            label: "Activer",
            onClick: () => router.push("/dashboard/profile"),
          },
        });
      } else {
        toast.error(errorMessage);
      }
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
      toast.success(`Jour ${selectedDay} régénéré !`);
    } catch (error: any) {
      const errorMessage = error?.message || "Impossible de régénérer le jour";
      if (errorMessage.includes("licence") || errorMessage.includes("Aucune licence active")) {
        toast.error("Licence requise pour générer des menus", {
          description: "Activez une licence depuis votre profil",
          action: {
            label: "Activer",
            onClick: () => router.push("/dashboard/profile"),
          },
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleRegenerateMonth = async () => {
    if (!planData?.portions) return;

    try {
      await regenerateMonthMutation.mutateAsync({
        portions: planData.portions,
        region: country,
      });
      toast.success("Menu du mois régénéré !");
    } catch (error: any) {
      const errorMessage = error?.message || "Impossible de régénérer le mois";
      if (errorMessage.includes("licence") || errorMessage.includes("Aucune licence active")) {
        toast.error("Licence requise pour générer des menus", {
          description: "Activez une licence depuis votre profil",
          action: {
            label: "Activer",
            onClick: () => router.push("/dashboard/profile"),
          },
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleBack = useCallback(() => {
    router.push("/onboarding");
  }, [router]);

  const handleExportPDF = useCallback(() => {
    router.push("/dashboard/export");
  }, [router]);

  const handleProgress = useCallback(() => {
    router.push("/dashboard/progress");
  }, [router]);

  const handleProfile = useCallback(() => {
    router.push("/dashboard/profile");
  }, [router]);

  // Check if error is a license error
  const isLicenseError = error?.message?.includes("licence") ||
    error?.message?.includes("Aucune licence active");

  // Show loading while checking sessionStorage
  if (!isReady || !planData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isRegenerating =
    regenerateDayMutation.isPending || regenerateMonthMutation.isPending;

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
                Menu du mois
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfile}
              aria-label="Mon profil"
            >
              <User className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Profil</span>
            </Button>
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
              onClick={() => router.push("/new-session")}
              aria-label="Nouveau mois"
              className="text-primary border-primary/30 hover:bg-primary/10"
            >
              <CalendarPlus className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Nouveau mois</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleProgress}
              aria-label="Ma progression"
              className="text-primary border-primary/30 hover:bg-primary/10"
            >
              <TrendingUp className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Progression</span>
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
              onClick={handleRegenerateMonth}
              disabled={isLoading || isRegenerating}
              aria-label="Régénérer le mois"
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
            selectedDayLabel={`Jour ${selectedDay}`}
          />
        </section>

        {/* Day selector */}
        <section className="opacity-0 animate-fade-up stagger-1">
          <DaySelector
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            days={monthlyMenuData?.summary.daysGenerated || 30}
          />
        </section>

        {/* Meals for selected day */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground opacity-0 animate-fade-up stagger-2">
              Jour {selectedDay}
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
            <div className="text-center py-12 px-6">
              {isLicenseError ? (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mx-auto">
                    <Key className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Licence requise
                  </h3>
                  <p className="text-muted-foreground">
                    Vous devez activer une licence pour générer vos menus personnalisés
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button onClick={handleProfile} className="gap-2">
                      <Key className="w-4 h-4" />
                      Activer une licence
                    </Button>
                    <Button onClick={handleBack} variant="outline">
                      Retour
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-4">
                  <p className="text-destructive mb-4">
                    Erreur lors du chargement : {error?.message}
                  </p>
                  <Button onClick={handleRegenerateMonth} variant="outline">
                    Réessayer
                  </Button>
                </div>
              )}
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
                <Button onClick={handleRegenerateMonth} disabled={isRegenerating}>
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
