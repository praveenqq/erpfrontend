import { parseString } from "../common";

export interface NavigationItem {
  code: string;
  label: string;
  path: string;
  icon?: string;
  enabled: boolean;
  blockedReason?: string;
  reasonMessage?: string;
  entitlementStatus?: string;
}

export interface NavigationSnapshot {
  items: NavigationItem[];
  setupProgressPercent: number;
  minimumSetupComplete: boolean;
}

export function parseNavigationItem(raw: unknown): NavigationItem {
  const r = raw as Record<string, unknown>;
  const code = parseString(r.code) || parseString(r.moduleCode);
  const path = parseString(r.path) || parseString(r.routePath);
  const enabled =
    r.enabled !== undefined
      ? r.enabled !== false
      : r.accessible !== false && r.visible !== false;
  return {
    code,
    label: parseString(r.label),
    path,
    icon: typeof r.icon === "string" ? r.icon : undefined,
    enabled,
    blockedReason: parseString(r.blockedReason) || undefined,
    reasonMessage: parseString(r.reasonMessage) || undefined,
    entitlementStatus: parseString(r.entitlementStatus) || undefined,
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

export function findNavigationItemByPath(
  items: NavigationItem[],
  pathname: string,
): NavigationItem | undefined {
  return items.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  );
}
