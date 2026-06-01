import { asRecord, parseOptionalString, parseString } from "@/domain/models/common";
import type { PageResponse } from "@/common/types/api";

export interface SuperAdminAuditEntry {
  id: string;
  actorUserId: string;
  actionType: string;
  targetTenantId?: string | null;
  reason?: string | null;
  createdAt: string;
}

export interface TenantAuditEntry {
  id: string;
  tenantId: string;
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  details?: string | null;
  createdAt: string;
}

export function parseSuperAdminAuditEntry(value: unknown): SuperAdminAuditEntry {
  const record = asRecord(value);
  return {
    id: parseString(record.id),
    actorUserId: parseString(record.actorUserId),
    actionType: parseString(record.actionType),
    targetTenantId: parseOptionalString(record.targetTenantId),
    reason: parseOptionalString(record.reason),
    createdAt: parseString(record.createdAt),
  };
}

export function parseTenantAuditEntry(value: unknown): TenantAuditEntry {
  const record = asRecord(value);
  return {
    id: parseString(record.id),
    tenantId: parseString(record.tenantId),
    userId: parseOptionalString(record.userId),
    action: parseString(record.action),
    entityType: parseOptionalString(record.entityType),
    entityId: parseOptionalString(record.entityId),
    details: parseOptionalString(record.details),
    createdAt: parseString(record.createdAt),
  };
}

export function parseAuditPage<T>(
  raw: unknown,
  parser: (value: unknown) => T,
): PageResponse<T> {
  const record = asRecord(raw);
  const content = Array.isArray(record.content) ? record.content.map(parser) : [];
  return {
    content,
    page: typeof record.page === "number" ? record.page : 0,
    size: typeof record.size === "number" ? record.size : content.length,
    totalElements: typeof record.totalElements === "number" ? record.totalElements : content.length,
    totalPages: typeof record.totalPages === "number" ? record.totalPages : 1,
  };
}
