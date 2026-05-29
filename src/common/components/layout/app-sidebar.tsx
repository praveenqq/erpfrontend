"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/common/utils/cn";
import { isRouteActive } from "@/common/navigation/routes";
import { ThemeToggle } from "@/common/components/layout/theme-toggle";
import { useAuth } from "@/security/auth/auth-provider";
import { useWorkspaceNavigation } from "@/platform/moduleaccess/hooks/use-workspace-navigation";
import type { WorkspaceNavigationItem } from "@/domain/models/workspace";

function canAccessItem(
  item: WorkspaceNavigationItem,
  roles: string[],
): boolean {
  return !item.role || roles.includes(item.role);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { items } = useWorkspaceNavigation();
  const { logout, roles } = useAuth();

  const platformItems = items.filter(
    (i) => i.group === "platform" && canAccessItem(i, roles),
  );
  const moduleItems = items.filter(
    (i) => i.group === "module" && canAccessItem(i, roles),
  );
  const adminItems = items.filter(
    (i) => i.group === "admin" && canAccessItem(i, roles),
  );

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r bg-card lg:flex">
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <div className="mb-4 flex shrink-0 items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3">
          <div>
            <p className="text-lg font-semibold">ERP</p>
            <p className="text-xs text-muted-foreground">Multi-tenant platform</p>
          </div>
          <ThemeToggle />
        </div>

        <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          <NavSection title="Platform" items={platformItems} pathname={pathname} />
          {moduleItems.length > 0 && (
            <NavSection title="Modules" items={moduleItems} pathname={pathname} />
          )}
          {adminItems.length > 0 && (
            <NavSection title="Admin" items={adminItems} pathname={pathname} />
          )}
        </nav>

        <div className="mt-4 shrink-0 border-t pt-4">
          <button
            type="button"
            onClick={logout}
            className="block w-full rounded-xl px-4 py-3 text-left transition hover:bg-destructive/10"
          >
            <div className="text-sm font-semibold text-destructive">Sign out</div>
            <div className="mt-1 text-xs text-muted-foreground">
              End your session securely
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: WorkspaceNavigationItem[];
  pathname: string;
}) {
  return (
    <div>
      <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            isActive={isRouteActive(pathname, item.href)}
          />
        ))}
      </div>
    </div>
  );
}

function SidebarNavItem({
  item,
  isActive,
}: {
  item: WorkspaceNavigationItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "block rounded-xl px-4 py-3 transition",
        isActive
          ? "bg-accent font-medium text-accent-foreground"
          : "hover:bg-accent/60",
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
        {item.label}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
    </Link>
  );
}
