import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import type { PageResponse } from "@/common/types/api";
import { extractApiData } from "@/domain/models/common";
import { parseTenant, type Tenant } from "@/domain/models/tenant";
import { apiFetch } from "@/lib/api/client";
import type { CreateTenantInput } from "@/platform/tenants/schemas/tenant.schema";

export const tenantRemoteDataSource = {
  async list(params: {
    q?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Tenant>> {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    search.set("page", String(params.page ?? 0));
    search.set("size", String(params.size ?? 20));

    const response = await apiFetch<PageResponse<unknown>>(
      `${API_ENDPOINTS.PLATFORM.TENANTS}?${search}`,
    );
    const data = extractApiData<PageResponse<unknown>>(response);
    return {
      ...data,
      content: data.content.map(parseTenant),
    };
  },

  async getById(id: string): Promise<Tenant> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.PLATFORM.TENANT(id));
    return parseTenant(extractApiData(response));
  },

  async create(input: CreateTenantInput): Promise<Tenant> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.PLATFORM.TENANTS, {
      method: "POST",
      body: input,
    });
    return parseTenant(extractApiData(response));
  },
};
