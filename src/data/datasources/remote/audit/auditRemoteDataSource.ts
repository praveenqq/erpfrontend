import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import type { PageResponse } from "@/common/types/api";
import { extractApiData } from "@/domain/models/common";
import {
  parseAuditPage,
  parseSuperAdminAuditEntry,
  parseTenantAuditEntry,
  type SuperAdminAuditEntry,
  type TenantAuditEntry,
} from "@/domain/models/audit";
import { apiFetch } from "@/lib/api/client";

export const auditRemoteDataSource = {
  async searchSuperAdminAudit(params: {
    tenantId?: string;
    actionType?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<SuperAdminAuditEntry>> {
    const search = new URLSearchParams();
    if (params.tenantId) search.set("tenantId", params.tenantId);
    if (params.actionType) search.set("actionType", params.actionType);
    search.set("page", String(params.page ?? 0));
    search.set("size", String(params.size ?? 50));
    const response = await apiFetch<unknown>(`${API_ENDPOINTS.SUPER_ADMIN.AUDIT}?${search}`);
    return parseAuditPage(extractApiData(response), parseSuperAdminAuditEntry);
  },

  async getTenantAudit(
    tenantId: string,
    page = 0,
    size = 50,
  ): Promise<PageResponse<TenantAuditEntry>> {
    const response = await apiFetch<unknown>(
      `${API_ENDPOINTS.SUPER_ADMIN.AUDIT_TENANT(tenantId)}?page=${page}&size=${size}`,
    );
    return parseAuditPage(extractApiData(response), parseTenantAuditEntry);
  },
};
