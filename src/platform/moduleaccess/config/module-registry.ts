import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Blocks,
  Package,
  PlayCircle,
  Receipt,
  Settings,
  Shield,
  ShieldCheck,
  Users,
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
export const moduleNavIcons: Record<string, LucideIcon> = {
  EXPENSES: Receipt,
  EMPLOYEES: Users,
  LEAVE: Blocks,
  PAYROLL: Blocks,
  REQUISITIONS: Blocks,
};

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
    label: "Platform overview",
    href: ROUTES.SUPER_ADMIN_DASHBOARD,
    description: "Health, adoption, and actions across all customer organizations",
    icon: Shield,
    role: "SUPER_ADMIN_ACCESS",
    group: "platform",
    priority: 2,
    source: "platform",
  },
  {
    id: "module-registry",
    label: "Module catalog",
    href: ROUTES.SUPER_ADMIN_MODULE_REGISTRY,
    description: "Product modules, dependencies, and packaging rules for commercial plans",
    icon: Blocks,
    role: "SUPER_ADMIN_ACCESS",
    group: "platform",
    priority: 3,
    source: "platform",
  },
  {
    id: "plans",
    label: "Commercial plans",
    href: ROUTES.SUPER_ADMIN_PLANS,
    description: "Packages, pricing, limits, and lifecycle for customer organizations",
    icon: Package,
    role: "SUPER_ADMIN_ACCESS",
    group: "platform",
    priority: 4,
    source: "platform",
  },
  {
    id: "subscriptions",
    label: "Customer billing",
    href: ROUTES.SUPER_ADMIN_SUBSCRIPTIONS,
    description: "Assign and monitor plans for customer organizations (operator workspaces excluded)",
    icon: CreditCard,
    role: "SUPER_ADMIN_ACCESS",
    group: "platform",
    priority: 5,
    source: "platform",
  },
  {
    id: "provisioning",
    label: "Customer onboarding",
    href: ROUTES.SUPER_ADMIN_PROVISIONING,
    description: "Create customer organizations and track provisioning progress",
    icon: PlayCircle,
    permissions: ["SUPER_ADMIN_PROVISIONING_MANAGE", "TENANT_CREATE", "SUPER_ADMIN_ACCESS"],
    group: "platform",
    priority: 6,
    source: "platform",
  },
  {
    id: "audit",
    label: "Platform audit",
    href: ROUTES.SUPER_ADMIN_AUDIT,
    description: "Search audit records across all organizations for lifecycle and support actions",
    icon: ShieldCheck,
    permissions: ["SUPER_ADMIN_AUDIT_READ", "SUPER_ADMIN_ACCESS"],
    group: "support",
    priority: 80,
    source: "platform",
  },
  {
    id: "tenants",
    label: "Organizations",
    href: ROUTES.PLATFORM_TENANTS,
    description: "Directory of customer and operator organizations with lifecycle status",
    icon: Building2,
    role: "TENANT_VIEW",
    group: "platform",
    priority: 7,
    source: "platform",
  },
  {
    id: "subscription",
    label: "Plan and billing",
    href: ROUTES.PLATFORM_SUBSCRIPTION,
    description: "Your organization's current plan, limits, and entitlements",
    icon: CreditCard,
    group: "platform",
    priority: 8,
    source: "platform",
  },
  {
    id: "setup",
    label: "Company setup",
    href: ROUTES.ADMIN_SETUP,
    description: "Required organization profile, structure, and rollout steps",
    icon: Settings,
    permissions: ["TENANT_VIEW", "TENANT_UPDATE", "SUPER_ADMIN_ACCESS"],
    group: "admin",
    priority: 70,
    source: "platform",
  },
  {
    id: "users",
    label: "Users",
    href: ROUTES.ADMIN_USERS,
    description: "Invite users, assign memberships, roles, and branch or department scopes",
    icon: Users,
    role: "USER_VIEW",
    group: "admin",
    priority: 71,
    source: "platform",
  },
  {
    id: "roles",
    label: "Roles",
    href: ROUTES.ADMIN_ROLES,
    description: "Manage tenant roles and permission codes that drive authorization",
    icon: ShieldCheck,
    role: "ROLE_VIEW",
    group: "admin",
    priority: 72,
    source: "platform",
  },
  {
    id: "admin-audit",
    label: "Organization audit",
    href: ROUTES.ADMIN_AUDIT,
    description: "Review audit records for the signed-in organization only",
    icon: ShieldCheck,
    permissions: ["TENANT_VIEW", "TENANT_UPDATE", "SUPER_ADMIN_ACCESS"],
    group: "support",
    priority: 81,
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
      "Your workspace dashboard reflects live setup progress, billing status, and enabled modules from the backend.",
  },
  [ROUTES.PLATFORM_TENANTS]: {
    eyebrow: "Platform operations",
    title: "Organizations",
    description:
      "Browse customer and operator organizations, review health and billing context, and open a workspace for support actions.",
    primaryAction: {
      label: "Onboard customer",
      href: ROUTES.SUPER_ADMIN_PROVISIONING,
      variant: "default",
    },
    secondaryAction: {
      label: "Onboarding queue",
      href: ROUTES.SUPER_ADMIN_PROVISIONING,
      variant: "outline",
    },
    supportText:
      "Platform operator organizations do not require a customer plan. Customer organizations need an assigned plan before modules go live.",
  },
  [ROUTES.SUPER_ADMIN_DASHBOARD]: {
    eyebrow: "Platform operations",
    title: "Platform overview",
    description:
      "Monitor organization health, customer billing, onboarding progress, module adoption, and recent platform activity.",
    secondaryAction: {
      label: "All organizations",
      href: ROUTES.PLATFORM_TENANTS,
      variant: "outline",
    },
    supportText: "Summary cards are read-only. Open linked pages to investigate and take action.",
  },
  [ROUTES.SUPER_ADMIN_MODULE_REGISTRY]: {
    eyebrow: "Platform operations",
    title: "Module catalog",
    description:
      "Review the backend product capability catalog with module dependencies, platform requirements, and packaging flags.",
    secondaryAction: {
      label: "Platform dashboard",
      href: ROUTES.SUPER_ADMIN_DASHBOARD,
      variant: "outline",
    },
    supportText:
      "This catalog is the source of truth for plan packaging. Do not hardcode module lists in plan or subscription screens.",
  },
  [ROUTES.SUPER_ADMIN_PLANS]: {
    eyebrow: "Platform operations",
    title: "Commercial plans",
    description:
      "Create and manage commercial plans with lifecycle status, pricing, limits, and visibility before subscriptions attach to them.",
    secondaryAction: {
      label: "Module registry",
      href: ROUTES.SUPER_ADMIN_MODULE_REGISTRY,
      variant: "outline",
    },
    supportText:
      "Plans define packaging rules only. Map modules from the registry on each plan detail page before subscriptions attach to a published plan.",
  },
  [ROUTES.SUPER_ADMIN_SUBSCRIPTIONS]: {
    eyebrow: "Platform operations",
    title: "Customer billing",
    description:
      "Assign plans to customer organizations, monitor billing status, and review entitlements. Operator workspaces are excluded from billing.",
    secondaryAction: {
      label: "Commercial plans",
      href: ROUTES.SUPER_ADMIN_PLANS,
      variant: "outline",
    },
    supportText:
      "Only customer organizations require a plan. Platform operator workspaces are listed for reference and do not need a subscription.",
  },
  [ROUTES.SUPER_ADMIN_PROVISIONING]: {
    eyebrow: "Platform operations",
    title: "Customer onboarding",
    description:
      "Create customer organizations, assign initial plans, monitor onboarding steps, and retry failed jobs.",
    primaryAction: {
      label: "Onboard customer",
      href: "#provision-tenant",
      variant: "default",
    },
    secondaryAction: {
      label: "All organizations",
      href: ROUTES.PLATFORM_TENANTS,
      variant: "outline",
    },
    supportText:
      "Onboarding runs asynchronously. Failed steps can be retried from the job detail page with an audit reason.",
  },
  [ROUTES.PLATFORM_SUBSCRIPTION]: {
    eyebrow: "Organization",
    title: "Plan and billing",
    description:
      "Review your organization's current plan, billing status, enabled modules, usage limits, and any restricted capabilities.",
    supportText: "Plan status controls which business modules your organization can use.",
  },
  [ROUTES.SUPER_ADMIN_AUDIT]: {
    eyebrow: "Support",
    title: "Audit logs",
    description: "Search platform and tenant audit records for sensitive lifecycle changes.",
    supportText: "Audit is required for enterprise trust. Filter by tenant and action type.",
  },
  [ROUTES.ADMIN_AUDIT]: {
    eyebrow: "Support",
    title: "Tenant audit log",
    description: "Review tenant-scoped audit records for support and compliance.",
    supportText: "Sensitive changes should always leave an auditable trail.",
  },
  [ROUTES.ADMIN_SETUP]: {
    eyebrow: "Admin",
    title: "Company setup wizard",
    description:
      "Complete company profile, organization structure, and configuration steps before operational modules unlock.",
    supportText:
      "Blocking steps gate paid modules. Each completed step is audited. Numbering defaults are seeded during provisioning.",
  },
  [ROUTES.ADMIN_USERS]: {
    eyebrow: "Admin",
    title: "Users and access",
    description:
      "Invite organization users, assign memberships, roles, and branch or department scopes with audited access changes.",
    primaryAction: {
      label: "Invite user",
      href: "#invite-user",
      variant: "default",
    },
    secondaryAction: {
      label: "Manage roles",
      href: ROUTES.ADMIN_ROLES,
      variant: "outline",
    },
    supportText:
      "Authorization is permission-based. Roles group backend permission codes; the frontend must not rely on role names alone.",
  },
  [ROUTES.ADMIN_ROLES]: {
    eyebrow: "Admin",
    title: "Roles & permissions",
    description:
      "Define tenant-scoped roles and attach permission codes from the backend catalog.",
    secondaryAction: {
      label: "Open users",
      href: ROUTES.ADMIN_USERS,
      variant: "outline",
    },
    supportText:
      "Permission changes are tenant-scoped and audited. Module access still requires entitlements and setup completion.",
  },
  [ROUTES.MODULE_EMPLOYEES]: {
    eyebrow: "Employees module",
    title: "Employees",
    description: "Manage employee master data for leave, attendance, payroll, and expenses.",
    supportText: "Changes are scoped to your organization and recorded in the audit log.",
  },
  [ROUTES.MODULE_EXPENSES]: {
    eyebrow: "Expenses module",
    title: "Expense claims",
    description:
      "Create, submit, and approve expense claims with workflow status visible at each step.",
    supportText: "Claims follow your organization's approval workflow and are fully auditable.",
  },
  [ROUTES.UNAUTHORIZED]: {
    eyebrow: "Access",
    title: "Unauthorized",
    description: "This workspace area is not available for your current role or permission set.",
    supportText: "Return to the dashboard or contact an administrator if you need access.",
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
  return moduleNavIcons[code];
}
