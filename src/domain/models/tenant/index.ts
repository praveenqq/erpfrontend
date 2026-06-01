import {
  asRecord,
  parseNumber,
  parseOptionalString,
  parseString,
} from "../common";
import {
  parseSubscription,
  type Subscription,
} from "../subscription";

export type TenantStatus =
  | "PENDING"
  | "PROVISIONING"
  | "ACTIVE"
  | "SUSPENDED"
  | "CANCELLED"
  | "ARCHIVED";

export type TenantSetupStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "FAILED"
  | "COMPLETED";

export interface Tenant {
  id: string;
  legalName: string;
  displayName: string;
  slug: string;
  code?: string;
  status: TenantStatus | string;
  type?: string;
  setupStatus?: TenantSetupStatus | string;
  primaryRegion?: string;
  countryCode?: string;
  defaultCurrency?: string;
  defaultTimezone?: string;
  defaultLocale?: string;
  industry?: string;
  companySize?: string;
  ownerUserId?: string;
  billingCustomerId?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  supportTier?: string;
  statusReason?: string;
  trialStartsAt?: string;
  trialEndsAt?: string;
  activatedAt?: string;
  suspendedAt?: string;
  cancelledAt?: string;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface TenantSummary {
  tenantId: string;
  legalName: string;
  displayName: string;
  slug: string;
  status?: string;
  type?: string;
  planCode?: string;
  subscriptionStatus?: string;
  enabledModuleCount: number;
  enabledModules: string[];
  createdAt?: string;
  healthStatus?: string;
}

export interface TenantSetupProgress {
  setupProgressPercent: number;
  minimumSetupComplete: boolean;
  completedSteps: string[];
  pendingSteps: string[];
  blockingSteps: string[];
}

export interface Tenant360Snapshot {
  tenantId: string;
  legalName: string;
  displayName: string;
  slug: string;
  status: TenantStatus | string;
  setupStatus: TenantSetupStatus | string;
  summary: TenantSummary;
  currentSubscription: Subscription | null;
  setupProgress: TenantSetupProgress;
  recentAuditLogs: TenantAuditEntry[];
}

export interface TenantStatusHistoryEntry {
  id: string;
  oldStatus?: string;
  newStatus: string;
  actorUserId?: string;
  reason?: string;
  createdAt: string;
}

export interface TenantModulesSnapshot {
  tenantId: string;
  enabledModules: string[];
}

export interface TenantAuditEntry {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}

export function parseTenant(raw: unknown): Tenant {
  const r = asRecord(raw);
  return {
    id: parseString(r.id),
    legalName: parseString(r.legalName),
    displayName: parseString(r.displayName),
    slug: parseString(r.slug),
    code: parseOptionalString(r.code),
    status: parseString(r.status, "PENDING"),
    type: parseOptionalString(r.type),
    setupStatus: parseOptionalString(r.setupStatus),
    primaryRegion: parseOptionalString(r.primaryRegion),
    countryCode: parseOptionalString(r.countryCode),
    defaultCurrency: parseOptionalString(r.defaultCurrency),
    defaultTimezone: parseOptionalString(r.defaultTimezone),
    defaultLocale: parseOptionalString(r.defaultLocale),
    industry: parseOptionalString(r.industry),
    companySize: parseOptionalString(r.companySize),
    ownerUserId: parseOptionalString(r.ownerUserId),
    billingCustomerId: parseOptionalString(r.billingCustomerId),
    primaryContactName: parseOptionalString(r.primaryContactName),
    primaryContactEmail: parseOptionalString(r.primaryContactEmail),
    primaryContactPhone: parseOptionalString(r.primaryContactPhone),
    supportTier: parseOptionalString(r.supportTier),
    statusReason: parseOptionalString(r.statusReason),
    trialStartsAt: parseOptionalString(r.trialStartsAt),
    trialEndsAt: parseOptionalString(r.trialEndsAt),
    activatedAt: parseOptionalString(r.activatedAt),
    suspendedAt: parseOptionalString(r.suspendedAt),
    cancelledAt: parseOptionalString(r.cancelledAt),
    archivedAt: parseOptionalString(r.archivedAt),
    createdAt: parseOptionalString(r.createdAt),
    updatedAt: parseOptionalString(r.updatedAt),
    version: typeof r.version === "number" ? r.version : undefined,
  };
}

export function parseTenantSummary(raw: unknown): TenantSummary {
  const r = asRecord(raw);
  return {
    tenantId: parseString(r.tenantId ?? r.id),
    legalName: parseString(r.legalName),
    displayName: parseString(r.displayName),
    slug: parseString(r.slug),
    status: parseOptionalString(r.status),
    type: parseOptionalString(r.type),
    planCode: parseOptionalString(r.planCode),
    subscriptionStatus: parseOptionalString(r.subscriptionStatus),
    enabledModuleCount: parseNumber(r.enabledModuleCount),
    enabledModules: Array.isArray(r.enabledModules)
      ? r.enabledModules.map((item) => String(item))
      : [],
    createdAt: parseOptionalString(r.createdAt),
    healthStatus: parseOptionalString(r.healthStatus),
  };
}

export function parseTenantSetupProgress(raw: unknown): TenantSetupProgress {
  const r = asRecord(raw);
  return {
    setupProgressPercent: parseNumber(r.setupProgressPercent),
    minimumSetupComplete: r.minimumSetupComplete === true,
    completedSteps: Array.isArray(r.completedSteps)
      ? r.completedSteps.map((item) => String(item))
      : [],
    pendingSteps: Array.isArray(r.pendingSteps)
      ? r.pendingSteps.map((item) => String(item))
      : [],
    blockingSteps: Array.isArray(r.blockingSteps)
      ? r.blockingSteps.map((item) => String(item))
      : [],
  };
}

export function parseTenantAuditEntry(raw: unknown): TenantAuditEntry {
  const r = asRecord(raw);
  return {
    id: parseString(r.id),
    tenantId: parseString(r.tenantId),
    userId: parseOptionalString(r.userId),
    action: parseString(r.action),
    entityType: parseOptionalString(r.entityType),
    entityId: parseOptionalString(r.entityId),
    details: parseOptionalString(r.details),
    createdAt: parseString(r.createdAt),
  };
}

export function parseTenant360(raw: unknown): Tenant360Snapshot {
  const r = asRecord(raw);
  const subscriptionRaw = r.currentSubscription;
  return {
    tenantId: parseString(r.tenantId),
    legalName: parseString(r.legalName),
    displayName: parseString(r.displayName),
    slug: parseString(r.slug),
    status: parseString(r.status, "PENDING"),
    setupStatus: parseString(r.setupStatus, "NOT_STARTED"),
    summary: parseTenantSummary(r.summary ?? {}),
    currentSubscription: subscriptionRaw ? parseSubscription(subscriptionRaw) : null,
    setupProgress: parseTenantSetupProgress(r.setupProgress ?? {}),
    recentAuditLogs: Array.isArray(r.recentAuditLogs)
      ? r.recentAuditLogs.map(parseTenantAuditEntry)
      : [],
  };
}

export function parseTenantStatusHistoryEntry(raw: unknown): TenantStatusHistoryEntry {
  const r = asRecord(raw);
  return {
    id: parseString(r.id),
    oldStatus: parseOptionalString(r.oldStatus),
    newStatus: parseString(r.newStatus),
    actorUserId: parseOptionalString(r.actorUserId),
    reason: parseOptionalString(r.reason),
    createdAt: parseString(r.createdAt),
  };
}

export function parseTenantModules(raw: unknown): TenantModulesSnapshot {
  const r = asRecord(raw);
  return {
    tenantId: parseString(r.tenantId),
    enabledModules: Array.isArray(r.enabledModules)
      ? r.enabledModules.map((item) => String(item))
      : [],
  };
}

export function formatTenantTimestamp(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatTenantStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function tenantStatusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "PROVISIONING":
    case "PENDING":
      return "secondary" as const;
    case "SUSPENDED":
      return "warning" as const;
    case "CANCELLED":
    case "ARCHIVED":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export function healthStatusVariant(health?: string) {
  switch (health?.toUpperCase()) {
    case "HEALTHY":
      return "success" as const;
    case "DEGRADED":
    case "AT_RISK":
      return "warning" as const;
    case "UNHEALTHY":
    case "CRITICAL":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}
