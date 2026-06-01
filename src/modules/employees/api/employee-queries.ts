import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeRepository } from "@/data/repositories/employees/employeeRepository";
import type { Employee } from "@/domain/models/employee";
import { navigationKeys } from "@/platform/moduleaccess/api/navigation-queries";
import { useAuth } from "@/security/auth/auth-provider";
import { useTenant } from "@/tenancy/context/tenant-context";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "@/data/datasources/remote/employees/employeeRemoteDataSource";

export const employeeKeys = {
  all: ["modules", "employees"] as const,
  list: (tenantId: string | null) => [...employeeKeys.all, "list", tenantId] as const,
  detail: (id: string) => [...employeeKeys.all, "detail", id] as const,
};

function useEmployeeQueryEnabled() {
  const { tenantId } = useTenant();
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    Boolean(tenantId) &&
    isAuthenticated &&
    hasAnyPermission(["EMPLOYEE_VIEW", "EMPLOYEE_MANAGE", "SUPER_ADMIN_ACCESS"])
  );
}

export function useEmployees() {
  const { tenantId } = useTenant();
  const enabled = useEmployeeQueryEnabled();
  return useQuery({
    queryKey: employeeKeys.list(tenantId),
    queryFn: (): Promise<Employee[]> => employeeRepository.list(tenantId),
    enabled,
  });
}

export function useEmployee(id: string) {
  const { tenantId } = useTenant();
  const enabled = useEmployeeQueryEnabled() && Boolean(id);
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: (): Promise<Employee> => employeeRepository.getById(id, tenantId),
    enabled,
  });
}

export function useCreateEmployee() {
  const { tenantId } = useTenant();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => employeeRepository.create(input, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.all });
      qc.invalidateQueries({ queryKey: navigationKeys.navigation });
    },
  });
}

export function useUpdateEmployee(id: string) {
  const { tenantId } = useTenant();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateEmployeeInput) => employeeRepository.update(id, input, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.all });
      qc.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}
