import axios from "axios";
import { getUserToken } from "./cookies";
import type {
  UserProfile,
  BackendMonthlyMenuResponse,
  MonthlyMenuResponse,
  DailyMenuData,
  MealType,
  Food,
  Meal,
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
  timeout: 30000,
});

// Request interceptor to add user token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = getUserToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
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
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/login") && !currentPath.startsWith("/onboarding")) {
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 403 && error.response?.data?.requiresLicense) {
      const message = error.response.data.error || "Aucune licence active";
      console.error("[API Error - License Required]", message);
      return Promise.reject(new Error(message));
    }

    const message = error.response?.data?.error || error.message || "Une erreur est survenue";
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

/**
 * Transforme un menu journalier backend en array de Meal frontend
 */
const transformDailyMenuToMeals = (dailyMenu: DailyMenuData, dayIndex: number): Meal[] => {
  const mealMapping: { key: keyof Omit<DailyMenuData, "jour" | "semaine" | "jourSemaine">; type: MealType }[] = [
    { key: "petit_dejeuner", type: "breakfast" },
    { key: "collation", type: "snack" },
    { key: "dejeuner", type: "lunch" },
    { key: "diner", type: "dinner" },
  ];

  return mealMapping.map(({ key, type }) => {
    const backendMeal = dailyMenu[key];

    const foods: Food[] = backendMeal.items.map((item, index) => ({
      id: `${dayIndex}-${type}-${index}`,
      name: item.aliment,
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
 * Transforme la réponse backend /api/generate-monthly-menu vers le format frontend
 */
const transformMonthlyMenuResponse = (
  backendResponse: BackendMonthlyMenuResponse
): MonthlyMenuResponse => {
  const { data } = backendResponse;
  const { monthlyMenu, summary } = data;

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
      daysGenerated: summary.daysGenerated,
      totalFoodsPerDay: summary.totalFoodsPerDay,
    },
  };
};

// ============================================
// API Functions — Menu
// ============================================

/**
 * Generate a monthly meal plan from the PDF plan
 * POST /api/generate-monthly-menu
 */
export const generateMonthlyMenu = async (days = 28, country?: string): Promise<MonthlyMenuResponse> => {
  const response = await api.post<BackendMonthlyMenuResponse>("/generate-monthly-menu", { days, country });
  return transformMonthlyMenuResponse(response.data);
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
  const response = await api.post<{ success: boolean; data: { user: UserData; token: string } }>(
    "/users",
    data
  );
  return response.data.data;
};

/**
 * Login user
 * POST /api/users/login
 */
export const loginUserApi = async (
  email: string,
  password: string
): Promise<{
  user: UserData & { sessions?: SessionData[] };
  token: string;
}> => {
  const response = await api.post<{
    success: boolean;
    data: {
      user: UserData & { sessions?: SessionData[] };
      token: string;
    };
  }>("/users/login", { email, password });
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
 * Get all sessions for a user
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
    const response = await api.get<{
      success: boolean;
      data: { id: string; sessionId: string; data: MonthlyMenuResponse; createdAt: string };
    }>(`/users/sessions/${sessionId}/menu`);
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

/**
 * Activate a license for a user
 * POST /api/users/:userId/license/activate
 */
export const activateLicenseApi = async (userId: string, code: string) => {
  const response = await api.post<{ success: boolean; data: { licenseActivation: { expiresAt: string | null; menusRemaining: number | null } } }>(
    `/users/${userId}/license/activate`,
    { code }
  );
  return response.data.data;
};

// Keep for type compatibility with existing code
export type { UserProfile };

export default api;
