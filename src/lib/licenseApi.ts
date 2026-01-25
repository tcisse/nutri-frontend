import api from "./api";
import adminApi from "./adminApi";

/**
 * Activate a license for a user
 */
export async function activateLicenseApi(userId: string, code: string) {
  const response = await api.post(`/users/${userId}/license/activate`, { code });
  return response.data.data;
}

/**
 * Get user's active license information
 */
export async function getUserLicenseApi(userId: string) {
  const response = await api.get(`/users/${userId}/license`);
  return response.data.data;
}

/**
 * Admin: Get all licenses with optional filters
 */
export async function getAdminLicensesApi(filters?: {
  type?: string;
  isActive?: string;
  search?: string;
}) {
  const params = new URLSearchParams();

  if (filters?.type) params.append("type", filters.type);
  if (filters?.isActive) params.append("isActive", filters.isActive);
  if (filters?.search) params.append("search", filters.search);

  const queryString = params.toString();
  const url = queryString ? `/admin/licenses?${queryString}` : "/admin/licenses";

  const response = await adminApi.get(url);
  return response.data.data;
}

/**
 * Admin: Get license details by ID
 */
export async function getLicenseDetailsApi(licenseId: string) {
  const response = await adminApi.get(`/admin/licenses/${licenseId}`);
  return response.data.data;
}

/**
 * Admin: Create a new license
 */
export async function createLicenseApi(data: {
  type: "QUOTA" | "SUBSCRIPTION";
  name: string;
  description?: string;
  menuQuota?: number;
  durationDays?: number;
}) {
  const response = await adminApi.post("/admin/licenses", data);
  return response.data.data;
}

/**
 * Admin: Deactivate a license
 */
export async function deactivateLicenseApi(licenseId: string, reason?: string) {
  const response = await adminApi.post(`/admin/licenses/${licenseId}/deactivate`, { reason });
  return response.data.data;
}
