import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import type { PageResponse } from "@/common/types/api";
import { extractApiData } from "@/domain/models/common";
import {
  parseSubscription,
  parseSubscriptionAddon,
  parseSubscriptionEntitlement,
  parseSubscriptionHistoryEntry,
  parseSubscriptionUsage,
  parseTenantPlanOption,
  type Subscription,
  type SubscriptionAddon,
  type SubscriptionEntitlement,
  type SubscriptionHistoryEntry,
  type SubscriptionUsage,
  type TenantBillingSnapshot,
  type TenantPlanOption,
} from "@/domain/models/subscription";
import { apiFetch } from "@/lib/api/client";
import type {
  ChangePlanInput,
  CreateSubscriptionInput,
  SubscriptionReasonInput,
  TenantChangePlanInput,
} from "@/platform/subscriptions/schemas/subscription.schema";

function parseBilling(value: unknown): TenantBillingSnapshot {
  const record = value as Record<string, unknown>;
  const subscriptionRaw = record.subscription;
  return {
    subscription: subscriptionRaw ? parseSubscription(subscriptionRaw) : null,
    invoices: Array.isArray(record.invoices)
      ? record.invoices.map((item) => {
          const invoice = item as Record<string, unknown>;
          return {
            id: String(invoice.id ?? ""),
            invoiceNumber: typeof invoice.invoiceNumber === "string" ? invoice.invoiceNumber : null,
            totalAmount: typeof invoice.totalAmount === "number" ? invoice.totalAmount : null,
            currency: typeof invoice.currency === "string" ? invoice.currency : null,
            status: typeof invoice.status === "string" ? invoice.status : null,
            dueDate: typeof invoice.dueDate === "string" ? invoice.dueDate : null,
            paidAt: typeof invoice.paidAt === "string" ? invoice.paidAt : null,
          };
        })
      : [],
    payments: Array.isArray(record.payments)
      ? record.payments.map((item) => {
          const payment = item as Record<string, unknown>;
          return {
            id: String(payment.id ?? ""),
            amount: typeof payment.amount === "number" ? payment.amount : null,
            currency: typeof payment.currency === "string" ? payment.currency : null,
            status: typeof payment.status === "string" ? payment.status : null,
            paidAt: typeof payment.paidAt === "string" ? payment.paidAt : null,
            failedReason: typeof payment.failedReason === "string" ? payment.failedReason : null,
          };
        })
      : [],
  };
}

