import { useQuery } from "@tanstack/react-query";
import { planRepository } from "@/data/repositories/plans/planRepository";
import type { Plan } from "@/domain/models/plan";

export const publicPlanKeys = {
  all: ["public", "plans"] as const,
  list: () => [...publicPlanKeys.all, "list"] as const,
  compare: (codes: string[]) =>
    [...publicPlanKeys.all, "compare", ...codes.sort()] as const,
};

export function usePublicPlans() {
  return useQuery({
    queryKey: publicPlanKeys.list(),
    queryFn: (): Promise<Plan[]> => planRepository.listPublicPlans(),
    staleTime: 60_000,
  });
}

export function useComparePublicPlans(codes: string[]) {
  const normalized = codes.filter(Boolean);
  return useQuery({
    queryKey: publicPlanKeys.compare(normalized),
    queryFn: (): Promise<Plan[]> => planRepository.comparePublicPlans(normalized),
    enabled: normalized.length >= 2,
    staleTime: 60_000,
  });
}
