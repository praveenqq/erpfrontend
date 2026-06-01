import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import type { PageResponse } from "@/common/types/api";
import { extractApiData } from "@/domain/models/common";
import {
  parsePermissionDefinition,
  parseTenantRole,
  parseTenantRoleDetail,
  parseTenantUser,
  parseTenantUserDetail,
  type PermissionDefinition,
  type TenantRole,
  type TenantRoleDetail,
  type TenantUser,
  type TenantUserDetail,
} from "@/domain/models/identity";
import { apiFetch } from "@/lib/api/client";
import type {
  CreateRoleInput,
  CreateUserInput,
  DeactivateUserInput,
  UpdateRolePermissionsInput,
  UpdateUserAccessInput,
} from "@/platform/identity/schemas/identity.schema";

export const identityRemoteDataSource = {
  async listUsers(params: {
    q?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<TenantUser>> {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    search.set("page", String(params.page ?? 0));
    search.set("size", String(params.size ?? 20));
    const response = await apiFetch<PageResponse<unknown>>(
      `${API_ENDPOINTS.ADMIN.USERS}?${search}`,
    );
    const data = extractApiData<PageResponse<unknown>>(response);
    return { ...data, content: data.content.map(parseTenantUser) };
  },

  async getUser(id: string): Promise<TenantUserDetail> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.USER(id));
    return parseTenantUserDetail(extractApiData(response));
  },

  async createUser(input: CreateUserInput): Promise<TenantUser> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.USERS, {
      method: "POST",
      body: input,
    });
    return parseTenantUser(extractApiData(response));
  },

  async updateUserAccess(id: string, input: UpdateUserAccessInput): Promise<TenantUser> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.USER_ACCESS(id), {
      method: "PATCH",
      body: input,
    });
    return parseTenantUser(extractApiData(response));
  },

  async deactivateUser(id: string, input: DeactivateUserInput): Promise<TenantUser> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.USER_DEACTIVATE(id), {
      method: "POST",
      body: input,
    });
    return parseTenantUser(extractApiData(response));
  },

  async listRoles(): Promise<TenantRole[]> {
    const response = await apiFetch<unknown[]>(API_ENDPOINTS.ADMIN.ROLES);
    return extractApiData<unknown[]>(response).map(parseTenantRole);
  },

  async getRole(id: string): Promise<TenantRoleDetail> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.ROLE(id));
    return parseTenantRoleDetail(extractApiData(response));
  },

  async listPermissions(): Promise<PermissionDefinition[]> {
    const response = await apiFetch<unknown[]>(API_ENDPOINTS.ADMIN.PERMISSIONS);
    return extractApiData<unknown[]>(response).map(parsePermissionDefinition);
  },

  async createRole(input: CreateRoleInput): Promise<TenantRoleDetail> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.ROLES, {
      method: "POST",
      body: input,
    });
    return parseTenantRoleDetail(extractApiData(response));
  },

  async updateRolePermissions(
    id: string,
    input: UpdateRolePermissionsInput,
  ): Promise<TenantRoleDetail> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.ROLE_PERMISSIONS(id), {
      method: "PATCH",
      body: input,
    });
    return parseTenantRoleDetail(extractApiData(response));
  },
};
