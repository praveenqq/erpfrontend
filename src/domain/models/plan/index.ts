import { asRecord, parseNumber, parseOptionalString, parseString } from "@/domain/models/common";

export type PlanStatus = "DRAFT" | "ACTIVE" | "DEPRECATED" | "ARCHIVED";
export type PlanVisibility = "PUBLIC" | "PRIVATE" | "INTERNAL";
export type PlanType = "STANDARD" | "TRIAL" | "ENTERPRISE" | "CUSTOM";
export type PlanBillingCycle = "MONTHLY" | "QUARTERLY" | "YEARLY" | "TRIAL" | "CUSTOM";

export interface PlanLimit {
  limitCode: string;
  limitValue: number;
  limitType: string;
  enforcementType: string;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  description?: string;
  visibility: PlanVisibility;
  status: PlanStatus;
  planType: PlanType;
  isPublic: boolean;
  isCustom: boolean;
  trialDays?: number | null;
  currentVersion: number;
  createdAt?: string;
  updatedAt?: string;
  priceAmount?: number | null;
  currency?: string | null;
  billingCycle?: PlanBillingCycle | null;
  modules: string[];
  limits: PlanLimit[];
}

function parseLimit(value: unknown): PlanLimit {
  const record = asRecord(value);
  return {
    limitCode: parseString(record.limitCode),
    limitValue: parseNumber(record.limitValue),
    limitType: parseString(record.limitType, "COUNT"),
    enforcementType: parseString(record.enforcementType, "HARD_LIMIT"),
  };
}

export function parsePlan(value: unknown): Plan {
  const record = asRecord(value);
  const modules = Array.isArray(record.modules)
    ? record.modules.filter((item): item is string => typeof item === "string")
    : [];
  const limits = Array.isArray(record.limits) ? record.limits.map(parseLimit) : [];

  return {
    id: parseString(record.id),
    code: parseString(record.code),
    name: parseString(record.name),
    description: parseOptionalString(record.description),
    visibility: parseString(record.visibility, "PUBLIC") as PlanVisibility,
    status: parseString(record.status, "DRAFT") as PlanStatus,
    planType: parseString(record.planType, "STANDARD") as PlanType,
    isPublic: record.isPublic === true,
    isCustom: record.isCustom === true,
    trialDays:
      typeof record.trialDays === "number"
        ? record.trialDays
        : record.trialDays === null
          ? null
          : undefined,
    currentVersion: parseNumber(record.currentVersion, 1),
    createdAt: parseOptionalString(record.createdAt),
    updatedAt: parseOptionalString(record.updatedAt),
    priceAmount:
      typeof record.priceAmount === "number"
        ? record.priceAmount
        : record.priceAmount === null
          ? null
          : undefined,
    currency: parseOptionalString(record.currency),
    billingCycle: parseOptionalString(record.billingCycle) as PlanBillingCycle | undefined,
    modules,
    limits,
  };
}

export function formatPlanStatus(status: PlanStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatPlanVisibility(visibility: PlanVisibility): string {
  return visibility.charAt(0) + visibility.slice(1).toLowerCase();
}

export function formatBillingCycle(cycle?: PlanBillingCycle | null): string {
  if (!cycle) return "Not configured";
  return cycle.charAt(0) + cycle.slice(1).toLowerCase();
}

export function formatPlanPrice(plan: Plan): string {
  if (plan.priceAmount == null || !plan.currency) return "Not configured";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: plan.currency,
  }).format(plan.priceAmount);
}
