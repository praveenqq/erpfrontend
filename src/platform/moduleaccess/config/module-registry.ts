import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/common/navigation/routes";
import type {
  ModulePageConfig,
  WorkspaceNavigationItem,
} from "@/domain/models/workspace";

/**
 * Static platform navigation + page metadata.
 * Server-driven items from /v1/me/navigation are merged at runtime.
 */
export const platformNavigationItems: WorkspaceNavigationItem[] = [
  {
    id: "home",
    label: "Home",
    href: ROUTES.HOME,
    description: "Workspace overview and setup progress",
    icon: LayoutDashboard,
    group: "platform",
  },
  {
    id: "tenants",
    label: "Tenants",
    href: ROUTES.PLATFORM_TENANTS,
    description: "Organization directory and lifecycle",
    icon: Building2,
    role: "TENANT_VIEW",
    group: "platform",
  },
  {
    id: "super-admin",
    label: "Super Admin",
    href: ROUTES.SUPER_ADMIN_DASHBOARD,
    description: "Cross-tenant platform operations",
    icon: Shield,
    role: "SUPER_ADMIN_ACCESS",
    group: "platform",
  },
  {
    id: "expenses",
    label: "Expenses",
    href: ROUTES.MODULE_EXPENSES,
    description: "Submit and approve expense claims",
    icon: Receipt,
    moduleCode: "EXPENSES",
    group: "module",
  },
  {
    id: "subscription",
    label: "Subscription",
    href: ROUTES.PLATFORM_SUBSCRIPTION,
    description: "Plan, billing, and entitlements",
    icon: CreditCard,
    group: "platform",
  },
  {
    id: "setup",
    label: "Setup",
    href: ROUTES.ADMIN_SETUP,
    description: "Guided tenant workspace provisioning",
    icon: Settings,
    group: "admin",
  },
];

export const modulePageConfigs: Record<string, ModulePageConfig> = {
  [ROUTES.HOME]: {
    eyebrow: "Workspace",
    title: "Dashboard",
    description:
      "Welcome to your ERP workspace. Monitor setup progress and jump into platform or tenant modules.",
    supportText:
      "Use the left navigation to switch between platform and tenant-scoped modules.",
  },
  [ROUTES.PLATFORM_TENANTS]: {
    eyebrow: "Platform",
    title: "Tenants",
    description:
      "Platform tenant directory and lifecycle management — search, provision, and monitor organizations.",
    primaryAction: { label: "Create tenant", href: "#create-tenant", variant: "default" },
    supportText: "New tenants inherit plan entitlements and module access from provisioning.",
  },
  [ROUTES.SUPER_ADMIN_DASHBOARD]: {
    eyebrow: "Super Admin",
    title: "Platform dashboard",
    description:
      "Cross-tenant health, subscriptions, and module adoption across the entire platform.",
    supportText: "Metrics refresh from the super-admin dashboard API.",
  },
  [ROUTES.MODULE_EXPENSES]: {
    eyebrow: "Expenses module",
    title: "Expense claims",
    description:
      "Review, submit, and approve expense reports for the current tenant.",
    supportText: "Requires the EXPENSES module to be enabled for your tenant.",
  },
  [ROUTES.PLATFORM_SUBSCRIPTION]: {
    eyebrow: "Platform",
    title: "Subscription",
    description: "Tenant subscription and plan management.",
    supportText: "Connect plan upgrade flows via platform/subscriptions.",
  },
  [ROUTES.ADMIN_SETUP]: {
    eyebrow: "Admin",
    title: "Tenant setup",
    description: "Guided workspace provisioning and onboarding steps.",
    supportText: "Complete all required steps to unlock tenant modules.",
  },
};

export function getModulePageConfig(pathname: string): ModulePageConfig | undefined {
  if (modulePageConfigs[pathname]) return modulePageConfigs[pathname];
  const match = Object.keys(modulePageConfigs).find((route) =>
    pathname.startsWith(`${route}/`),
  );
  return match ? modulePageConfigs[match] : undefined;
}

export function getNavIcon(code: string): LucideIcon | undefined {
  return platformNavigationItems.find((i) => i.moduleCode === code)?.icon;
}
