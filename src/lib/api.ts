import axios from "axios";
import { getUserToken } from "./cookies";
import type {
  UserProfile,
  CalculateResponse,
  MenuResponse,
  PortionBudget,
  BackendCalorieResult,
  BackendMenuResponse,
  BackendWeeklyMenuResponse,
  GenerateMenuPayload,
  MealType,
  Food,
  Meal,
  WeeklyMenuResponse,
  DayOfWeek,
  DailyMenuData,
  BackendMonthlyMenuResponse,
  MonthlyMenuResponse,
  DayOfMonth,
  UserData,
  SessionData,
} from "@/types";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // Augmenté pour les requêtes hebdomadaires
});

// Request interceptor to add user token and logging
api.interceptors.request.use(
  (config) => {
    // Add user token to requests
    if (typeof window !== "undefined") {
      const token = getUserToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Logging (dev only)
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      // Don't redirect if already on login or onboarding page
      if (!currentPath.startsWith("/login") && !currentPath.startsWith("/onboarding")) {
        window.location.href = "/login";
      }
    }

    // Handle 403 with requiresLicense flag
    if (error.response?.status === 403 && error.response?.data?.requiresLicense) {
      const message = error.response.data.error || "Aucune licence active";
      console.error("[API Error - License Required]", message);
      return Promise.reject(new Error(message));
    }

    const message =
      error.response?.data?.error || error.message || "Une erreur est survenue";
    console.error("[API Error]", message);
    return Promise.reject(new Error(message));
  }
);

// ============================================
// Helpers pour transformer les réponses backend
// ============================================

const mealLabels: Record<MealType, string> = {
  breakfast: "Petit-déjeuner",
  snack: "Collation",
  lunch: "Déjeuner",
  dinner: "Dîner",
};

const mealIcons: Record<MealType, string> = {
  breakfast: "☀️",
  snack: "🍎",
  lunch: "🍽️",
  dinner: "🌙",
};

const daysOrder: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/**
 * Transforme la réponse backend /api/calculate vers le format frontend
 */
const transformCalorieResponse = (
  backendResponse: BackendCalorieResult
): CalculateResponse => {
  const { data } = backendResponse;
  return {
    calories: data.roundedCalories,
    portions: data.portionBudget,
    details: {
      bmr: data.bmr,
      tdee: data.tdee,
      targetCalories: data.targetCalories,
    },
    descriptions: data.descriptions,
  };
};

/**
 * Transforme un menu journalier backend en array de Meal frontend
 */
const transformDailyMenuToMeals = (dailyMenu: DailyMenuData, dayIndex: number): Meal[] => {
  const mealMapping: { key: keyof Omit<DailyMenuData, "jour">; type: MealType }[] = [
    { key: "petit_dejeuner", type: "breakfast" },
    { key: "collation", type: "snack" },
    { key: "dejeuner", type: "lunch" },
    { key: "diner", type: "dinner" },
  ];

  return mealMapping.map(({ key, type }) => {
    const backendMeal = dailyMenu[key];

    const foods: Food[] = backendMeal.items.map((item, index) => ({
      id: `${dayIndex}-${type}-${index}-${Date.now()}`,
      name: item.aliment,
      group: item.groupe,
      portion: item.quantite,
      quantity: item.portions,
    }));

    return {
      type,
      label: mealLabels[type],
      icon: mealIcons[type],
      foods,
    };
  });
};

/**
 * Transforme la réponse backend /api/generate-menu vers le format frontend
 */
const transformMenuResponse = (
  backendResponse: BackendMenuResponse
): MenuResponse => {
  const { data } = backendResponse;
  const { menu, summary, region } = data;

  const mealMapping: { key: keyof typeof menu; type: MealType }[] = [
    { key: "petit_dejeuner", type: "breakfast" },
    { key: "collation", type: "snack" },
    { key: "dejeuner", type: "lunch" },
    { key: "diner", type: "dinner" },
  ];

  const meals: Meal[] = mealMapping.map(({ key, type }) => {
    const backendMeal = menu[key];

    const foods: Food[] = backendMeal.items.map((item, index) => ({
      id: `${type}-${index}-${Date.now()}`,
      name: item.aliment,
      group: item.groupe,
      portion: item.quantite,
      quantity: item.portions,
    }));

    return {
      type,
      label: mealLabels[type],
      icon: mealIcons[type],
      foods,
    };
  });

  return {
    meals,
    summary: {
      totalPortions: summary.total_portions,
      totalFoods: summary.nombre_aliments,
    },
    region,
  };
};

