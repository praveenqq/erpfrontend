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

export interface WorkspaceNavigationItem {
  id: string;
  label: string;
  href: string;
  description: string;
  icon?: LucideIcon;
  role?: string;
  moduleCode?: string;
  group: "platform" | "module" | "admin";
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

export interface PlatformDashboardSnapshot {
  health?: { status?: string; message?: string };
  tenants?: {
    total: number;
    active: number;
    suspended: number;
    pending: number;
    cancelled: number;
  };
  subscriptions?: {
    active: number;
    trialing: number;
    pastDue: number;
    expired: number;
    cancelled: number;
  };
  moduleAdoption?: Record<string, number>;
  recentActions?: Array<{
    id: string;
    actorUserId: string;
    actionType: string;
    targetTenantId?: string;
    createdAt: string;
  }>;
}
