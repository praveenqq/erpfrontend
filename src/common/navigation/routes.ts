/**
 * Central route constants — single source of truth for navigation and links.
 */
export const ROUTES = {
  HOME: "/home",
  UNAUTHORIZED: "/unauthorized",
  PLATFORM_TENANTS: "/platform/tenants",
  PLATFORM_TENANT_DETAIL: (id: string) => `/platform/tenants/${id}`,
  PLATFORM_SUBSCRIPTION: "/platform/subscription",
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  SUPER_ADMIN_MODULE_REGISTRY: "/super-admin/modules/registry",
  SUPER_ADMIN_PLANS: "/super-admin/plans",
  SUPER_ADMIN_PLAN_DETAIL: (id: string) => `/super-admin/plans/${id}`,
  SUPER_ADMIN_SUBSCRIPTIONS: "/super-admin/subscriptions",
  SUPER_ADMIN_SUBSCRIPTION_DETAIL: (id: string) => `/super-admin/subscriptions/${id}`,
  SUPER_ADMIN_PROVISIONING: "/super-admin/provisioning",
  SUPER_ADMIN_PROVISIONING_DETAIL: (tenantId: string) => `/super-admin/provisioning/${tenantId}`,
  SUPER_ADMIN_AUDIT: "/super-admin/audit",
  ADMIN_SETUP: "/admin/setup",
  ADMIN_AUDIT: "/admin/audit",
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}`,
  ADMIN_ROLES: "/admin/roles",
  ADMIN_ROLE_DETAIL: (id: string) => `/admin/roles/${id}`,
  MODULE_EXPENSES: "/modules/expenses",
  MODULE_EXPENSE_DETAIL: (id: string) => `/modules/expenses/${id}`,
  MODULE_EMPLOYEES: "/modules/employees",
  MODULE_EMPLOYEE_DETAIL: (id: string) => `/modules/employees/${id}`,
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export function isRouteActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
