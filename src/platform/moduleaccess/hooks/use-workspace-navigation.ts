"use client";

import { useMemo } from "react";
import { Blocks, HelpCircle, Settings, Shield } from "lucide-react";
import { useNavigation } from "@/platform/moduleaccess/api/navigation-queries";
import {
  getNavIcon,
  platformNavigationItems,
} from "@/platform/moduleaccess/config/module-registry";
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

export function useWorkspaceNavigation() {
  const { data, isLoading, isError } = useNavigation();

  const items = useMemo(() => {
    const dynamic: WorkspaceNavigationItem[] = (data?.items ?? [])
      .filter(
        (item) =>
          !platformNavigationItems.some(
            (p) => p.href === item.path || p.moduleCode === item.code,
          ),
      )
      .map((item, index) => {
        const group = inferGroup(item.path);
        return {
          id: item.code,
          label: item.label,
          href: item.path,
          description: item.enabled
            ? `${item.label} is available for the current workspace.`
            : `${item.label} is currently blocked by entitlement, setup, or permission rules.`,
          moduleCode: item.code,
          group,
          icon: getNavIcon(item.code) ?? fallbackIcon(group),
          priority: 30 + index,
          disabled: !item.enabled,
          statusLabel: item.enabled ? "Active" : "Blocked",
          blockedReason: item.enabled
            ? undefined
            : "Access is controlled by backend entitlement and permission rules.",
          source: "backend" as const,
        };
      });

    return [...platformNavigationItems, ...dynamic].sort(byPriorityThenLabel);
  }, [data?.items]);

  return {
    items,
    isLoading,
    isError,
    setupProgress: data?.setupProgressPercent ?? 0,
    minimumSetupComplete: data?.minimumSetupComplete ?? false,
  };
}
