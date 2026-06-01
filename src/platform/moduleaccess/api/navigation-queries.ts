import { navigationRepository } from "@/data/repositories/navigation/navigationRepository";
import type { NavigationSnapshot } from "@/domain/models/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/tenancy/context/tenant-context";

export const navigationKeys = {
  navigation: ["me", "navigation"] as const,
  modules: ["me", "modules"] as const,
};

export function useNavigation() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: navigationKeys.navigation,
    queryFn: (): Promise<NavigationSnapshot> =>
      navigationRepository.getNavigation(tenantId),
    enabled: Boolean(tenantId),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
  });
}
