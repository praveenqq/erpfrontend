/**
 * API path constants grouped by domain — mirrors backend controller prefixes.
 */
export const API_ENDPOINTS = {
  ME: {
    NAVIGATION: "/v1/me/navigation",
    MODULES: "/v1/me/modules",
    FEATURES: "/v1/me/features",
  },
  PLATFORM: {
    TENANTS: "/v1/platform/tenants",
    TENANT: (id: string) => `/v1/platform/tenants/${id}`,
    SUBSCRIPTION: "/v1/platform/tenant/subscription",
    PROVISIONING: "/v1/platform/provisioning",
  },
  SUPER_ADMIN: {
    DASHBOARD: "/v1/super-admin/dashboard",
    TENANTS: "/v1/super-admin/tenants",
  },
  ADMIN: {
    SETUP: "/v1/admin/tenant/setup",
  },
  MODULES: {
    EXPENSES: "/v1/expenses",
    EXPENSE: (id: string) => `/v1/expenses/${id}`,
    EXPENSE_SUBMIT: (id: string) => `/v1/expenses/${id}/submit`,
  },
  PUBLIC: {
    PLANS: "/v1/public/plans",
  },
} as const;
