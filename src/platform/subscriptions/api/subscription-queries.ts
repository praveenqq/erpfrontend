import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionRepository } from "@/data/repositories/subscriptions/subscriptionRepository";
import type {
  Subscription,
  SubscriptionDirectoryRow,
  SubscriptionEntitlement,
  SubscriptionUsage,
  TenantBillingSnapshot,
} from "@/domain/models/subscription";
import { fetchAllTenants } from "@/platform/tenants/api/fetch-all-tenants";
import { usePlatformListMetrics } from "@/platform/superadmin/hooks/use-platform-list-metrics";
import { useAuth } from "@/security/auth/auth-provider";
import type {
  ChangePlanInput,
  CreateSubscriptionInput,
  SubscriptionReasonInput,
} from "@/platform/subscriptions/schemas/subscription.schema";

export const subscriptionKeys = {
  all: ["platform", "subscriptions"] as const,
  directory: () => [...subscriptionKeys.all, "directory"] as const,
  detail: (id: string) => [...subscriptionKeys.all, "detail", id] as const,
  byTenant: (tenantId: string) => [...subscriptionKeys.all, "tenant", tenantId] as const,
  entitlements: (id: string) => [...subscriptionKeys.all, "entitlements", id] as const,
  usage: (id: string) => [...subscriptionKeys.all, "usage", id] as const,
  history: (id: string) => [...subscriptionKeys.all, "history", id] as const,
  billing: (tenantId: string) => [...subscriptionKeys.all, "billing", tenantId] as const,
  addons: (id: string) => [...subscriptionKeys.all, "addons", id] as const,
};

function useSubscriptionQueryEnabled() {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    isAuthenticated &&
    hasAnyPermission(["SUBSCRIPTION_VIEW", "SUPER_ADMIN_ACCESS", "SUPER_ADMIN_SUBSCRIPTION_READ"])
  );
}

export function useSubscriptionDirectory() {
  const enabled = useSubscriptionQueryEnabled();
  const metrics = usePlatformListMetrics();

  const tenantsQuery = useQuery({
    queryKey: ["platform", "tenants", "directory-all"],
    queryFn: () => fetchAllTenants(),
    enabled,
    staleTime: 30_000,
  });

  const tenantRows = tenantsQuery.data ?? [];

  const subscriptionQueries = useQueries({
    queries: tenantRows.map((tenant) => ({
      queryKey: subscriptionKeys.byTenant(tenant.id),
      queryFn: (): Promise<Subscription | null> =>
        subscriptionRepository.getCurrentByTenant(tenant.id),
      enabled: enabled && tenantRows.length > 0,
      staleTime: 30_000,
    })),
  });

  const rows: SubscriptionDirectoryRow[] = tenantRows.map((tenant, index) => ({
    tenantId: tenant.id,
    tenantName: tenant.displayName,
    tenantSlug: tenant.slug,
    tenantType: tenant.type ?? null,
    subscription: subscriptionQueries[index]?.data ?? null,
  }));

  return {
    rows,
    metrics,
    isLoading:
      tenantsQuery.isLoading ||
      subscriptionQueries.some((query) => query.isLoading),
    isError:
      tenantsQuery.isError || subscriptionQueries.some((query) => query.isError),
    error:
      tenantsQuery.error ??
      subscriptionQueries.find((query) => query.error)?.error,
    refetch: async () => {
      await tenantsQuery.refetch();
      await Promise.all(subscriptionQueries.map((query) => query.refetch()));
    },
  };
}

export function useSubscription(id: string) {
  const enabled = useSubscriptionQueryEnabled() && Boolean(id);
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: (): Promise<Subscription> => subscriptionRepository.getById(id),
    enabled,
  });
}

export function useSubscriptionEntitlements(id: string) {
  const enabled = useSubscriptionQueryEnabled() && Boolean(id);
  return useQuery({
    queryKey: subscriptionKeys.entitlements(id),
    queryFn: (): Promise<SubscriptionEntitlement[]> => subscriptionRepository.getEntitlements(id),
    enabled,
  });
}

export function useSubscriptionUsage(id: string) {
  const enabled = useSubscriptionQueryEnabled() && Boolean(id);
  return useQuery({
    queryKey: subscriptionKeys.usage(id),
    queryFn: (): Promise<SubscriptionUsage[]> => subscriptionRepository.getUsage(id),
    enabled,
  });
}

