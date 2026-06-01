"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/common/components/layout/app-header";
import { AppSidebar } from "@/common/components/layout/app-sidebar";
import { isRouteActive } from "@/common/navigation/routes";
import { cn } from "@/common/utils/cn";
import { useWorkspaceNavigation } from "@/platform/moduleaccess/hooks/use-workspace-navigation";
import { useAuth } from "@/security/auth/auth-provider";
import type { WorkspaceNavigationItem } from "@/domain/models/workspace";

/**
 * Authenticated ERP workspace shell with persistent context, responsive primary
 * navigation, and a single wrapper for all platform and tenant module routes.
 */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="min-h-0 flex-1 overflow-auto px-4 py-4 pb-24 lg:px-6 lg:py-6 lg:pb-6">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
}

function canAccessItem(
  item: WorkspaceNavigationItem,
  roles: string[],
  hasAnyPermission: (permissions: string[]) => boolean,
  hasPermission: (permission: string) => boolean,
): boolean {
  if (item.permissions?.length) {
    return hasAnyPermission(item.permissions);
  }
  if (item.role) {
    return roles.includes(item.role) || hasPermission(item.role);
  }
  return true;
}

function MobileNavigation() {
  const pathname = usePathname();
  const { roles, hasAnyPermission, hasPermission } = useAuth();
  const { items } = useWorkspaceNavigation();
  const mobileItems = items
    .filter(
      (item) =>
        canAccessItem(item, roles, hasAnyPermission, hasPermission) && !item.disabled,
    )
    .filter((item) => item.group === "platform" || item.group === "module")
    .slice(0, 5);

  if (mobileItems.length === 0) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-2 py-2 shadow-lg backdrop-blur lg:hidden">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))` }}>
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              className={cn(
                "mx-1 flex min-w-0 flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              href={item.href}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
