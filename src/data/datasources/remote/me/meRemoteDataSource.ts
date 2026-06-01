import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import { extractApiData } from "@/domain/models/common";
import { parseMeProfile, type MeProfile } from "@/domain/models/me";
import { apiFetch } from "@/lib/api/client";

export const meRemoteDataSource = {
  /** Bootstrap session (home tenant + DB permissions) without a tenant header. */
  async getSession(): Promise<MeProfile | null> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ME.SESSION, {
      skipAuth: false,
    });
    const data = extractApiData<unknown | null>(response);
    return data ? parseMeProfile(data) : null;
  },

  async getProfile(tenantId: string | null): Promise<MeProfile | null> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ME.PROFILE, { tenantId });
    const data = extractApiData<unknown | null>(response);
    return data ? parseMeProfile(data) : null;
  },
};
