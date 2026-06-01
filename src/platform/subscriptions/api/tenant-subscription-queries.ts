import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionRepository } from "@/data/repositories/subscriptions/subscriptionRepository";
import type {
  Subscription,
  SubscriptionEntitlement,
  SubscriptionUsage,
  TenantBillingSnapshot,
  TenantPlanOption,
} from "@/domain/models/subscription";
import { navigationKeys } from "@/platform/moduleaccess/api/navigation-queries";
import type { TenantChangePlanInput } from "@/platform/subscriptions/schemas/subscription.schema";
import { useAuth } from "@/security/auth/auth-provider";
import { useTenant } from "@/tenancy/context/tenant-context";

export const tenantSubscriptionKeys = {
  all: ["platform", "tenant-subscription"] as const,
  current: (tenantId: string | null) =>
    [...tenantSubscriptionKeys.all, "current", tenantId] as const,
  billing: (tenantId: string | null) =>
    [...tenantSubscriptionKeys.all, "billing", tenantId] as const,
  entitlements: (tenantId: string | null) =>
    [...tenantSubscriptionKeys.all, "entitlements", tenantId] as const,
  usage: (tenantId: string | null) =>
    [...tenantSubscriptionKeys.all, "usage", tenantId] as const,
  availablePlans: (tenantId: string | null) =>
    [...tenantSubscriptionKeys.all, "available-plans", tenantId] as const,
};

function useTenantSubscriptionEnabled(tenantId: string | null) {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    Boolean(tenantId) &&
    isAuthenticated &&
    hasAnyPermission(["SUBSCRIPTION_VIEW", "SUPER_ADMIN_ACCESS"])
  );
}

function useTenantBillingEnabled(tenantId: string | null) {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    Boolean(tenantId) &&
    isAuthenticated &&
    hasAnyPermission(["SUBSCRIPTION_VIEW_BILLING", "SUPER_ADMIN_ACCESS"])
  );
}

export function useTenantSubscriptionCurrent() {
  const { tenantId } = useTenant();
  const enabled = useTenantSubscriptionEnabled(tenantId);
  return useQuery({
    queryKey: tenantSubscriptionKeys.current(tenantId),
    queryFn: (): Promise<Subscription | null> =>
      subscriptionRepository.getTenantCurrent(tenantId),
    enabled,
  });
}

export function useTenantSubscriptionBilling() {
  const { tenantId } = useTenant();
  const enabled = useTenantBillingEnabled(tenantId);
  return useQuery({
    queryKey: tenantSubscriptionKeys.billing(tenantId),
    queryFn: (): Promise<TenantBillingSnapshot> =>
      subscriptionRepository.getTenantBilling(tenantId),
    enabled,
  });
}

export function useTenantSubscriptionEntitlements() {
  const { tenantId } = useTenant();
  const enabled = useTenantSubscriptionEnabled(tenantId);
  return useQuery({
    queryKey: tenantSubscriptionKeys.entitlements(tenantId),
    queryFn: (): Promise<SubscriptionEntitlement[]> =>
      subscriptionRepository.getTenantEntitlements(tenantId),
    enabled,
  });
}

export function useTenantSubscriptionUsage() {
  const { tenantId } = useTenant();
  const enabled = useTenantSubscriptionEnabled(tenantId);
  return useQuery({
    queryKey: tenantSubscriptionKeys.usage(tenantId),
    queryFn: (): Promise<SubscriptionUsage[]> =>
      subscriptionRepository.getTenantUsage(tenantId),
    enabled,
  });
}

export function useTenantAvailablePlans() {
  const { tenantId } = useTenant();
  const enabled = useTenantSubscriptionEnabled(tenantId);
  return useQuery({
    queryKey: tenantSubscriptionKeys.availablePlans(tenantId),
    queryFn: (): Promise<TenantPlanOption[]> =>
      subscriptionRepository.getTenantAvailablePlans(tenantId),
    enabled,
  });
}

export function useTenantSubscriptionDashboard() {
  const current = useTenantSubscriptionCurrent();
  const billing = useTenantSubscriptionBilling();
  const entitlements = useTenantSubscriptionEntitlements();
  const usage = useTenantSubscriptionUsage();
  const availablePlans = useTenantAvailablePlans();

  const isLoading =
    current.isLoading ||
    entitlements.isLoading ||
    usage.isLoading ||
    availablePlans.isLoading ||
    billing.isLoading;

  const isError =
    current.isError ||
    entitlements.isError ||
    usage.isError ||
    availablePlans.isError;

  return {
    subscription: current.data ?? null,
    billing: billing.data,
    entitlements: entitlements.data ?? [],
    usage: usage.data ?? [],
    availablePlans: availablePlans.data ?? [],
    isLoading,
    isError,
    error:
      current.error ??
      entitlements.error ??
      usage.error ??
      availablePlans.error ??
      billing.error,
    canViewBilling: billing.isFetched || billing.fetchStatus === "idle",
    billingLoading: billing.isLoading,
    billingError: billing.isError,
  };
}

function useTenantChangePlanEnabled(tenantId: string | null) {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    Boolean(tenantId) &&
    isAuthenticated &&
    hasAnyPermission(["SUBSCRIPTION_CHANGE_PLAN", "SUPER_ADMIN_ACCESS"])
  );
}

export function useTenantChangePlan() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();
  const enabled = useTenantChangePlanEnabled(tenantId);

  return useMutation({
    mutationFn: (input: TenantChangePlanInput): Promise<Subscription> =>
      subscriptionRepository.changeTenantPlan(tenantId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantSubscriptionKeys.all });
      queryClient.invalidateQueries({ queryKey: navigationKeys.navigation });
    },
    meta: { enabled },
  });
}
