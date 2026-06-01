import type { Plan } from "@/domain/models/plan";
import type { SubscriptionUsage } from "@/domain/models/subscription";

export type PlanChangeDirection = "upgrade" | "downgrade" | "lateral";

export interface PlanLimitChange {
  limitCode: string;
  currentLimit: number;
  targetLimit: number;
  currentUsage?: number;
  delta: number;
}

export interface PlanChangeImpact {
  direction: PlanChangeDirection;
  currentPlan: Plan;
  targetPlan: Plan;
  modulesAdded: string[];
  modulesRemoved: string[];
  modulesRetained: string[];
  limitChanges: PlanLimitChange[];
}

function planModuleSet(plan: Plan): Set<string> {
  return new Set(plan.modules);
}

function resolveDirection(currentPlan: Plan, targetPlan: Plan): PlanChangeDirection {
  const currentPrice = currentPlan.priceAmount ?? 0;
  const targetPrice = targetPlan.priceAmount ?? 0;
  if (targetPrice > currentPrice) return "upgrade";
  if (targetPrice < currentPrice) return "downgrade";
  return "lateral";
}

function limitMap(plan: Plan): Map<string, number> {
  return new Map(plan.limits.map((limit) => [limit.limitCode, limit.limitValue]));
}

export function buildPlanChangeImpact(
  currentPlan: Plan,
  targetPlan: Plan,
  usage: SubscriptionUsage[] = [],
): PlanChangeImpact {
  const currentModules = planModuleSet(currentPlan);
  const targetModules = planModuleSet(targetPlan);

  const modulesAdded = targetPlan.modules.filter((module) => !currentModules.has(module));
  const modulesRemoved = currentPlan.modules.filter((module) => !targetModules.has(module));
  const modulesRetained = currentPlan.modules.filter((module) => targetModules.has(module));

  const currentLimits = limitMap(currentPlan);
  const targetLimits = limitMap(targetPlan);
  const usageMap = new Map(usage.map((item) => [item.counterCode, item.currentValue]));

  const limitCodes = new Set([...currentLimits.keys(), ...targetLimits.keys()]);
  const limitChanges = [...limitCodes].map((limitCode) => {
    const currentLimit = currentLimits.get(limitCode) ?? 0;
    const targetLimit = targetLimits.get(limitCode) ?? 0;
    return {
      limitCode,
      currentLimit,
      targetLimit,
      currentUsage: usageMap.get(limitCode),
      delta: targetLimit - currentLimit,
    };
  });

  return {
    direction: resolveDirection(currentPlan, targetPlan),
    currentPlan,
    targetPlan,
    modulesAdded,
    modulesRemoved,
    modulesRetained,
    limitChanges,
  };
}

export function findPlanByCode(plans: Plan[], code: string): Plan | undefined {
  return plans.find((plan) => plan.code === code);
}

export function formatPlanChangeDirection(direction: PlanChangeDirection): string {
  if (direction === "upgrade") return "Upgrade";
  if (direction === "downgrade") return "Downgrade";
  return "Plan change";
}
