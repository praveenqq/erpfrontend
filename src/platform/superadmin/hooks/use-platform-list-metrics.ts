"use client";

import { useSuperAdminDashboard } from "@/platform/superadmin/api/dashboard-queries";

/** Platform-wide list page metrics from the super-admin dashboard API. */
export function usePlatformListMetrics() {
  const { data, isLoading, isError, error } = useSuperAdminDashboard();

  return {
    isLoading,
    isError,
    error,
    tenants: data?.tenants ?? null,
    subscriptions: data?.subscriptions ?? null,
    health: data?.health ?? null,
  };
}
