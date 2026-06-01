import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import { extractApiData } from "@/domain/models/common";
import {
  parseBranch,
  parseCompany,
  parseDepartment,
  type Branch,
  type Company,
  type Department,
} from "@/domain/models/organization";
import { apiFetch } from "@/lib/api/client";

export const organizationRemoteDataSource = {
  async getCompany(tenantId: string | null): Promise<Company> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.ORGANIZATION_COMPANY, { tenantId });
    return parseCompany(extractApiData(response));
  },

  async updateCompany(name: string, tenantId: string | null): Promise<Company> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.ORGANIZATION_COMPANY, {
      method: "PATCH",
      body: { name },
      tenantId,
    });
    return parseCompany(extractApiData(response));
  },

  async listBranches(tenantId: string | null): Promise<Branch[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.ORGANIZATION_BRANCHES, { tenantId });
    return extractApiData<unknown[]>(response).map(parseBranch);
  },

  async createBranch(input: { code: string; name: string }, tenantId: string | null): Promise<Branch> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.ORGANIZATION_BRANCHES, {
      method: "POST",
      body: input,
      tenantId,
    });
    return parseBranch(extractApiData(response));
  },

  async listDepartments(tenantId: string | null): Promise<Department[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.ORGANIZATION_DEPARTMENTS, { tenantId });
    return extractApiData<unknown[]>(response).map(parseDepartment);
  },

  async createDepartment(
    input: { code: string; name: string },
    tenantId: string | null,
  ): Promise<Department> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.ORGANIZATION_DEPARTMENTS, {
      method: "POST",
      body: input,
      tenantId,
    });
    return parseDepartment(extractApiData(response));
  },
};
