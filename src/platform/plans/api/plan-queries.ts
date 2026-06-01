import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { planRepository } from "@/data/repositories/plans/planRepository";
import type { Plan } from "@/domain/models/plan";
import { useAuth } from "@/security/auth/auth-provider";
import type {
  ConfigurePlanLimitsInput,
  ConfigurePlanModulesInput,
  CreatePlanInput,
  PlanPriceInput,
  UpdatePlanInput,
} from "@/platform/plans/schemas/plan.schema";

export const planKeys = {
  all: ["super-admin", "plans"] as const,
  list: () => [...planKeys.all, "list"] as const,
  detail: (id: string) => [...planKeys.all, "detail", id] as const,
};

function usePlanQueryEnabled() {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    isAuthenticated &&
    hasAnyPermission(["PLAN_VIEW_INTERNAL", "SUPER_ADMIN_ACCESS"])
  );
}

export function usePlans() {
  const enabled = usePlanQueryEnabled();
  return useQuery({
    queryKey: planKeys.list(),
    queryFn: (): Promise<Plan[]> => planRepository.listPlans(),
    enabled,
    staleTime: 30_000,
  });
}

export function usePlan(id: string) {
  const enabled = usePlanQueryEnabled() && Boolean(id);
  return useQuery({
    queryKey: planKeys.detail(id),
    queryFn: (): Promise<Plan> => planRepository.getPlan(id),
    enabled,
  });
}

function invalidatePlans(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.invalidateQueries({ queryKey: planKeys.list() });
  if (id) {
    queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
  }
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlanInput) => planRepository.createPlan(input),
    onSuccess: () => invalidatePlans(queryClient),
  });
}

export function useUpdatePlan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePlanInput) => planRepository.updatePlan(id, input),
    onSuccess: () => invalidatePlans(queryClient, id),
  });
}

export function usePublishPlan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => planRepository.publishPlan(id),
    onSuccess: () => invalidatePlans(queryClient, id),
  });
}

export function useDeprecatePlan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => planRepository.deprecatePlan(id, reason),
    onSuccess: () => invalidatePlans(queryClient, id),
  });
}

export function useArchivePlan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => planRepository.archivePlan(id, reason),
    onSuccess: () => invalidatePlans(queryClient, id),
  });
}

export function useCreatePlanVersion(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => planRepository.createPlanVersion(id),
    onSuccess: () => invalidatePlans(queryClient, id),
  });
}

export function useAddPlanPrice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlanPriceInput) => planRepository.addPlanPrice(id, input),
    onSuccess: () => invalidatePlans(queryClient, id),
  });
}

export function useConfigurePlanLimits(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConfigurePlanLimitsInput) =>
      planRepository.configurePlanLimits(id, input),
    onSuccess: () => invalidatePlans(queryClient, id),
  });
}

export function useConfigurePlanModules(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConfigurePlanModulesInput) =>
      planRepository.configurePlanModules(id, input),
    onSuccess: () => invalidatePlans(queryClient, id),
  });
}
