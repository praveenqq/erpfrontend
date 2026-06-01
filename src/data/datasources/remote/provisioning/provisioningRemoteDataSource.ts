import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import { extractApiData } from "@/domain/models/common";
import {
  parseProvisioningJobSummary,
  parseProvisioningStatus,
  type ProvisioningJobSummary,
  type ProvisioningStatus,
} from "@/domain/models/provisioning";
import { parseTenant, type Tenant } from "@/domain/models/tenant";
import { apiFetch } from "@/lib/api/client";
import type { RetryProvisioningInput } from "@/platform/provisioning/schemas/provisioning.schema";

export const provisioningRemoteDataSource = {
  async getStatus(tenantId: string): Promise<ProvisioningStatus> {
    const response = await apiFetch<unknown>(
      API_ENDPOINTS.PLATFORM.PROVISIONING_STATUS(tenantId),
    );
    return parseProvisioningStatus(extractApiData(response));
  },

  async getSuperAdminSummary(tenantId: string): Promise<ProvisioningJobSummary> {
    const response = await apiFetch<unknown>(
      API_ENDPOINTS.SUPER_ADMIN.TENANT_PROVISIONING(tenantId),
    );
    return parseProvisioningJobSummary(extractApiData(response));
  },

  async retry(tenantId: string, input: RetryProvisioningInput): Promise<ProvisioningJobSummary> {
    const response = await apiFetch<unknown>(
      API_ENDPOINTS.SUPER_ADMIN.TENANT_PROVISIONING_RETRY(tenantId),
      {
        method: "POST",
        body: input,
      },
    );
    return parseProvisioningJobSummary(extractApiData(response));
  },

  async retryPlatform(tenantId: string): Promise<Tenant> {
    const response = await apiFetch<unknown>(
      API_ENDPOINTS.PLATFORM.PROVISIONING_RETRY(tenantId),
      { method: "POST" },
    );
    return parseTenant(extractApiData(response));
  },
};
