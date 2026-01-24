"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminUserDetail, deleteAdminUser, type UserDetail } from "@/lib/adminApi";
import { ArrowLeft, Trash2, Activity, User as UserIcon, ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { MonthlyMenuResponse, DayOfMonth } from "@/types";
import { MEAL_LABELS, FOOD_GROUP_LABELS, MONTH_DAYS } from "@/types";

const COUNTRY_LABELS: Record<string, string> = {
  general: "Autre", senegal: "Sénégal", mali: "Mali", benin: "Bénin",
  togo: "Togo", ghana: "Ghana", cote_ivoire: "Côte d'Ivoire",
  cameroun: "Cameroun", guinea: "Guinée", burkina: "Burkina Faso",
  niger: "Niger", congo: "Congo", nigeria: "Nigeria",
};

const GOAL_LABELS: Record<string, string> = {
  lose: "Perte de poids",
  maintain: "Maintien",
  gain: "Prise de masse",
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    getAdminUserDetail(userId)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDelete = async () => {
    if (!confirm("Supprimer cet utilisateur et toutes ses donnees ?")) return;

    setDeleting(true);
    try {
      await deleteAdminUser(userId);
      router.push("/admin/users");
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Utilisateur non trouve
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-xl font-bold">
            {user.firstName} {user.lastName}
          </h1>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Supprimer
        </Button>
      </div>

      {/* User info */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-primary" />
          Informations personnelles
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Role</p>
            <p className="font-medium capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Genre</p>
            <p className="font-medium">{user.gender === "male" ? "Homme" : "Femme"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Taille</p>
            <p className="font-medium">{user.height} cm</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pays</p>
            <p className="font-medium">{COUNTRY_LABELS[user.country] || user.country}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Inscription</p>
            <p className="font-medium">
              {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Sessions</p>
            <p className="font-medium">{user.sessions.length} mois</p>
          </div>
        </div>
      </Card>

      {/* Weight evolution */}
      {user.sessions.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Evolution du poids
          </h3>
          <div className="space-y-3">
            {user.sessions
              .sort((a, b) => a.month - b.month)
              .map((session) => {
                const minWeight = Math.min(...user.sessions.map((s) => s.weight));
                const maxWeight = Math.max(...user.sessions.map((s) => s.weight));
                const range = maxWeight - minWeight || 1;
                const percentage = ((session.weight - minWeight) / range) * 60 + 30;

                return (
                  <div key={session.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">
                      Mois {session.month}
                    </span>
                    <div className="flex-1 bg-secondary rounded-full h-6 relative overflow-hidden">
                      <div
                        className="h-full bg-primary/80 rounded-full flex items-center justify-end pr-2"
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

      {/* Sessions history */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4">Historique des sessions</h3>
        {user.sessions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Aucune session
          </p>
        ) : (
          <div className="space-y-3">
            {user.sessions
              .sort((a, b) => b.month - a.month)
              .map((session) => {
                const isExpanded = expandedSessionId === session.id;
                const menuData = session.menu?.data as MonthlyMenuResponse | undefined;

                return (
                  <div
                    key={session.id}
                    className="p-4 rounded-lg bg-secondary/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Mois {session.month}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Poids: </span>
                        <span className="font-medium">{session.weight} kg</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Calories: </span>
                        <span className="font-medium">{Math.round(session.targetCalories)} kcal</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Objectif: </span>
                        <span className="font-medium">{GOAL_LABELS[session.goal] || session.goal}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Menu: </span>
                        <span className="font-medium">{session.menu ? "Oui" : "Non"}</span>
                      </div>
                    </div>
                    {session.menu && menuData && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                          className="w-full"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {isExpanded ? "Masquer le menu" : "Voir le menu"}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-auto" />
                          )}
                        </Button>
                        {isExpanded && (
                          <div className="mt-3 space-y-4 max-h-[500px] overflow-y-auto">
                            <div className="text-xs space-y-1 pb-2 border-b border-border/50">
                              <p>
                                <span className="text-muted-foreground">Région: </span>
                                <span className="font-medium">{menuData.region}</span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">Jours générés: </span>
                                <span className="font-medium">{menuData.summary.daysGenerated}</span>
                              </p>
                            </div>
                            <div className="space-y-3">
                              {MONTH_DAYS.slice(0, menuData.summary.daysGenerated).map((day) => {
                                const dayMenu = menuData.monthlyMenu[day as DayOfMonth];
                                if (!dayMenu) return null;

                                return (
                                  <div key={day} className="rounded-md bg-background/50 p-3 space-y-2">
                                    <h4 className="font-medium text-sm">Jour {day}</h4>
                                    {dayMenu.map((meal) => (
                                      <div key={meal.type} className="text-xs">
                                        <div className="font-medium text-muted-foreground">
                                          {meal.icon} {meal.label}
                                        </div>
                                        <ul className="ml-4 mt-1 space-y-0.5">
                                          {meal.foods.map((food) => (
                                            <li key={food.id} className="text-xs">
                                              {food.name} - {food.quantity} {food.portion}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </Card>
    </div>
  );
}
