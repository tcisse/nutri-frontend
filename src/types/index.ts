// User profile for onboarding
export type Gender = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "extra_active"; // Corrigé: était "very_active"

export type Goal = "lose" | "maintain" | "gain";

// Rythme de perte/prise de poids (kg par semaine)
export type WeightChangeRate = "0.5" | "1" | "1.5" | "2";

// Pays supportés par le backend
export type Country =
  | "general"
  | "senegal"
  | "mali"
  | "benin"
  | "togo"
  | "ghana"
  | "cote_ivoire"
  | "cameroun" // Corrigé: était "cameroon"
  | "guinea"
  | "burkina"
  | "niger"
  | "congo"
  | "nigeria";

export interface UserProfile {
  gender: Gender;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  activity: ActivityLevel;
  goal: Goal;
  rate?: WeightChangeRate; // Rythme de perte/prise (requis si goal != maintain)
  country: Country; // Note: non envoyé à /calculate, utilisé pour /generate-menu
}

// ============================================
// Types correspondant exactement au Backend
// ============================================

export interface PortionBudget {
  starch: number;
  fruit: number;
  milk: number;
  veg: number;
  protein: number;
  fat: number;
}

// Réponse brute du backend pour /api/calculate
export interface BackendCalorieResult {
  success: boolean;
  data: {
    bmr: number;
    tdee: number;
    targetCalories: number;
    roundedCalories: number;
    portionBudget: PortionBudget;
    descriptions: {
      activity: string;
      goal: string;
    };
  };
}

// Réponse transformée pour le frontend
export interface CalculateResponse {
  calories: number;
  portions: PortionBudget;
  details: {
    bmr: number;
    tdee: number;
    targetCalories: number;
  };
  descriptions: {
    activity: string;
    goal: string;
  };
}

// Type Food du backend
export interface BackendFood {
  id: string;
  name: string;
  group: FoodGroup;
  portion: string;
  tags: string[];
}

// Type MealItem du backend
export interface BackendMealItem {
  aliment: string;
  groupe: FoodGroup;
  portions: number;
  quantite: string;
}

// Type Meal formaté du backend
export interface BackendMealFormatted {
  name: string;
  items: BackendMealItem[];
  resume_portions: PortionBudget;
}

// Réponse brute du backend pour /api/generate-menu
export interface BackendMenuResponse {
  success: boolean;
  data: {
    menu: {
      petit_dejeuner: BackendMealFormatted;
      dejeuner: BackendMealFormatted;
      diner: BackendMealFormatted;
      collation: BackendMealFormatted;
    };
    summary: {
      total_portions: PortionBudget;
      nombre_aliments: number;
    };
    region: string;
  };
}

// ============================================
// Types transformés pour le Frontend
// ============================================

export type FoodGroup = "starch" | "fruit" | "milk" | "veg" | "protein" | "fat";

export type MealType = "breakfast" | "snack" | "lunch" | "dinner";

export interface Food {
  id: string;
  name: string;
  group: FoodGroup;
  portion: string;
  quantity: number;
}

export interface Meal {
  type: MealType;
  label: string;
  icon: string;
  foods: Food[];
}

export interface MenuResponse {
  meals: Meal[];
  summary: {
    totalPortions: PortionBudget;
    totalFoods: number;
  };
  region: string;
}

// Payload pour /api/generate-menu
export interface GenerateMenuPayload {
  portionBudget: PortionBudget;
  preferredRegion?: string;
}

// ============================================
// Types pour le menu hebdomadaire
// ============================================

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface DailyMenuData {
  jour: string;
  petit_dejeuner: BackendMealFormatted;
  dejeuner: BackendMealFormatted;
  diner: BackendMealFormatted;
  collation: BackendMealFormatted;
}

