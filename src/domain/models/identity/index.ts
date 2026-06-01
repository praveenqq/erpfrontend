import { asRecord, parseOptionalString, parseString } from "../common";

export type UserStatus = "ACTIVE" | "INACTIVE" | string;

export interface TenantUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantUserDetail {
  user: TenantUser;
  roleCodes: string[];
  companyIds: string[];
  branchIds: string[];
  departmentIds: string[];
  tenantMembershipActive: boolean;
}

export interface TenantRole {
  id: string;
  code: string;
  name: string;
}

export interface TenantRoleDetail {
  role: TenantRole;
  permissionCodes: string[];
}

export interface PermissionDefinition {
  id: string;
  code: string;
  description?: string;
}

export function parseTenantUser(raw: unknown): TenantUser {
  const r = asRecord(raw);
  return {
    id: parseString(r.id),
    email: parseString(r.email),
    firstName: parseOptionalString(r.firstName),
    lastName: parseOptionalString(r.lastName),
    status: parseString(r.status, "ACTIVE"),
    createdAt: parseOptionalString(r.createdAt),
    updatedAt: parseOptionalString(r.updatedAt),
  };
}

export function parseTenantUserDetail(raw: unknown): TenantUserDetail {
  const r = asRecord(raw);
  return {
    user: parseTenantUser(r.user ?? r),
    roleCodes: Array.isArray(r.roleCodes) ? r.roleCodes.map(String) : [],
    companyIds: Array.isArray(r.companyIds) ? r.companyIds.map(String) : [],
    branchIds: Array.isArray(r.branchIds) ? r.branchIds.map(String) : [],
    departmentIds: Array.isArray(r.departmentIds) ? r.departmentIds.map(String) : [],
    tenantMembershipActive: r.tenantMembershipActive === true,
  };
}

export function parseTenantRole(raw: unknown): TenantRole {
  const r = asRecord(raw);
  return {
    id: parseString(r.id),
    code: parseString(r.code),
    name: parseString(r.name),
  };
}

export function parseTenantRoleDetail(raw: unknown): TenantRoleDetail {
  const r = asRecord(raw);
  return {
    role: parseTenantRole(r.role ?? r),
    permissionCodes: Array.isArray(r.permissionCodes) ? r.permissionCodes.map(String) : [],
  };
}

export function parsePermissionDefinition(raw: unknown): PermissionDefinition {
  const r = asRecord(raw);
  return {
    id: parseString(r.id),
    code: parseString(r.code),
    description: parseOptionalString(r.description),
  };
}

export function formatUserName(user: TenantUser): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email;
}

export function userStatusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "INACTIVE":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}
