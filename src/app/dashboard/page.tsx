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
import {
  useMonthlyMenu,
  useRegenerateMonthlyMenu,
} from "@/hooks/useWeeklyMenu";
import type { DayOfMonth } from "@/types";
import { removeUserToken } from "@/lib/cookies";
import {
  Sparkles,
  RefreshCw,
  Loader2,
  Calendar,
  FileDown,
  TrendingUp,
  CalendarPlus,
  User,
  Key,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfMonth>(1);

  useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      router.push("/login");
      return;
    }

    // Restore original sessionId if viewing an old session's menu
    const previousSessionId = sessionStorage.getItem("previousSessionId");
    if (previousSessionId) {
      sessionStorage.setItem("sessionId", previousSessionId);
      sessionStorage.removeItem("previousSessionId");
    }

    setIsReady(true);
  }, [router]);

  const {
    data: monthlyMenuData,
    isLoading,
    isError,
    error,
  } = useMonthlyMenu();

  const regenerateMonthMutation = useRegenerateMonthlyMenu();

  const currentDayMeals = monthlyMenuData?.monthlyMenu[selectedDay] || [];

  const handleRegenerateMonth = async () => {
    try {
      await regenerateMonthMutation.mutateAsync({});
      toast.success("Menu du mois régénéré !");
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err?.message || "Impossible de régénérer le mois");
    }
  };

  const handleLogout = useCallback(() => {
    removeUserToken();
    sessionStorage.clear();
    router.push("/login");
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

  const isLicenseError =
    error?.message?.includes("licence") || error?.message?.includes("Aucune licence active");

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isRegenerating = regenerateMonthMutation.isPending;

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
            <Button variant="ghost" size="sm" onClick={handleProfile} aria-label="Mon profil">
              <User className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Profil</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              aria-label="Se déconnecter"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Program header */}
        <section className="opacity-0 animate-fade-up">
          <WeeklyCalorieHeader
            selectedDay={selectedDay}
            totalDays={monthlyMenuData?.summary.daysGenerated}
          />
        </section>

        {/* Actions */}
        <section className="opacity-0 animate-fade-up stagger-1 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/new-session")}
            className="text-primary border-primary/30 hover:bg-primary/10"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Nouveau mois
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleProgress}
            className="text-primary border-primary/30 hover:bg-primary/10"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Progression
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="text-primary border-primary/30 hover:bg-primary/10"
          >
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateMonth}
            disabled={isLoading || isRegenerating}
            className="text-primary border-primary/30 hover:bg-primary/10"
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Régénérer le menu
          </Button>
        </section>

        {/* Day selector */}
        <section className="opacity-0 animate-fade-up stagger-1">
          <DaySelector
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            days={monthlyMenuData?.summary.daysGenerated || 28}
          />
        </section>

        {/* Meals for selected day */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground opacity-0 animate-fade-up stagger-2">
              Jour {selectedDay}
            </h2>
          </div>

          {isError && (
            <div className="text-center py-12 px-6">
              {isLicenseError ? (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mx-auto">
                    <Key className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Licence requise</h3>
                  <p className="text-muted-foreground">
                    Vous devez activer une licence pour générer vos menus personnalisés
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button onClick={handleProfile} className="gap-2">
                      <Key className="w-4 h-4" />
                      Activer une licence
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
                  className={`opacity-0 animate-fade-up stagger-${Math.min(index + 3, 5)}`}
                />
              ))}
            </div>
          ) : (
            !isError && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Aucun menu généré pour ce jour.</p>
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
              💡 Utilisez les onglets pour naviguer entre les jours du programme
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
