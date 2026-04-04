"use client";

import { Suspense, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMonthlyMenu } from "@/hooks/useWeeklyMenu";
import { useMe } from "@/hooks/useMe";
import type { DayOfMonth } from "@/types";
import { MEAL_LABELS, MONTH_DAYS } from "@/types";
import { Sparkles, ArrowLeft, Loader2, FileText, Printer } from "lucide-react";

function ExportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const printRef = useRef<HTMLDivElement>(null);

  const { sessionId: currentSessionId, userFullName, isLoading: isMeLoading } = useMe();
  const sessionIdParam = searchParams.get("sessionId");
  const sessionId = sessionIdParam ?? currentSessionId;

  const {
    data: monthlyMenuData,
    isLoading,
    isError,
  } = useMonthlyMenu(28, sessionIdParam);

  const handleBack = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (isMeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sessionId) {
    router.push("/dashboard");
    return null;
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content,
          #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="min-h-screen bg-background">
        <header className="no-print sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">NutriPlan</h1>
                <p className="text-xs text-muted-foreground">Export PDF</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleBack} aria-label="Retour au dashboard">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>
          </div>
        </header>

        <div className="no-print max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Exporter votre menu</h2>
              <p className="text-muted-foreground mt-2">
                Cliquez sur le bouton ci-dessous pour imprimer ou sauvegarder en PDF
              </p>
            </div>

            {isLoading ? (
              <Button size="lg" disabled className="h-14 px-8">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Chargement du menu...
              </Button>
            ) : isError ? (
              <div className="space-y-4">
                <p className="text-destructive">Erreur lors du chargement</p>
                <Button variant="outline" onClick={handleBack}>
                  Retour
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handlePrint}
                className="h-14 px-8 shadow-lg shadow-primary/20"
              >
                <Printer className="w-5 h-5 mr-2" />
                Imprimer / Sauvegarder en PDF
              </Button>
            )}

            <p className="text-sm text-muted-foreground">
              💡 Dans la fenêtre d&apos;impression, sélectionnez &quot;Enregistrer en PDF&quot;
              comme destination
            </p>
          </div>
        </div>

        {monthlyMenuData && (
          <div id="print-content" ref={printRef} className="max-w-4xl mx-auto px-4 py-8 print:p-4">
            <div className="text-center mb-8 pb-6 border-b-2 border-primary">
              <h1 className="text-3xl font-bold text-primary mb-2">🥗 NutriPlan</h1>
              {userFullName && (
                <p className="text-lg font-semibold text-foreground mb-1">{userFullName}</p>
              )}
              <p className="text-muted-foreground">Plan Alimentaire Togolais — 28 jours</p>
              <p className="text-sm text-muted-foreground mt-1">
                Généré le {new Date().toLocaleDateString("fr-FR")}
              </p>
            </div>

            <div className="space-y-6">
              {MONTH_DAYS.filter((day) => day <= (monthlyMenuData.summary.daysGenerated || 28)).map(
                (day, dayIndex) => {
                  const meals = monthlyMenuData.monthlyMenu[day as DayOfMonth];
                  if (!meals) return null;

                  return (
                    <div
                      key={`day-${day}`}
                      className={`${dayIndex > 0 && dayIndex % 5 === 4 ? "print-break" : ""}`}
                    >
                      <h2 className="text-xl font-bold text-primary bg-green-50 px-4 py-2 rounded-lg mb-4">
                        Jour {day}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {meals.map((meal) => (
                          <div key={meal.type} className="border rounded-xl p-4 bg-gray-50">
                            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                              <span>{meal.icon}</span>
                              {MEAL_LABELS[meal.type]}
                            </h3>
                            <ul className="space-y-1">
                              {meal.foods.map((food, idx) => (
                                <li key={idx} className="text-sm border-b border-gray-200 pb-1">
                                  {food.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="mt-8 p-6 bg-amber-50 rounded-xl print:bg-amber-50">
              <h3 className="font-bold text-amber-800 mb-3">💡 Conseils</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Buvez au moins 1,5L d&apos;eau par jour</li>
                <li>• Prenez vos repas à heures régulières</li>
                <li>• Privilégiez les aliments frais et de saison</li>
                <li>• N&apos;hésitez pas à adapter les quantités selon votre faim</li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
              NutriPlan © 2026 • Mangez équilibré, vivez mieux
            </div>
          </div>
        )}

        <footer className="no-print py-8 px-4 text-center border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            © 2026 NutriPlan • Mangez équilibré, vivez mieux
          </p>
        </footer>
      </div>
    </>
  );
}

export default function ExportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ExportContent />
    </Suspense>
  );
}
