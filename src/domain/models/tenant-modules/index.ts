import { asRecord, parseOptionalString, parseString } from "@/domain/models/common";

export interface TenantModuleAccess {
  moduleCode: string;
  canAccess: boolean;
  reasonCode?: string;
  reasonMessage?: string;
  entitlementStatus: string;
  accessMode: string;
  source?: string;
  missingDependencies: string[];
}

export interface TenantModulesSnapshot {
  tenantId: string;
  enabledModules: string[];
  modules: TenantModuleAccess[];
}

export function parseTenantModuleAccess(raw: unknown): TenantModuleAccess {
  const r = asRecord(raw);
  return {
    moduleCode: parseString(r.moduleCode),
    canAccess: r.canAccess === true,
    reasonCode: parseOptionalString(r.reasonCode),
    reasonMessage: parseOptionalString(r.reasonMessage),
    entitlementStatus: parseString(r.entitlementStatus ?? "DISABLED"),
    accessMode: parseString(r.accessMode ?? "NO_ACCESS"),
    source: parseOptionalString(r.source),
    missingDependencies: Array.isArray(r.missingDependencies)
      ? r.missingDependencies.map((item) => String(item))
      : [],
  };
}

export function parseTenantModules(raw: unknown): TenantModulesSnapshot {
  const r = asRecord(raw);
  const modules = Array.isArray(r.modules)
    ? r.modules.map(parseTenantModuleAccess)
    : [];
  const enabledModules = Array.isArray(r.enabledModules)
    ? r.enabledModules.map((item) => String(item))
    : modules.filter((item) => item.canAccess).map((item) => item.moduleCode);

  return {
    tenantId: parseString(r.tenantId),
    enabledModules,
    modules,
  };
}

export function formatModuleEntitlementStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function moduleEntitlementVariant(status: string) {
  switch (status) {
    case "ENABLED":
    case "TRIALING":
      return "success" as const;
    case "PENDING_ACTIVATION":
    case "PENDING_DEACTIVATION":
      return "warning" as const;
    case "DISABLED":
    case "SUSPENDED":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function isModuleEntitled(access: TenantModuleAccess): boolean {
  return access.entitlementStatus === "ENABLED" || access.entitlementStatus === "TRIALING";
}
