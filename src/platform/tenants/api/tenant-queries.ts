import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantRepository } from "@/data/repositories/tenants/tenantRepository";
import type { Tenant, TenantStatus } from "@/domain/models/tenant";
import type { TenantModulesSnapshot } from "@/domain/models/tenant-modules";
import { useAuth } from "@/security/auth/auth-provider";
import type {
  CreateTenantInput,
  UpdateTenantStatusInput,
} from "../schemas/tenant.schema";

export type { Tenant, TenantModulesSnapshot };

export const tenantKeys = {
  all: ["platform", "tenants"] as const,
  list: (params: { q?: string; status?: string; page?: number; size?: number }) =>
    [...tenantKeys.all, "list", params] as const,
  detail: (id: string) => [...tenantKeys.all, "detail", id] as const,
  summary: (id: string) => [...tenantKeys.all, "summary", id] as const,
  tenant360: (id: string) => [...tenantKeys.all, "360", id] as const,
  modules: (id: string) => [...tenantKeys.all, "modules", id] as const,
  statusHistory: (id: string) => [...tenantKeys.all, "status-history", id] as const,
  audit: (id: string) => [...tenantKeys.all, "audit", id] as const,
};

function useTenantReadEnabled() {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    isAuthenticated &&
    hasAnyPermission([
      "TENANT_VIEW",
      "SUPER_ADMIN_ACCESS",
      "SUPER_ADMIN_TENANT_READ",
    ])
  );
}

function useSuperAdminTenantEnabled() {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    isAuthenticated &&
    hasAnyPermission(["SUPER_ADMIN_ACCESS", "SUPER_ADMIN_TENANT_READ"])
  );
}

export function useTenants(params: {
  q?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  const enabled = useTenantReadEnabled();
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => tenantRepository.listTenants(params),
    enabled,
  });
}

export function useTenant(id: string) {
  const enabled = useTenantReadEnabled() && Boolean(id);
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => tenantRepository.getTenant(id),
    enabled,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useTenant360(id: string) {
  const enabled = useSuperAdminTenantEnabled() && Boolean(id);
  return useQuery({
    queryKey: tenantKeys.tenant360(id),
    queryFn: () => tenantRepository.getTenant360(id),
    enabled,
  });
}

export function useTenantSummary(id: string) {
  const enabled = useSuperAdminTenantEnabled() && Boolean(id);
  return useQuery({
    queryKey: tenantKeys.summary(id),
    queryFn: () => tenantRepository.getTenantSummary(id),
    enabled,
  });
}

export function useTenantModules(id: string) {
  const enabled = useSuperAdminTenantEnabled() && Boolean(id);
  return useQuery({
    queryKey: tenantKeys.modules(id),
    queryFn: () => tenantRepository.getTenantModules(id),
    enabled,
  });
}

export function useTenantStatusHistory(id: string) {
  const enabled = useSuperAdminTenantEnabled() && Boolean(id);
  return useQuery({
    queryKey: tenantKeys.statusHistory(id),
    queryFn: () => tenantRepository.getTenantStatusHistory(id),
    enabled,
  });
}

export function useTenantAuditLogs(id: string) {
  const enabled = useSuperAdminTenantEnabled() && Boolean(id);
  return useQuery({
    queryKey: tenantKeys.audit(id),
    queryFn: () => tenantRepository.getTenantAuditLogs(id),
    enabled,
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTenantInput) => tenantRepository.createTenant(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useUpdateTenantStatus(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTenantStatusInput) =>
      tenantRepository.updateTenantStatus(tenantId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.all });
      qc.invalidateQueries({ queryKey: tenantKeys.tenant360(tenantId) });
      qc.invalidateQueries({ queryKey: tenantKeys.detail(tenantId) });
      qc.invalidateQueries({ queryKey: tenantKeys.statusHistory(tenantId) });
    },
  });
}

export function useEnableTenantModule(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { moduleCode: string; reason: string; enterpriseOverride?: boolean }) =>
      tenantRepository.enableTenantModule(tenantId, input.moduleCode, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.modules(tenantId) });
      qc.invalidateQueries({ queryKey: tenantKeys.tenant360(tenantId) });
    },
  });
}

export function useDisableTenantModule(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { moduleCode: string; reason: string }) =>
      tenantRepository.disableTenantModule(tenantId, input.moduleCode, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.modules(tenantId) });
      qc.invalidateQueries({ queryKey: tenantKeys.tenant360(tenantId) });
    },
  });
}

export function useStartTenantModuleTrial(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { moduleCode: string; reason: string; trialDays?: number }) =>
      tenantRepository.startTenantModuleTrial(tenantId, input.moduleCode, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.modules(tenantId) });
      qc.invalidateQueries({ queryKey: tenantKeys.tenant360(tenantId) });
    },
  });
}

export const TENANT_STATUS_FILTERS: Array<{ id: "ALL" | TenantStatus; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "PROVISIONING", label: "Provisioning" },
  { id: "PENDING", label: "Pending" },
  { id: "SUSPENDED", label: "Suspended" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "ARCHIVED", label: "Archived" },
];
