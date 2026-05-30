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
 * Shell-level navigation metadata. Runtime module entries from /v1/me/navigation
 * remain the source of truth for enabled tenant modules and are merged in the
 * navigation hook without hardcoding tenant entitlements in the frontend.
 */
export const platformNavigationItems: WorkspaceNavigationItem[] = [
  {
    id: "home",
    label: "Dashboard",
    href: ROUTES.HOME,
    description: "Workspace overview, setup progress, and action shortcuts",
    icon: LayoutDashboard,
    group: "platform",
    priority: 1,
    source: "platform",
  },
  {
    id: "super-admin",
    label: "Super Admin",
    href: ROUTES.SUPER_ADMIN_DASHBOARD,
    description: "Cross-tenant health, provisioning, and platform actions",
    icon: Shield,
    role: "SUPER_ADMIN_ACCESS",
    group: "platform",
    priority: 2,
    source: "platform",
  },
  {
    id: "tenants",
    label: "Tenants",
    href: ROUTES.PLATFORM_TENANTS,
    description: "Tenant directory, lifecycle status, and health context",
    icon: Building2,
    role: "TENANT_VIEW",
    group: "platform",
    priority: 3,
    source: "platform",
  },
  {
    id: "subscription",
    label: "Subscription",
    href: ROUTES.PLATFORM_SUBSCRIPTION,
    description: "Current plan, billing state, limits, and entitlements",
    icon: CreditCard,
    group: "platform",
    priority: 4,
    source: "platform",
  },
  {
    id: "expenses",
    label: "Expenses",
    href: ROUTES.MODULE_EXPENSES,
    description: "Submit, review, and approve tenant expense claims",
    icon: Receipt,
    moduleCode: "EXPENSES",
    group: "module",
    priority: 40,
    source: "platform",
  },
  {
    id: "setup",
    label: "Setup",
    href: ROUTES.ADMIN_SETUP,
    description: "Required workspace setup steps before module rollout",
    icon: Settings,
    group: "admin",
    priority: 70,
    source: "platform",
  },
];

export const modulePageConfigs: Record<string, ModulePageConfig> = {
  [ROUTES.HOME]: {
    eyebrow: "Workspace",
    title: "Dashboard",
    description:
      "Monitor the current workspace, review items needing attention, and move into the next operational action.",
    supportText:
      "The global shell keeps tenant, role, setup, and module context visible while backend-driven navigation matures.",
  },
  [ROUTES.PLATFORM_TENANTS]: {
    eyebrow: "Platform",
    title: "Tenants",
    description:
      "Search, provision, and monitor tenant organizations with clear status and subscription context.",
    primaryAction: {
      label: "Create tenant",
      href: "#create-tenant",
      variant: "default",
    },
    supportText:
      "Tenant records should expose lifecycle status, subscription context, module access, and audit links.",
  },
  [ROUTES.SUPER_ADMIN_DASHBOARD]: {
    eyebrow: "Super Admin",
    title: "Platform dashboard",
    description:
      "Review tenant health, subscriptions, provisioning failures, module adoption, and recent platform actions.",
    supportText: "Dashboard cards should help administrators decide what needs attention today.",
  },
  [ROUTES.MODULE_EXPENSES]: {
    eyebrow: "Expenses module",
    title: "Expense claims",
    description:
      "Review, submit, and approve expense reports for the current tenant with workflow status visible.",
    supportText: "Requires the EXPENSES module to be enabled and permitted for the current tenant.",
  },
  [ROUTES.PLATFORM_SUBSCRIPTION]: {
    eyebrow: "Platform",
    title: "Subscription",
    description:
      "Review the current plan, billing status, enabled modules, limits, and blocked capabilities.",
    supportText: "Subscription status must remain visible because it controls tenant module access.",
  },
  [ROUTES.ADMIN_SETUP]: {
    eyebrow: "Admin",
    title: "Tenant setup",
    description:
      "Complete required company, structure, and configuration steps before operational modules are unlocked.",
    supportText: "Incomplete setup should guide users to the exact next step instead of leaving blank screens.",
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
