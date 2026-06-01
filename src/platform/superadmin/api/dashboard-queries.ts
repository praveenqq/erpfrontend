import { useQuery } from "@tanstack/react-query";
import { dashboardRepository } from "@/data/repositories/superadmin/dashboardRepository";
import type { PlatformDashboardSnapshot } from "@/domain/models/workspace";
import { useAuth } from "@/security/auth/auth-provider";

export const superAdminKeys = {
  dashboard: ["super-admin", "dashboard"] as const,
};

export function useSuperAdminDashboard() {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  const enabled =
    isAuthenticated &&
    hasAnyPermission(["SUPER_ADMIN_ACCESS", "SUPER_ADMIN_TENANT_READ"]);

  return useQuery({
    queryKey: superAdminKeys.dashboard,
    queryFn: (): Promise<PlatformDashboardSnapshot> =>
      dashboardRepository.getPlatformDashboard(),
    enabled,
    staleTime: 30_000,
  });
}