/**
 * Transforme la réponse backend /api/generate-weekly-menu vers le format frontend
 */
const transformWeeklyMenuResponse = (
  backendResponse: BackendWeeklyMenuResponse
): WeeklyMenuResponse => {
  const { data } = backendResponse;
  const { weeklyMenu, summary, region } = data;

  const transformedWeeklyMenu: Record<DayOfWeek, Meal[]> = {} as Record<DayOfWeek, Meal[]>;

  daysOrder.forEach((day, index) => {
    const dailyMenu = weeklyMenu[day];
    transformedWeeklyMenu[day] = transformDailyMenuToMeals(dailyMenu, index);
  });

  return {
    weeklyMenu: transformedWeeklyMenu,
    summary: {
      totalPortionsPerDay: summary.totalPortionsPerDay,
      totalFoodsPerDay: summary.totalFoodsPerDay,
      daysGenerated: summary.daysGenerated,
    },
    region,
  };
};

/**
 * Transforme la réponse backend /api/generate-monthly-menu vers le format frontend
 */
const transformMonthlyMenuResponse = (
  backendResponse: BackendMonthlyMenuResponse
): MonthlyMenuResponse => {
  const { data } = backendResponse;
  const { monthlyMenu, summary, region } = data;

  const transformedMonthlyMenu: Record<DayOfMonth, Meal[]> = {} as Record<DayOfMonth, Meal[]>;

  Object.entries(monthlyMenu).forEach(([day, dailyMenu]) => {
    const dayNumber = Number(day) as DayOfMonth;
    transformedMonthlyMenu[dayNumber] = transformDailyMenuToMeals(
      dailyMenu as unknown as DailyMenuData,
      dayNumber - 1
    );
  });

  return {
    monthlyMenu: transformedMonthlyMenu,
    summary: {
      totalPortionsPerDay: summary.totalPortionsPerDay,
      totalFoodsPerDay: summary.totalFoodsPerDay,
      daysGenerated: summary.daysGenerated,
    },
    region,
  };
};

// ============================================
// API Functions
// ============================================

/**
 * Calculate calories and portion budget based on user profile
 * POST /api/calculate
 */
export const calculateCalories = async (
  profile: UserProfile
): Promise<CalculateResponse> => {
  const payload: {
    age: number;
    weight: number;
    height: number;
    gender: string;
    activity: string;
    goal: string;
    rate?: string;
  } = {
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    gender: profile.gender,
    activity: profile.activity,
    goal: profile.goal,
  };

  // Ajouter rate seulement si goal != maintain
  if (profile.goal !== "maintain" && profile.rate) {
    payload.rate = profile.rate;
  }

  const response = await api.post<BackendCalorieResult>("/calculate", payload);
  return transformCalorieResponse(response.data);
};

/**
 * Generate a daily meal plan based on portion budget
 * POST /api/generate-menu
 */
export const generateMenu = async (
  portionBudget: PortionBudget,
  preferredRegion?: string
): Promise<MenuResponse> => {
  const payload: GenerateMenuPayload = {
    portionBudget,
    preferredRegion,
  };

  const response = await api.post<BackendMenuResponse>("/generate-menu", payload);
  return transformMenuResponse(response.data);
};

/**
 * Régénérer le menu journalier
 */
export const regenerateMenu = async (
  portionBudget: PortionBudget,
  preferredRegion?: string
): Promise<MenuResponse> => {
  return generateMenu(portionBudget, preferredRegion);
};

/**
 * Generate a weekly meal plan (7 days) based on portion budget
 * POST /api/generate-weekly-menu
 */
export const generateWeeklyMenu = async (
  portionBudget: PortionBudget,
  preferredRegion?: string
): Promise<WeeklyMenuResponse> => {
  const payload: GenerateMenuPayload = {
    portionBudget,
    preferredRegion,
  };

  const response = await api.post<BackendWeeklyMenuResponse>("/generate-weekly-menu", payload);
  return transformWeeklyMenuResponse(response.data);
};

/**
 * Generate a monthly meal plan based on portion budget
 * POST /api/generate-monthly-menu
 */