export const subscriptionRemoteDataSource = {
  async getById(id: string): Promise<Subscription> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id));
    return parseSubscription(extractApiData(response));
  },

  async getCurrentByTenant(tenantId: string): Promise<Subscription | null> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.BY_TENANT(tenantId));
    const data = extractApiData<unknown | null>(response);
    return data ? parseSubscription(data) : null;
  },

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.BASE, {
      method: "POST",
      body: input,
    });
    return parseSubscription(extractApiData(response));
  },

  async startTrial(input: CreateSubscriptionInput): Promise<Subscription> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.TRIAL, {
      method: "POST",
      body: input,
    });
    return parseSubscription(extractApiData(response));
  },

  async activate(id: string): Promise<Subscription> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.ACTIVATE(id), {
      method: "PATCH",
    });
    return parseSubscription(extractApiData(response));
  },

  async renew(id: string): Promise<Subscription> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.RENEW(id), {
      method: "PATCH",
    });
    return parseSubscription(extractApiData(response));
  },

  async cancel(id: string, input: SubscriptionReasonInput): Promise<Subscription> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(id), {
      method: "PATCH",
      body: input,
    });
    return parseSubscription(extractApiData(response));
  },

  async cancelAtPeriodEnd(id: string): Promise<Subscription> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL_AT_PERIOD_END(id), {
      method: "PATCH",
    });
    return parseSubscription(extractApiData(response));
  },

  async suspend(id: string, input: SubscriptionReasonInput): Promise<Subscription> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.SUSPEND(id), {
      method: "PATCH",
      body: input,
    });
    return parseSubscription(extractApiData(response));
  },

  async resume(id: string): Promise<Subscription> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.RESUME(id), {
      method: "PATCH",
    });
    return parseSubscription(extractApiData(response));
  },

  async changePlan(id: string, input: ChangePlanInput): Promise<Subscription> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.CHANGE_PLAN(id), {
      method: "PATCH",
      body: input,
    });
    return parseSubscription(extractApiData(response));
  },

  async recalculateEntitlements(id: string): Promise<void> {
    await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.RECALCULATE_ENTITLEMENTS(id), {
      method: "POST",
    });
  },

  async listAddons(id: string): Promise<SubscriptionAddon[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.ADDONS(id));
    const data = extractApiData<unknown[]>(response);
    return data.map(parseSubscriptionAddon);
  },

  async addAddon(
    id: string,
    input: { addonCode: string; name: string; moduleCode?: string; quantity?: number },
  ): Promise<SubscriptionAddon> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.ADDONS(id), {
      method: "POST",
      body: input,
    });
    return parseSubscriptionAddon(extractApiData(response));
  },

  async removeAddon(id: string, addonId: string): Promise<void> {
    await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.ADDON(id, addonId), {
      method: "DELETE",
    });
  },

  async getEntitlements(id: string): Promise<SubscriptionEntitlement[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.ENTITLEMENTS(id));
    const data = extractApiData<unknown[]>(response);
    return data.map(parseSubscriptionEntitlement);
  },

  async getUsage(id: string): Promise<SubscriptionUsage[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.USAGE(id));
    const data = extractApiData<unknown[]>(response);
    return data.map(parseSubscriptionUsage);
  },

  async getHistory(id: string, page = 0, size = 20): Promise<PageResponse<SubscriptionHistoryEntry>> {
    const response = await apiFetch<PageResponse<unknown>>(
      `${API_ENDPOINTS.SUBSCRIPTIONS.HISTORY(id)}?page=${page}&size=${size}`,
    );
    const data = extractApiData<PageResponse<unknown>>(response);
    return {
      ...data,
      content: data.content.map(parseSubscriptionHistoryEntry),
    };
  },

  async getBilling(tenantId: string): Promise<TenantBillingSnapshot> {
    const response = await apiFetch<unknown>(
      API_ENDPOINTS.SUPER_ADMIN.TENANT_SUBSCRIPTION_BILLING(tenantId),
    );
    return parseBilling(extractApiData(response));
  },

  async getTenantCurrent(tenantId: string | null): Promise<Subscription | null> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.PLATFORM.TENANT_SUBSCRIPTION_CURRENT, {
      tenantId,
    });
    const data = extractApiData<unknown | null>(response);
    return data ? parseSubscription(data) : null;
  },

  async getTenantBilling(tenantId: string | null): Promise<TenantBillingSnapshot> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.PLATFORM.TENANT_SUBSCRIPTION_BILLING, {
      tenantId,
    });
    return parseBilling(extractApiData(response));
  },

  async getTenantEntitlements(tenantId: string | null): Promise<SubscriptionEntitlement[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.PLATFORM.TENANT_SUBSCRIPTION_ENTITLEMENTS, {
      tenantId,
    });
    const data = extractApiData<unknown[]>(response);
    return data.map(parseSubscriptionEntitlement);
  },

  async getTenantUsage(tenantId: string | null): Promise<SubscriptionUsage[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.PLATFORM.TENANT_SUBSCRIPTION_USAGE, {
      tenantId,
    });
    const data = extractApiData<unknown[]>(response);
    return data.map(parseSubscriptionUsage);
  },

  async getTenantAvailablePlans(tenantId: string | null): Promise<TenantPlanOption[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.PLATFORM.TENANT_SUBSCRIPTION_AVAILABLE_PLANS, {
      tenantId,
    });
    const data = extractApiData<unknown[]>(response);
    return data.map(parseTenantPlanOption);
  },

  async changeTenantPlan(
    tenantId: string | null,
    input: TenantChangePlanInput,
  ): Promise<Subscription> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.PLATFORM.TENANT_SUBSCRIPTION_CHANGE_PLAN, {
      method: "POST",
      body: input,
      tenantId,
    });
    return parseSubscription(extractApiData(response));
  },
};