export function useSubscriptionHistory(id: string) {
  const enabled = useSubscriptionQueryEnabled() && Boolean(id);
  return useQuery({
    queryKey: subscriptionKeys.history(id),
    queryFn: () => subscriptionRepository.getHistory(id),
    enabled,
  });
}

export function useSubscriptionBilling(tenantId: string) {
  const enabled = useSubscriptionQueryEnabled() && Boolean(tenantId);
  return useQuery({
    queryKey: subscriptionKeys.billing(tenantId),
    queryFn: (): Promise<TenantBillingSnapshot> => subscriptionRepository.getBilling(tenantId),
    enabled,
  });
}

function invalidateSubscriptionQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  subscription?: Subscription | null,
) {
  queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
  if (subscription?.id) {
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(subscription.id) });
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.entitlements(subscription.id) });
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.usage(subscription.id) });
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.history(subscription.id) });
  }
  if (subscription?.tenantId) {
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.byTenant(subscription.tenantId) });
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.billing(subscription.tenantId) });
  }
}

function useSubscriptionInvalidation() {
  const queryClient = useQueryClient();
  return (subscription?: Subscription | null) =>
    invalidateSubscriptionQueries(queryClient, subscription);
}

export function useCreateSubscription() {
  const invalidate = useSubscriptionInvalidation();
  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) => subscriptionRepository.create(input),
    onSuccess: invalidate,
  });
}

export function useStartTrialSubscription() {
  const invalidate = useSubscriptionInvalidation();
  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) => subscriptionRepository.startTrial(input),
    onSuccess: invalidate,
  });
}

export function useActivateSubscription(id: string) {
  const invalidate = useSubscriptionInvalidation();
  return useMutation({
    mutationFn: () => subscriptionRepository.activate(id),
    onSuccess: invalidate,
  });
}

export function useRenewSubscription(id: string) {
  const invalidate = useSubscriptionInvalidation();
  return useMutation({
    mutationFn: () => subscriptionRepository.renew(id),
    onSuccess: invalidate,
  });
}

export function useCancelSubscription(id: string) {
  const invalidate = useSubscriptionInvalidation();
  return useMutation({
    mutationFn: (input: SubscriptionReasonInput) => subscriptionRepository.cancel(id, input),
    onSuccess: invalidate,
  });
}

export function useCancelSubscriptionAtPeriodEnd(id: string) {
  const invalidate = useSubscriptionInvalidation();
  return useMutation({
    mutationFn: () => subscriptionRepository.cancelAtPeriodEnd(id),
    onSuccess: invalidate,
  });
}

export function useSuspendSubscription(id: string) {
  const invalidate = useSubscriptionInvalidation();
  return useMutation({
    mutationFn: (input: SubscriptionReasonInput) => subscriptionRepository.suspend(id, input),
    onSuccess: invalidate,
  });
}

export function useResumeSubscription(id: string) {
  const invalidate = useSubscriptionInvalidation();
  return useMutation({
    mutationFn: () => subscriptionRepository.resume(id),
    onSuccess: invalidate,
  });
}

export function useChangeSubscriptionPlan(id: string) {
  const invalidate = useSubscriptionInvalidation();
  return useMutation({
    mutationFn: (input: ChangePlanInput) => subscriptionRepository.changePlan(id, input),
    onSuccess: invalidate,
  });
}

export function useRecalculateSubscriptionEntitlements(id: string, tenantId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionRepository.recalculateEntitlements(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.entitlements(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.addons(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      if (tenantId) {
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.billing(tenantId) });
      }
    },
  });
}

export function useSubscriptionAddons(id: string) {
  const enabled = useSubscriptionQueryEnabled() && Boolean(id);
  return useQuery({
    queryKey: subscriptionKeys.addons(id),
    queryFn: () => subscriptionRepository.listAddons(id),
    enabled,
  });
}

export function useAddSubscriptionAddon(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { addonCode: string; name: string; moduleCode?: string; quantity?: number }) =>
      subscriptionRepository.addAddon(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.addons(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.entitlements(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useRemoveSubscriptionAddon(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addonId: string) => subscriptionRepository.removeAddon(id, addonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.addons(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.entitlements(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}
