/**
 * Central route constants — single source of truth for navigation and links.
 */
export const ROUTES = {
  HOME: "/",
  PLATFORM_TENANTS: "/platform/tenants",
  PLATFORM_TENANT_DETAIL: (id: string) => `/platform/tenants/${id}`,
  PLATFORM_SUBSCRIPTION: "/platform/subscription",
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  ADMIN_SETUP: "/admin/setup",
  MODULE_EXPENSES: "/modules/expenses",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export function isRouteActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
