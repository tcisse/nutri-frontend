export type Gender = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "extra_active";

export type Goal = "lose" | "maintain" | "gain";

export type WeightChangeRate = "0.5" | "1" | "1.5" | "2";

export type Country =
  | "general"
  | "senegal"
  | "mali"
  | "benin"
  | "togo"
  | "cote_ivoire"
  | "cameroun"
  | "guinea"
  | "burkina"
  | "niger"
  | "congo"
  | "gabon";

export interface UserProfile {
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  activity: ActivityLevel;
  goal: Goal;
  rate?: WeightChangeRate;
  country: Country;
}

// ============================================
// Types pour les repas (PDF-based)
// ============================================

export type MealType = "breakfast" | "snack" | "lunch" | "dinner";

export interface Food {
  id: string;
  name: string; // Description complète: "130g plantain bouilli"
}

export interface Meal {
  type: MealType;
  label: string;
  icon: string;
  foods: Food[];
}

// Réponse brute du backend pour un item de repas
export interface BackendMealItem {
  aliment: string;
}

// Réponse brute du backend pour un repas formaté
export interface BackendMealFormatted {
  name: string;
  items: BackendMealItem[];
}

// Structure d'un jour dans la réponse backend
export interface DailyMenuData {
  jour: string;
  semaine?: string;
  jourSemaine?: string;
  petit_dejeuner: BackendMealFormatted;
  dejeuner: BackendMealFormatted;
  diner: BackendMealFormatted;
  collation: BackendMealFormatted;
}

// ============================================
// Types pour le menu mensuel
// ============================================

export type DayOfMonth = number;

export interface BackendMonthlyMenuResponse {
  success: boolean;
  data: {
    monthlyMenu: Record<DayOfMonth, DailyMenuData>;
    summary: {
      daysGenerated: number;
      totalFoodsPerDay: number;
    };
  };
}

export interface MonthlyMenuResponse {
  monthlyMenu: Record<DayOfMonth, Meal[]>;
  summary: {
    daysGenerated: number;
    totalFoodsPerDay: number;
  };
}

// ============================================
// Types legacy (pour compatibilité hooks)
// ============================================

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const MONTH_DAYS: DayOfMonth[] = Array.from({ length: 31 }, (_, i) => i + 1);

// ============================================
// User & Session
// ============================================

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  gender: Gender;
  height: number;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionData {
  id: string;
  userId: string;
  month: number;
  weight: number;
  age: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  rate: WeightChangeRate | null;
  createdAt: string;
  menu: MenuData | null;
}

export interface MenuData {
  id: string;
  sessionId: string;
  data: unknown;
  createdAt: string;
}

export interface UserWithSession extends UserData {
  latestSession: SessionData | null;
}

// ============================================
// Onboarding
// ============================================

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 1, title: "Identité", description: "Nom, mot de passe et sexe" },
  { id: 2, title: "Mesures", description: "Poids, taille et âge" },
  { id: 3, title: "Activité", description: "Votre niveau d'activité" },
  { id: 4, title: "Objectif", description: "Votre objectif nutritionnel" },
  { id: 5, title: "Rythme", description: "Votre rythme souhaité" },
  { id: 6, title: "Pays", description: "Votre pays de résidence" },
];

// ============================================
// Labels et descriptions
// ============================================

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sédentaire",
  light: "Légèrement actif",
  moderate: "Modérément actif",
  active: "Actif",
  extra_active: "Très actif",
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: "Peu ou pas d'exercice",
  light: "Exercice léger 1-3 jours/semaine",
  moderate: "Exercice modéré 3-5 jours/semaine",
  active: "Exercice intense 6-7 jours/semaine",
  extra_active: "Exercice très intense quotidien",
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: "Perdre du poids",
  maintain: "Maintenir",
  gain: "Prendre du poids",
};

export const GOAL_DESCRIPTIONS: Record<Goal, string> = {
  lose: "Réduire la masse grasse",
  maintain: "Garder votre poids actuel",
  gain: "Augmenter la masse musculaire",
};

export const RATE_LABELS: Record<WeightChangeRate, string> = {
  "0.5": "0,5 kg/semaine",
  "1": "1 kg/semaine",
  "1.5": "1,5 kg/semaine",
  "2": "2 kg/semaine",
};

export const RATE_DESCRIPTIONS: Record<WeightChangeRate, string> = {
  "0.5": "Progression douce et durable",
  "1": "Rythme recommandé",
  "1.5": "Progression rapide",
  "2": "Progression intensive",
};

export const COUNTRY_LABELS: Record<Country, string> = {
  general: "Autre",
  senegal: "Sénégal",
  mali: "Mali",
  benin: "Bénin",
  togo: "Togo",
  cote_ivoire: "Côte d'Ivoire",
  cameroun: "Cameroun",
  guinea: "Guinée",
  burkina: "Burkina Faso",
  niger: "Niger",
  congo: "Congo",
  gabon: "Gabon",
};

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Petit-déjeuner",
  snack: "Collation",
  lunch: "Déjeuner",
  dinner: "Dîner",
};

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: "☀️",
  snack: "🍎",
  lunch: "🍽️",
  dinner: "🌙",
};
