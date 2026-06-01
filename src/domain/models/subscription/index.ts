import { asRecord, parseNumber, parseOptionalString, parseString } from "@/domain/models/common";

export type SubscriptionStatus =
  | "DRAFT"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "GRACE_PERIOD"
  | "PAYMENT_FAILED"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED"
  | "ENDED"
  | "PENDING_ACTIVATION"
  | "PENDING_PLAN_CHANGE";

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialStart?: string | null;
  trialEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  renewalAt?: string | null;
  planCode?: string | null;
  planName?: string | null;
  priceAmount?: number | null;
  currency?: string | null;
  paymentProvider?: string | null;
  current: boolean;
}

export interface SubscriptionEntitlement {
  tenantId: string;
  moduleCode: string;
  status: string;
}

export interface SubscriptionUsage {
  counterCode: string;
  currentValue: number;
  limitValue: number;
  periodKey: string;
}

export interface SubscriptionAddon {
  id: string;
  addonCode: string;
  name: string;
  moduleCode?: string;
  quantity: number;
  status: string;
}

export function parseSubscriptionAddon(value: unknown): SubscriptionAddon {
  const record = asRecord(value);
  return {
    id: parseString(record.id),
    addonCode: parseString(record.addonCode),
    name: parseString(record.name),
    moduleCode: parseOptionalString(record.moduleCode),
    quantity: typeof record.quantity === "number" ? record.quantity : 1,
    status: parseString(record.status, "ACTIVE"),
  };
}

export interface SubscriptionHistoryEntry {
  id: string;
  eventType: string;
  actorUserId?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  createdAt: string;
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNumber?: string | null;
  totalAmount?: number | null;
  currency?: string | null;
  status?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
}

export interface SubscriptionPayment {
  id: string;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  paidAt?: string | null;
  failedReason?: string | null;
}

export interface TenantBillingSnapshot {
  subscription?: Subscription | null;
  invoices: SubscriptionInvoice[];
  payments: SubscriptionPayment[];
}

export interface SubscriptionDirectoryRow {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  tenantType?: string | null;
  subscription: Subscription | null;
}

export interface TenantPlanOption {
  planId: string;
  planCode: string;
  planName: string;
  priceAmount?: number | null;
  currency?: string | null;
  modules: string[];
  current: boolean;
  selectable: boolean;
}

export function parseSubscription(value: unknown): Subscription {
  const record = asRecord(value);
  return {
    id: parseString(record.id),
    tenantId: parseString(record.tenantId),
    planId: parseString(record.planId),
    status: parseString(record.status, "DRAFT") as SubscriptionStatus,
    billingCycle: parseOptionalString(record.billingCycle),
    currentPeriodStart: parseOptionalString(record.currentPeriodStart),
    currentPeriodEnd: parseOptionalString(record.currentPeriodEnd),
    trialStart: parseOptionalString(record.trialStart),
    trialEnd: parseOptionalString(record.trialEnd),
    cancelAtPeriodEnd: record.cancelAtPeriodEnd === true,
    renewalAt: parseOptionalString(record.renewalAt),
    planCode: parseOptionalString(record.planCode),
    planName: parseOptionalString(record.planName),
    priceAmount:
      typeof record.priceAmount === "number" ? record.priceAmount : undefined,
    currency: parseOptionalString(record.currency),
    paymentProvider: parseOptionalString(record.paymentProvider),
    current: record.current !== false,
  };
}

export function parseSubscriptionEntitlement(value: unknown): SubscriptionEntitlement {
  const record = asRecord(value);
  return {
    tenantId: parseString(record.tenantId),
    moduleCode: parseString(record.moduleCode),
    status: parseString(record.status),
  };
}

export function parseSubscriptionUsage(value: unknown): SubscriptionUsage {
  const record = asRecord(value);
  return {
    counterCode: parseString(record.counterCode),
    currentValue: parseNumber(record.currentValue),
    limitValue: parseNumber(record.limitValue),
    periodKey: parseString(record.periodKey),
  };
}

export function parseSubscriptionHistoryEntry(value: unknown): SubscriptionHistoryEntry {
  const record = asRecord(value);
  return {
    id: parseString(record.id),
    eventType: parseString(record.eventType),
    actorUserId: parseOptionalString(record.actorUserId),
    oldValue: parseOptionalString(record.oldValue),
    newValue: parseOptionalString(record.newValue),
    reason: parseOptionalString(record.reason),
    createdAt: parseString(record.createdAt),
  };
}

export function subscriptionAllowsAccess(status: SubscriptionStatus): boolean {
  return status === "TRIALING" || status === "ACTIVE" || status === "GRACE_PERIOD" || status === "PAST_DUE";
}

export function formatSubscriptionStatus(status: SubscriptionStatus): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSubscriptionTimestamp(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatSubscriptionPrice(subscription: Subscription): string {
  if (subscription.priceAmount == null || !subscription.currency) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: subscription.currency,
  }).format(subscription.priceAmount);
}

export function formatPlanPrice(plan: TenantPlanOption): string {
  if (plan.priceAmount == null || !plan.currency) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: plan.currency,
  }).format(plan.priceAmount);
}

export function entitlementGrantsAccess(status: string): boolean {
  return status === "ENABLED" || status === "TRIAL" || status === "GRACE_PERIOD";
}

export function parseTenantPlanOption(value: unknown): TenantPlanOption {
  const record = asRecord(value);
  return {
    planId: parseString(record.planId),
    planCode: parseString(record.planCode),
    planName: parseString(record.planName),
    priceAmount:
      typeof record.priceAmount === "number" ? record.priceAmount : undefined,
    currency: parseOptionalString(record.currency),
    modules: Array.isArray(record.modules)
      ? record.modules.map((module) => String(module))
      : [],
    current: record.current === true,
    selectable: record.selectable !== false,
  };
}
