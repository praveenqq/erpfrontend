import { useQuery } from "@tanstack/react-query";
import { auditRepository } from "@/data/repositories/audit/auditRepository";
import { useAuth } from "@/security/auth/auth-provider";

export const auditKeys = {
  all: ["platform", "audit"] as const,
  superAdmin: (filters: {
    tenantId?: string;
    actionType?: string;
    page?: number;
    size?: number;
  }) => [...auditKeys.all, "super-admin", filters] as const,
  tenant: (tenantId: string, page: number) =>
    [...auditKeys.all, "tenant", tenantId, page] as const,
};

function useAuditEnabled() {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    isAuthenticated &&
    hasAnyPermission(["SUPER_ADMIN_AUDIT_READ", "SUPER_ADMIN_ACCESS", "TENANT_VIEW"])
  );
}

export function useSuperAdminAudit(filters: {
  tenantId?: string;
  actionType?: string;
  page?: number;
  size?: number;
}) {
  const enabled = useAuditEnabled();
  return useQuery({
    queryKey: auditKeys.superAdmin(filters),
    queryFn: () => auditRepository.searchSuperAdminAudit(filters),
    enabled,
  });
}

export function useTenantAuditLog(tenantId: string, page = 0) {
  const enabled = useAuditEnabled() && Boolean(tenantId);
  return useQuery({
    queryKey: auditKeys.tenant(tenantId, page),
    queryFn: () => auditRepository.getTenantAudit(tenantId, page),
    enabled,
  });
}
