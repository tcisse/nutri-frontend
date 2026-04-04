"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { getAdminStats, type AdminStats } from "@/lib/adminApi";
import { Users, Activity, FileText, Globe } from "lucide-react";

const UsersChart = dynamic(
  () => import("@/components/admin/AdminCharts").then((m) => m.UsersChart),
  { ssr: false }
);
const MenusChart = dynamic(
  () => import("@/components/admin/AdminCharts").then((m) => m.MenusChart),
  { ssr: false }
);
const CountryChart = dynamic(
  () => import("@/components/admin/AdminCharts").then((m) => m.CountryChart),
  { ssr: false }
);

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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI cards */}
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
              <p className="text-xs text-muted-foreground">Menus générés</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Evolution charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-blue-500" />
            Nouveaux utilisateurs — 30 jours
          </h3>
          <UsersChart stats={stats} />
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-purple-500" />
            Menus générés — 30 jours
          </h3>
          <MenusChart stats={stats} />
        </Card>
      </div>

      {/* Country + Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-green-500" />
            Utilisateurs par pays
          </h3>
          <CountryChart stats={stats} />
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-primary" />
            Par objectif
          </h3>
          <div className="space-y-3 pt-2">
            {stats.usersByGoal
              .sort((a, b) => b.count - a.count)
              .map((item) => {
                const max = Math.max(...stats.usersByGoal.map((g) => g.count));
                const pct = max > 0 ? (item.count / max) * 100 : 0;
                return (
                  <div key={item.goal} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{GOAL_LABELS[item.goal] ?? item.goal}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
    </div>
  );
}
