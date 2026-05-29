"use client";

import { useMemo } from "react";
import { useNavigation } from "@/platform/moduleaccess/api/navigation-queries";
import { platformNavigationItems } from "@/platform/moduleaccess/config/module-registry";
import type { WorkspaceNavigationItem } from "@/domain/models/workspace";

export function useWorkspaceNavigation() {
  const { data, isLoading } = useNavigation();

  const items = useMemo(() => {
    const serverItems = data?.items?.filter((i) => i.enabled) ?? [];
    const dynamic: WorkspaceNavigationItem[] = serverItems
      .filter(
        (item) =>
          !platformNavigationItems.some(
            (p) => p.href === item.path || p.moduleCode === item.code,
          ),
      )
      .map((item) => ({
        id: item.code,
        label: item.label,
        href: item.path,
        description: item.label,
        moduleCode: item.code,
        group: "module" as const,
      }));

    return [...platformNavigationItems, ...dynamic];
  }, [data?.items]);

  return {
    items,
    isLoading,
    setupProgress: data?.setupProgressPercent ?? 0,
    minimumSetupComplete: data?.minimumSetupComplete ?? false,
  };
}
