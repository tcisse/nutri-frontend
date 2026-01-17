"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWeeklyMenu } from "@/hooks/useWeeklyMenu";
import type { CalculateResponse, Country, DayOfWeek, Meal } from "@/types";
import { DAY_LABELS, MEAL_LABELS, FOOD_GROUP_LABELS, DAYS_ORDER } from "@/types";
import { Sparkles, ArrowLeft, Loader2, Download, FileText, Printer } from "lucide-react";

export default function ExportPage() {
  const router = useRouter();
  const [planData, setPlanData] = useState<CalculateResponse | null>(null);
  const [country, setCountry] = useState<Country>("general");
  const [isReady, setIsReady] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

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
      
      if (parsed.calories && parsed.portions) {
        setPlanData(parsed as CalculateResponse);
        setIsReady(true);
      } else {
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
        // Ignore
      }
    }
  }, [router]);

  // Fetch weekly menu
  const {
    data: weeklyMenuData,
    isLoading,
    isError,
  } = useWeeklyMenu(isReady ? planData?.portions || null : null, country);

  const handleBack = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Loading state
  if (!isReady || !planData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const portionItems = [
    { key: "starch" as const, label: "Féculents", emoji: "🍚" },
    { key: "protein" as const, label: "Protéines", emoji: "🍗" },
    { key: "veg" as const, label: "Légumes", emoji: "🥬" },
    { key: "fruit" as const, label: "Fruits", emoji: "🍎" },
    { key: "milk" as const, label: "Laitiers", emoji: "🥛" },
    { key: "fat" as const, label: "Graisses", emoji: "🫒" },
  ];

  return (
    <>
      {/* Styles pour l'impression */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
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
        {/* Header - caché à l'impression */}
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

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              aria-label="Retour au dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>
          </div>
        </header>

        {/* Bouton d'export - caché à l'impression */}
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
                <Button variant="outline" onClick={handleBack}>Retour</Button>
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
              💡 Dans la fenêtre d&apos;impression, sélectionnez &quot;Enregistrer en PDF&quot; comme destination
            </p>
          </div>
        </div>

        {/* Contenu imprimable */}
        {weeklyMenuData && (
          <div id="print-content" ref={printRef} className="max-w-4xl mx-auto px-4 py-8 print:p-4">
            {/* En-tête du PDF */}
            <div className="text-center mb-8 pb-6 border-b-2 border-primary">
              <h1 className="text-3xl font-bold text-primary mb-2">🥗 NutriPlan</h1>
              <p className="text-muted-foreground">
                Votre plan alimentaire personnalisé pour la semaine
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Généré le {new Date().toLocaleDateString("fr-FR")}
              </p>
            </div>

            {/* Objectif calorique */}
            <div className="bg-green-50 rounded-xl p-6 mb-8 print:bg-green-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Objectif quotidien</p>
                  <p className="text-4xl font-bold text-primary">
                    {planData.calories} <span className="text-lg">Kcal/jour</span>
                  </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {portionItems.map((item) => (
                    <div key={item.key} className="text-center p-2 bg-white rounded-lg">
                      <span className="text-lg">{item.emoji}</span>
                      <p className="font-bold">{planData.portions[item.key]}</p>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu de la semaine */}
            <div className="space-y-6">
              {DAYS_ORDER.map((day, dayIndex) => {
                const meals = weeklyMenuData.weeklyMenu[day];
                
                return (
                  <div 
                    key={day} 
                    className={`${dayIndex === 4 ? 'print-break' : ''}`}
                  >
                    <h2 className="text-xl font-bold text-primary bg-green-50 px-4 py-2 rounded-lg mb-4">
                      {DAY_LABELS[day]}
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {meals.map((meal) => (
                        <div
                          key={meal.type}
                          className="border rounded-xl p-4 bg-gray-50"
                        >
                          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                            <span>{meal.icon}</span>
                            {MEAL_LABELS[meal.type]}
                          </h3>
                          <ul className="space-y-2">
                            {meal.foods.map((food, idx) => (
                              <li
                                key={idx}
                                className="flex justify-between items-center text-sm border-b border-gray-200 pb-1"
                              >
                                <span>
                                  <strong>{food.quantity}x</strong> {food.name}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {food.portion}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conseils */}
            <div className="mt-8 p-6 bg-amber-50 rounded-xl print:bg-amber-50">
              <h3 className="font-bold text-amber-800 mb-3">💡 Conseils</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Buvez au moins 1,5L d&apos;eau par jour</li>
                <li>• Prenez vos repas à heures régulières</li>
                <li>• Privilégiez les aliments frais et de saison</li>
                <li>• N&apos;hésitez pas à adapter les quantités selon votre faim</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
              NutriPlan © 2026 • Mangez équilibré, vivez mieux
            </div>
          </div>
        )}

        {/* Footer - caché à l'impression */}
        <footer className="no-print py-8 px-4 text-center border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            © 2026 NutriPlan • Mangez équilibré, vivez mieux
          </p>
        </footer>
      </div>
    </>
  );
}
