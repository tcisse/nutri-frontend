"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUserSessions } from "@/lib/api";
import type { SessionData, PortionBudget, Country } from "@/types";
import { ArrowLeft, TrendingDown, TrendingUp, Minus, Activity, FileText } from "lucide-react";

export default function ProgressPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Restore original sessionId if viewing an old session's menu
    const previousSessionId = sessionStorage.getItem("previousSessionId");
    if (previousSessionId) {
      sessionStorage.setItem("sessionId", previousSessionId);
      sessionStorage.removeItem("previousSessionId");
    }

    const userId = sessionStorage.getItem("userId");
    const name = sessionStorage.getItem("userName");
    if (name) setUserName(name);

    if (!userId) {
      router.push("/onboarding");
      return;
    }

    getUserSessions(userId)
      .then((data) => {
        setSessions(data.sort((a, b) => a.month - b.month));
      })
      .catch(() => {
        setSessions([]);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const getWeightDiff = () => {
    if (sessions.length < 2) return null;
    const first = sessions[0].weight;
    const last = sessions[sessions.length - 1].weight;
    return +(last - first).toFixed(1);
  };

  const weightDiff = getWeightDiff();

  const goalLabels: Record<string, string> = {
    lose: "Perte de poids",
    maintain: "Maintien",
    gain: "Prise de masse",
  };

  const handleViewMenu = (session: SessionData) => {
    // Store session data for export page
    const nutritionPlan = {
      calories: session.targetCalories,
      portions: session.portionBudget,
      details: {
        bmr: session.bmr,
        tdee: session.tdee,
        targetCalories: session.targetCalories,
      },
      descriptions: {
        activity: "",
        goal: "",
      },
    };

    // Get country from userProfile
    const storedProfile = sessionStorage.getItem("userProfile");
    let country: Country = "general";
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        country = profile.country || "general";
      } catch {
        // Ignore
      }
    }

    // Temporarily set the sessionId to this session's ID
    const currentSessionId = sessionStorage.getItem("sessionId");
    sessionStorage.setItem("previousSessionId", currentSessionId || "");
    sessionStorage.setItem("sessionId", session.id);
    sessionStorage.setItem("nutritionPlan", JSON.stringify(nutritionPlan));

    router.push("/dashboard/export");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <h1 className="font-semibold">Ma progression</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Summary cards */}
        {userName && (
          <div className="text-center">
            <h2 className="text-xl font-bold">{userName}</h2>
            <p className="text-muted-foreground text-sm">
              {sessions.length} mois de suivi
            </p>
          </div>
        )}

        {sessions.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Poids initial</p>
              <p className="text-xl font-bold">{sessions[0].weight} kg</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Poids actuel</p>
              <p className="text-xl font-bold">
                {sessions[sessions.length - 1].weight} kg
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Variation</p>
              <div className="flex items-center justify-center gap-1">
                {weightDiff !== null && (
                  <>
                    {weightDiff < 0 ? (
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    ) : weightDiff > 0 ? (
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Minus className="w-4 h-4 text-blue-600" />
                    )}
                    <p className="text-xl font-bold">
                      {weightDiff > 0 ? "+" : ""}
                      {weightDiff} kg
                    </p>
                  </>
                )}
                {weightDiff === null && (
                  <p className="text-xl font-bold text-muted-foreground">-</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Weight chart (simple bar representation) */}
        {sessions.length > 0 && (
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Evolution du poids
            </h3>
            <div className="space-y-3">
              {sessions.map((session) => {
                const minWeight = Math.min(...sessions.map((s) => s.weight));
                const maxWeight = Math.max(...sessions.map((s) => s.weight));
                const range = maxWeight - minWeight || 1;
                const percentage = ((session.weight - minWeight) / range) * 60 + 30;

                return (
                  <div key={session.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">
                      Mois {session.month}
                    </span>
                    <div className="flex-1 bg-secondary rounded-full h-6 relative overflow-hidden">
                      <div
                        className="h-full bg-primary/80 rounded-full transition-all flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs font-medium text-primary-foreground">
                          {session.weight} kg
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Session history */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Historique des sessions</h3>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Aucune session enregistrée
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">Mois {session.month}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-sm">{session.weight} kg</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(session.targetCalories)} kcal | {goalLabels[session.goal] || session.goal}
                      </p>
                    </div>
                    {session.menu && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMenu(session)}
                        className="shrink-0"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Menu
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
