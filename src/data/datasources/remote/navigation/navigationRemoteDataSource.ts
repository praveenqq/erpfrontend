import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import { extractApiData } from "@/domain/models/common";
import {
  parseNavigationSnapshot,
  type NavigationSnapshot,
} from "@/domain/models/navigation";
import { apiFetch } from "@/lib/api/client";

export const navigationRemoteDataSource = {
  async getNavigation(tenantId: string | null): Promise<NavigationSnapshot> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ME.NAVIGATION, {
      tenantId,
    });
    return parseNavigationSnapshot(extractApiData(response));
  },
};
