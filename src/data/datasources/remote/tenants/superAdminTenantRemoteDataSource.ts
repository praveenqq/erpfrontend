import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import type { PageResponse } from "@/common/types/api";
import { extractApiData } from "@/domain/models/common";
import {
  parseTenant,
  parseTenant360,
  parseTenantAuditEntry,
  parseTenantStatusHistoryEntry,
  parseTenantSummary,
  type Tenant,
  type Tenant360Snapshot,
  type TenantAuditEntry,
  type TenantStatusHistoryEntry,
  type TenantSummary,
} from "@/domain/models/tenant";
import {
  parseTenantModules,
  type TenantModulesSnapshot,
} from "@/domain/models/tenant-modules";
import { apiFetch } from "@/lib/api/client";
import type { UpdateTenantStatusInput } from "@/platform/tenants/schemas/tenant.schema";

export const superAdminTenantRemoteDataSource = {
  async get360(tenantId: string): Promise<Tenant360Snapshot> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.TENANT_360(tenantId));
    return parseTenant360(extractApiData(response));
  },

  async getSummary(tenantId: string): Promise<TenantSummary> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.TENANT_SUMMARY(tenantId));
    return parseTenantSummary(extractApiData(response));
  },

  async getById(tenantId: string): Promise<Tenant> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.TENANT(tenantId));
    return parseTenant(extractApiData(response));
  },

  async updateStatus(tenantId: string, input: UpdateTenantStatusInput): Promise<Tenant> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.TENANT_STATUS(tenantId), {
      method: "PATCH",
      body: input,
    });
    return parseTenant(extractApiData(response));
  },

  async getStatusHistory(
    tenantId: string,
    page = 0,
    size = 20,
  ): Promise<PageResponse<TenantStatusHistoryEntry>> {
    const response = await apiFetch<PageResponse<unknown>>(
      `${API_ENDPOINTS.SUPER_ADMIN.TENANT_STATUS_HISTORY(tenantId)}?page=${page}&size=${size}`,
    );
    const data = extractApiData<PageResponse<unknown>>(response);
    return {
      ...data,
      content: data.content.map(parseTenantStatusHistoryEntry),
    };
  },

  async getModules(tenantId: string): Promise<TenantModulesSnapshot> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.TENANT_MODULES(tenantId));
    return parseTenantModules(extractApiData(response));
  },

  async enableModule(
    tenantId: string,
    moduleCode: string,
    input: { reason: string; enterpriseOverride?: boolean },
  ): Promise<void> {
    await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.TENANT_MODULE_ENABLE(tenantId, moduleCode), {
      method: "PATCH",
      body: {
        reason: input.reason,
        enterpriseOverride: input.enterpriseOverride ?? false,
      },
    });
  },

  async disableModule(
    tenantId: string,
    moduleCode: string,
    input: { reason: string },
  ): Promise<void> {
    await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.TENANT_MODULE_DISABLE(tenantId, moduleCode), {
      method: "PATCH",
      body: { reason: input.reason, enterpriseOverride: false },
    });
  },

  async startModuleTrial(
    tenantId: string,
    moduleCode: string,
    input: { reason: string; trialDays?: number },
  ): Promise<void> {
    await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.TENANT_MODULE_TRIAL(tenantId, moduleCode), {
      method: "POST",
      body: {
        reason: input.reason,
        trialDays: input.trialDays ?? 14,
      },
    });
  },

  async getAuditLogs(
    tenantId: string,
    page = 0,
    size = 20,
  ): Promise<PageResponse<TenantAuditEntry>> {
    const response = await apiFetch<PageResponse<unknown>>(
      `${API_ENDPOINTS.SUPER_ADMIN.TENANT_AUDIT(tenantId)}?page=${page}&size=${size}`,
    );
    const data = extractApiData<PageResponse<unknown>>(response);
    return {
      ...data,
      content: data.content.map(parseTenantAuditEntry),
    };
  },
};
