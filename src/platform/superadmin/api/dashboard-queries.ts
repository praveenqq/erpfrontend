import { useQuery } from "@tanstack/react-query";
import { dashboardRepository } from "@/data/repositories/superadmin/dashboardRepository";
import type { PlatformDashboardSnapshot } from "@/domain/models/workspace";

export const superAdminKeys = {
  dashboard: ["super-admin", "dashboard"] as const,
};

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: superAdminKeys.dashboard,
    queryFn: (): Promise<PlatformDashboardSnapshot> =>
      dashboardRepository.getPlatformDashboard(),
  });
}
