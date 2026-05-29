import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import { extractApiData } from "@/domain/models/common";
import type { PlatformDashboardSnapshot } from "@/domain/models/workspace";
import { apiFetch } from "@/lib/api/client";

export const dashboardRemoteDataSource = {
  async getPlatformDashboard(): Promise<PlatformDashboardSnapshot> {
    const response = await apiFetch<PlatformDashboardSnapshot>(
      API_ENDPOINTS.SUPER_ADMIN.DASHBOARD,
    );
    return extractApiData(response);
  },
};
