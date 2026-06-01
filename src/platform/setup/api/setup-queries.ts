import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setupRepository } from "@/data/repositories/setup/setupRepository";
import type { TenantSetupStepCode } from "@/domain/models/setup";
import { navigationKeys } from "@/platform/moduleaccess/api/navigation-queries";
import { useAuth } from "@/security/auth/auth-provider";
import { useTenant } from "@/tenancy/context/tenant-context";

export const setupKeys = {
  all: ["admin", "tenant", "setup"] as const,
  progress: (tenantId: string | null) => [...setupKeys.all, "progress", tenantId] as const,
};

function useSetupQueryEnabled(tenantId: string | null) {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    Boolean(tenantId) &&
    isAuthenticated &&
    hasAnyPermission(["TENANT_VIEW", "SUPER_ADMIN_ACCESS"])
  );
}

export function useSetupProgress() {
  const { tenantId } = useTenant();
  const enabled = useSetupQueryEnabled(tenantId);
  return useQuery({
    queryKey: setupKeys.progress(tenantId),
    queryFn: () => setupRepository.getProgress(tenantId),
    enabled,
  });
}

export function useCompleteSetupStep() {
  const { tenantId } = useTenant();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (step: TenantSetupStepCode) =>
      setupRepository.completeStep(step, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: setupKeys.all });
      qc.invalidateQueries({ queryKey: navigationKeys.navigation });
    },
  });
}
