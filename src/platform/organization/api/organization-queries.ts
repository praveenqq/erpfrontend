import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationRepository } from "@/data/repositories/organization/organizationRepository";
import { useTenant } from "@/tenancy/context/tenant-context";

export const organizationKeys = {
  all: ["admin", "organization"] as const,
  company: (tenantId: string | null) => [...organizationKeys.all, "company", tenantId] as const,
  branches: (tenantId: string | null) => [...organizationKeys.all, "branches", tenantId] as const,
  departments: (tenantId: string | null) => [...organizationKeys.all, "departments", tenantId] as const,
};

export function useOrganizationCompany() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: organizationKeys.company(tenantId),
    queryFn: () => organizationRepository.getCompany(tenantId),
    enabled: Boolean(tenantId),
  });
}

export function useOrganizationBranches() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: organizationKeys.branches(tenantId),
    queryFn: () => organizationRepository.listBranches(tenantId),
    enabled: Boolean(tenantId),
  });
}

export function useOrganizationDepartments() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: organizationKeys.departments(tenantId),
    queryFn: () => organizationRepository.listDepartments(tenantId),
    enabled: Boolean(tenantId),
  });
}

export function useUpdateOrganizationCompany() {
  const { tenantId } = useTenant();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => organizationRepository.updateCompany(name, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: organizationKeys.all }),
  });
}

export function useCreateBranch() {
  const { tenantId } = useTenant();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { code: string; name: string }) =>
      organizationRepository.createBranch(input, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: organizationKeys.branches(tenantId) }),
  });
}

export function useCreateDepartment() {
  const { tenantId } = useTenant();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { code: string; name: string }) =>
      organizationRepository.createDepartment(input, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: organizationKeys.departments(tenantId) }),
  });
}
