import { parseOptionalString, parseString } from "../common";

export interface MeProfile {
  userId: string;
  tenantId: string | null;
  companyId: string | null;
  permissions: string[];
  roles: string[];
}

export function parseMeProfile(raw: unknown): MeProfile {
  const r = raw as Record<string, unknown>;
  const permissions = Array.isArray(r.permissions)
    ? r.permissions.filter((item): item is string => typeof item === "string")
    : [];
  const roles = Array.isArray(r.roles)
    ? r.roles.filter((item): item is string => typeof item === "string")
    : [];
  return {
    userId: parseString(r.userId),
    tenantId: parseOptionalString(r.tenantId) ?? null,
    companyId: parseOptionalString(r.companyId) ?? null,
    permissions,
    roles,
  };
}
