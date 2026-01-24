import axios from "axios";
import { getAdminToken, removeAdminToken } from "./cookies";

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

// Add token to requests
adminApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      removeAdminToken();
      localStorage.removeItem("adminUser");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface AdminStats {
  totalUsers: number;
  activeThisMonth: number;
  totalMenus: number;
  usersByCountry: { country: string; count: number }[];
  usersByGoal: { goal: string; count: number }[];
}

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  gender: string;
  height: number;
  country: string;
  createdAt: string;
  lastSession: {
    month: number;
    weight: number;
    goal: string;
    createdAt: string;
  } | null;
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  gender: string;
  height: number;
  country: string;
  createdAt: string;
  sessions: {
    id: string;
    month: number;
    weight: number;
    age: number;
    activityLevel: string;
    goal: string;
    rate: string | null;
    bmr: number;
    tdee: number;
    targetCalories: number;
    portionBudget: Record<string, number>;
    createdAt: string;
    menu: { id: string; data: unknown; createdAt: string } | null;
  }[];
}

export const adminLogin = async (email: string, password: string) => {
  const response = await adminApi.post<{
    success: boolean;
    data: { token: string; admin: AdminUser };
  }>("/admin/login", { email, password });
  return response.data.data;
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await adminApi.get<{ success: boolean; data: AdminStats }>("/admin/stats");
  return response.data.data;
};

export const getAdminUsers = async (
  page: number = 1,
  search?: string
): Promise<UserListResponse> => {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  const response = await adminApi.get<{ success: boolean; data: UserListResponse }>(
    `/admin/users?${params}`
  );
  return response.data.data;
};

export const getAdminUserDetail = async (id: string): Promise<UserDetail> => {
  const response = await adminApi.get<{ success: boolean; data: UserDetail }>(
    `/admin/users/${id}`
  );
  return response.data.data;
};

export const deleteAdminUser = async (id: string) => {
  await adminApi.delete(`/admin/users/${id}`);
};

export default adminApi;
