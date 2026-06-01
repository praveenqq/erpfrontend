import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import { extractApiData } from "@/domain/models/common";
import {
  parseTenantSetupProgress,
  type TenantSetupProgress,
  type TenantSetupStepCode,
} from "@/domain/models/setup";
import { apiFetch } from "@/lib/api/client";

export const setupRemoteDataSource = {
  async getProgress(tenantId: string | null): Promise<TenantSetupProgress> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.SETUP, {
      tenantId,
    });
    return parseTenantSetupProgress(extractApiData(response));
  },

  async completeStep(
    step: TenantSetupStepCode,
    tenantId: string | null,
  ): Promise<TenantSetupProgress> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.ADMIN.SETUP_STEP_COMPLETE(step), {
      method: "POST",
      tenantId,
    });
    return parseTenantSetupProgress(extractApiData(response));
  },
};
