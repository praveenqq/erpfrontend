import type { LucideIcon } from "lucide-react";

export type ModuleTone =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "secondary";

export interface ModuleAction {
  label: string;
  href?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
}

export interface ModuleMetric {
  label: string;
  value: string;
  trend?: string;
  tone?: ModuleTone;
}

export type WorkspaceNavigationGroup = "platform" | "module" | "admin" | "support";

export interface WorkspaceNavigationItem {
  id: string;
  label: string;
  href: string;
  description: string;
  icon?: LucideIcon;
  role?: string;
  permissions?: string[];
  moduleCode?: string;
  group: WorkspaceNavigationGroup;
  priority?: number;
  disabled?: boolean;
  statusLabel?: string;
  blockedReason?: string;
  blockedReasonCode?: string;
  actionLabel?: string;
  actionHref?: string;
  entitlementStatus?: string;
  source?: "platform" | "backend";
}

export interface ModulePageConfig {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: ModuleAction;
  secondaryAction?: ModuleAction;
  metrics?: ModuleMetric[];
  supportText?: string;
}

export interface PlatformHealthSnapshot {
  activeTenants: number;
  suspendedTenants: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
  failedProvisioningJobs: number;
  pendingOutboxEvents: number;
  failedWebhooks: number;
}

export interface TenantCountsSnapshot {
  total: number;
  active: number;
  suspended: number;
  pending: number;
  cancelled: number;
}

export interface SubscriptionCountsSnapshot {
  active: number;
  trialing: number;
  pastDue: number;
  expired: number;
  cancelled: number;
}

export interface RecentPlatformAction {
  id: string;
  actorUserId: string;
  actionType: string;
  targetTenantId?: string | null;
  createdAt: string;
}

export interface PlatformDashboardSnapshot {
  health: PlatformHealthSnapshot;
  tenants: TenantCountsSnapshot;
  subscriptions: SubscriptionCountsSnapshot;
  moduleAdoption: Record<string, number>;
  recentActions: RecentPlatformAction[];
}
