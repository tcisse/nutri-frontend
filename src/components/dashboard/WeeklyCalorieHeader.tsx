"use client";

import { Calendar, Utensils } from "lucide-react";

const countryLabels: Record<string, string> = {
  togo: "Plan Alimentaire Togolais",
  gabon: "Plan Alimentaire Gabonais",
  cameroun: "Plan Alimentaire Camerounais",
  senegal: "Plan Alimentaire Sénégalais",
  mali: "Plan Alimentaire Malien",
  burkina: "Plan Alimentaire Burkinabè",
  benin: "Plan Alimentaire Béninois",
  cote_ivoire: "Plan Alimentaire Ivoirien",
};

interface ProgramHeaderProps {
  selectedDay: number;
  totalDays?: number;
}

export const WeeklyCalorieHeader = ({ selectedDay, totalDays = 28 }: ProgramHeaderProps) => {
  const weekNumber = Math.ceil(selectedDay / 7);
  const dayInWeek = ((selectedDay - 1) % 7) + 1;

  const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const dayName = dayNames[dayInWeek - 1];

  const country = (() => {
    if (typeof window === "undefined") return "";
    try {
      const profile = sessionStorage.getItem("userProfile");
      return profile ? JSON.parse(profile).country ?? "" : "";
    } catch {
      return "";
    }
  })();
  const planLabel = countryLabels[country] ?? "Plan Alimentaire Africain";

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-6 sm:p-8 border border-primary/10">
      {/* Program title */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Utensils className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{planLabel}</p>
          <p className="text-3xl font-bold text-foreground">Jour {selectedDay}</p>
          <p className="text-sm text-muted-foreground">
            {dayName} · Semaine {weekNumber}
          </p>
        </div>
      </div>

      {/* Program info */}
      <div className="border-t border-border/50 pt-4">
        <div className="flex items-center justify-center gap-6 text-center">
          <div className="flex flex-col items-center gap-1">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-lg font-bold text-foreground">{totalDays}</span>
            <span className="text-[10px] text-muted-foreground">Jours</span>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">🍽️</span>
            <span className="text-lg font-bold text-foreground">4</span>
            <span className="text-[10px] text-muted-foreground">Repas/jour</span>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">🌍</span>
            <span className="text-lg font-bold text-foreground">100%</span>
            <span className="text-[10px] text-muted-foreground">Africain</span>
          </div>
        </div>
      </div>
    </div>
  );
};
