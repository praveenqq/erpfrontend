import { useQuery } from "@tanstack/react-query";
import { moduleRegistryRepository } from "@/data/repositories/moduleaccess/moduleRegistryRepository";
import type { ModuleRegistryEntry } from "@/domain/models/module-registry";
import { useAuth } from "@/security/auth/auth-provider";

export const moduleRegistryKeys = {
  all: ["super-admin", "module-registry"] as const,
  list: () => [...moduleRegistryKeys.all, "list"] as const,
};

export function useModuleRegistry() {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  const enabled =
    isAuthenticated &&
    hasAnyPermission(["SUPER_ADMIN_MODULE_MANAGE", "SUPER_ADMIN_ACCESS"]);

  return useQuery({
    queryKey: moduleRegistryKeys.list(),
    queryFn: (): Promise<ModuleRegistryEntry[]> => moduleRegistryRepository.listRegistry(),
    enabled,
    staleTime: 60_000,
  });
}
