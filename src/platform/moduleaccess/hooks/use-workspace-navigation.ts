"use client";

import { useMemo } from "react";
import { Blocks, HelpCircle, Settings, Shield } from "lucide-react";
import { useNavigation } from "@/platform/moduleaccess/api/navigation-queries";
import { useAuth } from "@/security/auth/auth-provider";
import {
  getNavIcon,
  platformNavigationItems,
} from "@/platform/moduleaccess/config/module-registry";
import { resolveBlockedReason } from "@/platform/moduleaccess/config/navigation-blocked-reasons";
import type {
  WorkspaceNavigationGroup,
  WorkspaceNavigationItem,
} from "@/domain/models/workspace";

function inferGroup(path: string): WorkspaceNavigationGroup {
  if (path.startsWith("/super-admin") || path.startsWith("/platform")) {
    return "platform";
  }
  if (path.startsWith("/admin") || path.startsWith("/settings")) return "admin";
  if (path.startsWith("/support") || path.startsWith("/audit")) return "support";
  return "module";
}

function fallbackIcon(group: WorkspaceNavigationGroup) {
  if (group === "platform") return Shield;
  if (group === "admin") return Settings;
  if (group === "support") return HelpCircle;
  return Blocks;
}

function byPriorityThenLabel(a: WorkspaceNavigationItem, b: WorkspaceNavigationItem) {
  return (a.priority ?? 50) - (b.priority ?? 50) || a.label.localeCompare(b.label);
}

function toBackendNavItem(
  item: NonNullable<ReturnType<typeof useNavigation>["data"]>["items"][number],
  index: number,
): WorkspaceNavigationItem {
  const group = inferGroup(item.path);
  const blocked = resolveBlockedReason(item.blockedReason, item.reasonMessage);

  return {
    id: item.code,
    label: item.label,
    href: item.path,
    description: item.enabled
      ? `${item.label} is available for the current workspace.`
      : (blocked?.message ?? `${item.label} is currently blocked.`),
    moduleCode: item.code,
    group,
    icon: getNavIcon(item.code) ?? fallbackIcon(group),
    priority: 30 + index,
    disabled: !item.enabled,
    statusLabel: item.enabled ? "Active" : (blocked?.statusLabel ?? "Blocked"),
    blockedReason: blocked?.message,
    blockedReasonCode: item.blockedReason,
    actionLabel: blocked?.actionLabel,
    actionHref: blocked?.actionHref,
    entitlementStatus: item.entitlementStatus,
    source: "backend",
  };
}

const TENANT_ONLY_SHELL_IDS = new Set(["subscription", "setup"]);
const SUPER_ADMIN_HIDDEN_SHELL_IDS = new Set(["admin-audit"]);

export function useWorkspaceNavigation() {
  const { data, isLoading, isError } = useNavigation();
  const { isSuperAdmin } = useAuth();

  const items = useMemo(() => {
    const backendModuleItems = (data?.items ?? []).map(toBackendNavItem);
    const backendModuleCodes = new Set(backendModuleItems.map((item) => item.moduleCode));

    const shellItems = platformNavigationItems.filter((item) => {
      if (isSuperAdmin && TENANT_ONLY_SHELL_IDS.has(item.id)) {
        return false;
      }
      if (isSuperAdmin && SUPER_ADMIN_HIDDEN_SHELL_IDS.has(item.id)) {
        return false;
      }
      return !item.moduleCode || !backendModuleCodes.has(item.moduleCode);
    });

    return [...shellItems, ...backendModuleItems].sort(byPriorityThenLabel);
  }, [data?.items, isSuperAdmin]);

  const blockedModuleItems = useMemo(
    () =>
      isSuperAdmin
        ? []
        : items.filter((item) => item.group === "module" && item.disabled),
    [items, isSuperAdmin],
  );

  return {
    items,
    blockedModuleItems,
    isLoading,
    isError,
    setupProgress: data?.setupProgressPercent ?? 0,
    minimumSetupComplete: data?.minimumSetupComplete ?? false,
    backendModuleItems: data?.items ?? [],
  };
}
