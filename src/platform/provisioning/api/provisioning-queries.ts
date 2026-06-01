import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { provisioningRepository } from "@/data/repositories/provisioning/provisioningRepository";
import { isProvisioningInProgress } from "@/domain/models/provisioning";
import { useAuth } from "@/security/auth/auth-provider";
import type { RetryProvisioningInput } from "@/platform/provisioning/schemas/provisioning.schema";

export const provisioningKeys = {
  all: ["platform", "provisioning"] as const,
  status: (tenantId: string) => [...provisioningKeys.all, "status", tenantId] as const,
  summary: (tenantId: string) => [...provisioningKeys.all, "summary", tenantId] as const,
};

function useProvisioningQueryEnabled() {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    isAuthenticated &&
    hasAnyPermission([
      "SUPER_ADMIN_PROVISIONING_MANAGE",
      "SUPER_ADMIN_ACCESS",
      "TENANT_CREATE",
    ])
  );
}

export function useProvisioningStatus(tenantId: string) {
  const enabled = useProvisioningQueryEnabled() && Boolean(tenantId);
  return useQuery({
    queryKey: provisioningKeys.status(tenantId),
    queryFn: () => provisioningRepository.getStatus(tenantId),
    enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isProvisioningInProgress(status) ? 3000 : false;
    },
  });
}

export function useRetryProvisioning(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RetryProvisioningInput) =>
      provisioningRepository.retry(tenantId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: provisioningKeys.status(tenantId) });
      qc.invalidateQueries({ queryKey: provisioningKeys.summary(tenantId) });
      qc.invalidateQueries({ queryKey: ["platform", "tenants"] });
    },
  });
}
