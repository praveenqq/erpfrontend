"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, LogOut } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { ThemeToggle } from "@/common/components/layout/theme-toggle";
import { GenexLogo } from "@/common/components/brand/genex-logo";
import { cn } from "@/common/utils/cn";
import { isRouteActive } from "@/common/navigation/routes";
import { useAuth } from "@/security/auth/auth-provider";
import { useWorkspaceNavigation } from "@/platform/moduleaccess/hooks/use-workspace-navigation";
import type { WorkspaceNavigationItem } from "@/domain/models/workspace";

function canAccessItem(item: WorkspaceNavigationItem, roles: string[]): boolean {
  return !item.role || roles.includes(item.role);
}

function getRoleMode(roles: string[]) {
  if (roles.includes("SUPER_ADMIN_ACCESS")) return "Super Admin Mode";
  if (roles.some((role) => role.includes("ADMIN"))) return "Tenant Admin Mode";
  return "Tenant User Mode";
}

export function AppSidebar() {
  const pathname = usePathname();
  const { items, isLoading, isError, setupProgress, minimumSetupComplete } =
    useWorkspaceNavigation();
  const { logout, roles } = useAuth();

  const visibleItems = items.filter((item) => canAccessItem(item, roles));
  const platformItems = visibleItems.filter((item) => item.group === "platform");
  const moduleItems = visibleItems.filter((item) => item.group === "module");
  const supportItems = visibleItems.filter((item) => item.group === "support");
  const adminItems = visibleItems.filter((item) => item.group === "admin");

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-r bg-card lg:flex">
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <div className="mb-4 shrink-0 rounded-2xl border bg-gradient-to-br from-primary to-teal-900 p-4 text-primary-foreground shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <GenexLogo size="md" variant="onPrimary" />
            <ThemeToggle />
          </div>
          <div className="mt-4 rounded-xl bg-white/10 p-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-primary-foreground/75">Workspace mode</span>
              <Badge className="border-white/20 bg-white/15 text-primary-foreground" variant="outline">
                {getRoleMode(roles)}
              </Badge>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-emerald-300"
                style={{ width: `${Math.min(Math.max(setupProgress, 0), 100)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-primary-foreground/80">
              {minimumSetupComplete ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-300" />
              )}
              <span>{minimumSetupComplete ? "Minimum setup complete" : "Setup attention required"}</span>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <NavigationStatus isError={isError} isLoading={isLoading} />
          <NavSection title="Primary navigation" items={platformItems} pathname={pathname} />
          {moduleItems.length > 0 && (
            <NavSection title="Active business modules" items={moduleItems} pathname={pathname} />
          )}
          {supportItems.length > 0 && (
            <NavSection title="Support and audit" items={supportItems} pathname={pathname} />
          )}
          {adminItems.length > 0 && (
            <NavSection title="Administration" items={adminItems} pathname={pathname} />
          )}
        </nav>

        <div className="mt-4 shrink-0 border-t pt-4">
          <button
            type="button"
            onClick={logout}
            className="block w-full rounded-xl border border-transparent px-4 py-3 text-left transition hover:border-destructive/20 hover:bg-destructive/10"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </div>
            <div className="mt-1 text-xs text-muted-foreground">End the current GENEX session securely</div>
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavigationStatus({ isError, isLoading }: { isError: boolean; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading backend navigation rules
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Navigation API is unavailable. Showing shell-level routes only.
      </div>
    );
  }

  return null;
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
  if (items.length === 0) return null;

  return (
    <section>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
    </section>
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
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
          <span className="truncate">{item.label}</span>
        </div>
        {item.statusLabel ? (
          <Badge variant={item.disabled ? "warning" : "success"}>{item.statusLabel}</Badge>
        ) : null}
      </div>
      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
        {item.blockedReason ?? item.description}
      </div>
    </>
  );

  const className = cn(
    "block rounded-xl border px-4 py-3 text-left transition",
    isActive
      ? "border-primary/20 bg-primary/10 text-primary shadow-sm"
      : "border-transparent hover:border-border hover:bg-accent/70",
    item.disabled && "cursor-not-allowed opacity-70 hover:border-transparent hover:bg-transparent",
  );

  if (item.disabled) {
    return (
      <div aria-disabled="true" className={className} title={item.blockedReason}>
        {content}
      </div>
    );
  }

  return (
    <Link className={className} href={item.href}>
      {content}
    </Link>
  );
}