export const generateMonthlyMenu = async (
  portionBudget: PortionBudget,
  preferredRegion?: string,
  days?: number
): Promise<MonthlyMenuResponse> => {
  const payload: GenerateMenuPayload & { days?: number } = {
    portionBudget,
    preferredRegion,
    days,
  };

  const response = await api.post<BackendMonthlyMenuResponse>("/generate-monthly-menu", payload);
  return transformMonthlyMenuResponse(response.data);
};

/**
 * Regenerate a specific day of the weekly menu
 * POST /api/regenerate-day
 */
export const regenerateDay = async (
  day: DayOfWeek,
  portionBudget: PortionBudget,
  preferredRegion?: string
): Promise<Meal[]> => {
  const payload = {
    day,
    portionBudget,
    preferredRegion,
  };

  const response = await api.post<{
    success: boolean;
    data: {
      day: DayOfWeek;
      menu: DailyMenuData;
      region: string;
    };
  }>("/regenerate-day", payload);

  const dayIndex = daysOrder.indexOf(day);
  return transformDailyMenuToMeals(response.data.data.menu as unknown as DailyMenuData, dayIndex);
};

/**
 * Regenerate a specific day of the monthly menu
 * POST /api/regenerate-month-day
 */
export const regenerateMonthDay = async (
  day: DayOfMonth,
  portionBudget: PortionBudget,
  preferredRegion?: string
): Promise<Meal[]> => {
  const payload = {
    day,
    portionBudget,
    preferredRegion,
  };

  const response = await api.post<{
    success: boolean;
    data: {
      day: DayOfMonth;
      menu: DailyMenuData;
      region: string;
    };
  }>("/regenerate-month-day", payload);

  return transformDailyMenuToMeals(response.data.data.menu as unknown as DailyMenuData, day - 1);
};

// ============================================
// User API Functions
// ============================================

/**
 * Register a new user
 * POST /api/users
 */
export const createUserApi = async (data: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  gender: string;
  height: number;
  country: string;
}): Promise<{ user: UserData; token: string }> => {
  const response = await api.post<{ success: boolean; data: { user: UserData; token: string } }>("/users", data);
  return response.data.data;
};

/**
 * Login user
 * POST /api/users/login
 */
export const loginUserApi = async (email: string, password: string): Promise<{ user: UserData & { sessions?: Array<{ id: string; month: number; weight: number; age: number; activityLevel: string; goal: string; rate: string | null; bmr: number; tdee: number; targetCalories: number; portionBudget: string; createdAt: string }> }; token: string }> => {
  const response = await api.post<{ success: boolean; data: { user: UserData & { sessions?: Array<{ id: string; month: number; weight: number; age: number; activityLevel: string; goal: string; rate: string | null; bmr: number; tdee: number; targetCalories: number; portionBudget: string; createdAt: string }> }; token: string } }>("/users/login", { email, password });
  return response.data.data;
};

/**
 * Create a new session for a user
 * POST /api/users/:id/sessions
 */
export const createSessionApi = async (
  userId: string,
  data: {
    weight: number;
    age: number;
    activityLevel: string;
    goal: string;
    rate?: string;
  }
): Promise<SessionData> => {
  const response = await api.post<{ success: boolean; data: SessionData }>(
    `/users/${userId}/sessions`,
    data
  );
  return response.data.data;
};

/**
 * Get all sessions for a user (progression)
 * GET /api/users/:id/sessions
 */
export const getUserSessions = async (userId: string): Promise<SessionData[]> => {
  const response = await api.get<{ success: boolean; data: SessionData[] }>(
    `/users/${userId}/sessions`
  );
  return response.data.data;
};

/**
 * Get saved menu for a session
 * GET /api/users/sessions/:sessionId/menu
 */
export const getSessionMenuApi = async (sessionId: string): Promise<MonthlyMenuResponse | null> => {
  try {
    const response = await api.get<{ success: boolean; data: { id: string; sessionId: string; data: MonthlyMenuResponse; createdAt: string } }>(
      `/users/sessions/${sessionId}/menu`
    );
    return response.data.data.data;
  } catch {
    return null;
  }
};

/**
 * Save menu for a session
 * POST /api/users/sessions/:sessionId/menu
 */
export const saveMenuApi = async (sessionId: string, menuData: unknown) => {
  const response = await api.post(`/users/sessions/${sessionId}/menu`, { data: menuData });
  return response.data;
};

export default api;
