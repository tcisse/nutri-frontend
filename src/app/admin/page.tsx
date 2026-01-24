"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getAdminStats, type AdminStats } from "@/lib/adminApi";
import { Users, Activity, FileText, Globe } from "lucide-react";

const COUNTRY_LABELS: Record<string, string> = {
  general: "Autre",
  senegal: "Sénégal",
  mali: "Mali",
  benin: "Bénin",
  togo: "Togo",
  ghana: "Ghana",
  cote_ivoire: "Côte d'Ivoire",
  cameroun: "Cameroun",
  guinea: "Guinée",
  burkina: "Burkina Faso",
  niger: "Niger",
  congo: "Congo",
  nigeria: "Nigeria",
};

const GOAL_LABELS: Record<string, string> = {
  lose: "Perte de poids",
  maintain: "Maintien",
  gain: "Prise de masse",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Erreur de chargement des statistiques
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Utilisateurs inscrits</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeThisMonth}</p>
              <p className="text-xs text-muted-foreground">Actifs ce mois</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalMenus}</p>
              <p className="text-xs text-muted-foreground">Menus generees</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Distribution charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By country */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Par pays
          </h3>
          <div className="space-y-2">
            {stats.usersByCountry.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnee</p>
            ) : (
              stats.usersByCountry
                .sort((a, b) => b.count - a.count)
                .map((item) => (
                  <div key={item.country} className="flex items-center justify-between">
                    <span className="text-sm">{COUNTRY_LABELS[item.country] || item.country}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))
            )}
          </div>
        </Card>

        {/* By goal */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Par objectif
          </h3>
          <div className="space-y-2">
            {stats.usersByGoal.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnee</p>
            ) : (
              stats.usersByGoal
                .sort((a, b) => b.count - a.count)
                .map((item) => (
                  <div key={item.goal} className="flex items-center justify-between">
                    <span className="text-sm">{GOAL_LABELS[item.goal] || item.goal}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
