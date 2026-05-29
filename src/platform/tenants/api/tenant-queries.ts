import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantRepository } from "@/data/repositories/tenants/tenantRepository";
import type { Tenant } from "@/domain/models/tenant";
import type { CreateTenantInput } from "../schemas/tenant.schema";

export type { Tenant };

export const tenantKeys = {
  all: ["platform", "tenants"] as const,
  list: (params: { q?: string; status?: string; page?: number }) =>
    [...tenantKeys.all, "list", params] as const,
  detail: (id: string) => [...tenantKeys.all, "detail", id] as const,
};

export function useTenants(params: {
  q?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => tenantRepository.listTenants(params),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => tenantRepository.getTenant(id),
    enabled: Boolean(id),
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTenantInput) =>
      tenantRepository.createTenant(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}
