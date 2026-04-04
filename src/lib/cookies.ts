import Cookies from "js-cookie";

const BASE_OPTIONS = {
  expires: 30,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

const ADMIN_OPTIONS = {
  expires: 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

// ── Auth tokens ──────────────────────────────────────────

export const setUserToken = (token: string) => Cookies.set("userToken", token, BASE_OPTIONS);
export const getUserToken = () => Cookies.get("userToken");
export const removeUserToken = () => Cookies.remove("userToken");

export const setAdminToken = (token: string) => Cookies.set("adminToken", token, ADMIN_OPTIONS);
export const getAdminToken = () => Cookies.get("adminToken");
export const removeAdminToken = () => Cookies.remove("adminToken");

// ── Clear all user data ──────────────────────────────────

export const clearUserSession = () => {
  removeUserToken();
};
