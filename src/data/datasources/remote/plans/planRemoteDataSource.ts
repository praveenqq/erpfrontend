import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import { extractApiData } from "@/domain/models/common";
import { parsePlan, type Plan } from "@/domain/models/plan";
import { apiFetch } from "@/lib/api/client";
import type {
  ConfigurePlanLimitsInput,
  ConfigurePlanModulesInput,
  CreatePlanInput,
  PlanPriceInput,
  UpdatePlanInput,
} from "@/platform/plans/schemas/plan.schema";

export const planRemoteDataSource = {
  async listPlans(): Promise<Plan[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.PLANS);
    const data = extractApiData<unknown[]>(response);
    return data.map(parsePlan);
  },

  async getPlan(id: string): Promise<Plan> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.PLAN(id));
    return parsePlan(extractApiData(response));
  },

  async createPlan(input: CreatePlanInput): Promise<Plan> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.PLANS, {
      method: "POST",
      body: input,
    });
    return parsePlan(extractApiData(response));
  },

  async updatePlan(id: string, input: UpdatePlanInput): Promise<Plan> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.PLAN(id), {
      method: "PATCH",
      body: input,
    });
    return parsePlan(extractApiData(response));
  },

  async publishPlan(id: string): Promise<Plan> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.PLAN_PUBLISH(id), {
      method: "POST",
    });
    return parsePlan(extractApiData(response));
  },

  async deprecatePlan(id: string, reason?: string): Promise<Plan> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.PLAN_DEPRECATE(id), {
      method: "POST",
      body: reason ? { reason } : undefined,
    });
    return parsePlan(extractApiData(response));
  },

  async archivePlan(id: string, reason?: string): Promise<Plan> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.PLAN_ARCHIVE(id), {
      method: "POST",
      body: reason ? { reason } : undefined,
    });
    return parsePlan(extractApiData(response));
  },

  async createPlanVersion(id: string): Promise<Plan> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.PLAN_VERSION(id), {
      method: "POST",
    });
    return parsePlan(extractApiData(response));
  },

  async addPlanPrice(id: string, input: PlanPriceInput): Promise<void> {
    await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.PLAN_PRICES(id), {
      method: "POST",
      body: {
        ...input,
        countryCode: input.countryCode || undefined,
      },
    });
  },

  async configurePlanLimits(id: string, input: ConfigurePlanLimitsInput): Promise<void> {
    await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.PLAN_LIMITS(id), {
      method: "POST",
      body: input,
    });
  },

  async configurePlanModules(id: string, input: ConfigurePlanModulesInput): Promise<void> {
    await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.PLAN_MODULE_ENTITLEMENTS(id), {
      method: "POST",
      body: input,
    });
  },

  async listPublicPlans(): Promise<Plan[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.PUBLIC.PLANS, { skipAuth: true });
    const data = extractApiData<unknown[]>(response);
    return data.map(parsePlan);
  },

  async comparePublicPlans(codes: string[]): Promise<Plan[]> {
    const query = encodeURIComponent(codes.join(","));
    const response = await apiFetch<unknown>(
      `${API_ENDPOINTS.PUBLIC.PLANS_COMPARE}?codes=${query}`,
      { skipAuth: true },
    );
    const data = extractApiData<{ plans?: unknown[] } | unknown[]>(response);
    const plans = Array.isArray(data) ? data : (data.plans ?? []);
    return plans.map(parsePlan);
  },
};
