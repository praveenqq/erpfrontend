import { parseOptionalString, parseString } from "../common";

export type TenantStatus =
  | "PENDING"
  | "ACTIVE"
  | "SUSPENDED"
  | "CANCELLED"
  | "ARCHIVED";

export interface Tenant {
  id: string;
  legalName: string;
  displayName: string;
  slug: string;
  code?: string;
  status: TenantStatus | string;
  primaryContactEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function parseTenant(raw: unknown): Tenant {
  const r = raw as Record<string, unknown>;
  return {
    id: parseString(r.id),
    legalName: parseString(r.legalName),
    displayName: parseString(r.displayName),
    slug: parseString(r.slug),
    code: parseOptionalString(r.code),
    status: parseString(r.status, "PENDING"),
    primaryContactEmail: parseOptionalString(r.primaryContactEmail),
    createdAt: parseOptionalString(r.createdAt),
    updatedAt: parseOptionalString(r.updatedAt),
  };
}
