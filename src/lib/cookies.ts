import Cookies from "js-cookie";

// Cookie options
const COOKIE_OPTIONS = {
  expires: 30, // 30 days for user tokens
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

const ADMIN_COOKIE_OPTIONS = {
  expires: 7, // 7 days for admin tokens
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

// User token management
export const setUserToken = (token: string) => {
  Cookies.set("userToken", token, COOKIE_OPTIONS);
};

export const getUserToken = (): string | undefined => {
  return Cookies.get("userToken");
};

export const removeUserToken = () => {
  Cookies.remove("userToken");
};

// Admin token management
export const setAdminToken = (token: string) => {
  Cookies.set("adminToken", token, ADMIN_COOKIE_OPTIONS);
};

export const getAdminToken = (): string | undefined => {
  return Cookies.get("adminToken");
};

export const removeAdminToken = () => {
  Cookies.remove("adminToken");
};