// Réponse brute du backend pour /api/generate-weekly-menu
export interface BackendWeeklyMenuResponse {
  success: boolean;
  data: {
    weeklyMenu: Record<DayOfWeek, DailyMenuData>;
    summary: {
      totalPortionsPerDay: PortionBudget;
      totalFoodsPerDay: number;
      daysGenerated: number;
    };
    region: string;
  };
}

// Type transformé pour le frontend
export interface WeeklyMenuResponse {
  weeklyMenu: Record<DayOfWeek, Meal[]>;
  summary: {
    totalPortionsPerDay: PortionBudget;
    totalFoodsPerDay: number;
    daysGenerated: number;
  };
  region: string;
}

// ============================================
// Types pour le menu mensuel
// ============================================

export type DayOfMonth = number; // Validé côté backend (1-31)

export interface BackendMonthlyMenuResponse {
  success: boolean;
  data: {
    monthlyMenu: Record<DayOfMonth, DailyMenuData>;
    summary: {
      totalPortionsPerDay: PortionBudget;
      totalFoodsPerDay: number;
      daysGenerated: number;
    };
    region: string;
  };
}

export interface MonthlyMenuResponse {
  monthlyMenu: Record<DayOfMonth, Meal[]>;
  summary: {
    totalPortionsPerDay: PortionBudget;
    totalFoodsPerDay: number;
    daysGenerated: number;
  };
  region: string;
}

// Labels des jours
export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mer",
  thursday: "Jeu",
  friday: "Ven",
  saturday: "Sam",
  sunday: "Dim",
};

export const DAYS_ORDER: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const MONTH_DAYS: DayOfMonth[] = Array.from({ length: 31 }, (_, i) => i + 1);

// ============================================
// Onboarding
// ============================================

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 1, title: "Genre", description: "Sélectionnez votre genre" },
  { id: 2, title: "Profil", description: "Vos informations physiques" },
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
  extra_active: "Très actif", // Corrigé: était "very_active"
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: "Peu ou pas d'exercice",
  light: "Exercice léger 1-3 jours/semaine",
  moderate: "Exercice modéré 3-5 jours/semaine",
  active: "Exercice intense 6-7 jours/semaine",
  extra_active: "Exercice très intense quotidien", // Corrigé
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

// Labels et descriptions pour le rythme de perte/prise
// 1 kg de graisse ≈ 7700 kcal
export const RATE_LABELS: Record<WeightChangeRate, string> = {
  "0.5": "0,5 kg/semaine",
  "1": "1 kg/semaine",
  "1.5": "1,5 kg/semaine",
  "2": "2 kg/semaine",
};

export const RATE_KCAL_PER_DAY: Record<WeightChangeRate, number> = {
  "0.5": Math.round((0.5 * 7700) / 7), // ~550 kcal/jour
  "1": Math.round((1 * 7700) / 7),     // ~1100 kcal/jour
  "1.5": Math.round((1.5 * 7700) / 7), // ~1650 kcal/jour
  "2": Math.round((2 * 7700) / 7),     // ~2200 kcal/jour
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
  ghana: "Ghana",
  cote_ivoire: "Côte d'Ivoire",
  cameroun: "Cameroun", // Corrigé
  guinea: "Guinée",
  burkina: "Burkina Faso",
  niger: "Niger",
  congo: "Congo",
  nigeria: "Nigeria",
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

export const FOOD_GROUP_LABELS: Record<FoodGroup, string> = {
  starch: "Féculents",
  fruit: "Fruits",
  milk: "Produits laitiers",
  veg: "Légumes",
  protein: "Protéines",
  fat: "Matières grasses",
};

export const FOOD_GROUP_COLORS: Record<FoodGroup, string> = {
  starch: "bg-amber-100 text-amber-800",
  fruit: "bg-rose-100 text-rose-800",
  milk: "bg-blue-100 text-blue-800",
  veg: "bg-emerald-100 text-emerald-800",
  protein: "bg-red-100 text-red-800",
  fat: "bg-yellow-100 text-yellow-800",
};
