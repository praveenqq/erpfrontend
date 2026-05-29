import { parseString } from "../common";

export interface NavigationItem {
  code: string;
  label: string;
  path: string;
  icon?: string;
  enabled: boolean;
}

export interface NavigationSnapshot {
  items: NavigationItem[];
  setupProgressPercent: number;
  minimumSetupComplete: boolean;
}

export function parseNavigationItem(raw: unknown): NavigationItem {
  const r = raw as Record<string, unknown>;
  return {
    code: parseString(r.code),
    label: parseString(r.label),
    path: parseString(r.path),
    icon: typeof r.icon === "string" ? r.icon : undefined,
    enabled: r.enabled !== false,
  };
}

export function parseNavigationSnapshot(raw: unknown): NavigationSnapshot {
  const r = raw as Record<string, unknown>;
  const items = Array.isArray(r.items)
    ? r.items.map(parseNavigationItem)
    : [];
  return {
    items,
    setupProgressPercent:
      typeof r.setupProgressPercent === "number" ? r.setupProgressPercent : 0,
    minimumSetupComplete: Boolean(r.minimumSetupComplete),
  };
}
