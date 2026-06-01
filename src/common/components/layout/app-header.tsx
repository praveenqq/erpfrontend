"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CircleHelp, Plus, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { UserMenu } from "@/common/components/layout/user-menu";
import { ROUTES } from "@/common/navigation/routes";
import { useAuth } from "@/security/auth/auth-provider";
import { useTenantDisplay } from "@/tenancy/hooks/use-tenant-display";
import { GenexLogo } from "@/common/components/brand/genex-logo";
import { WORKSPACE_COPY } from "@/common/copy/workspace-labels";

function getPrimaryRole(roles: string[], permissions: string[]) {
  const access = new Set([...roles, ...permissions]);
  if (
    access.has("SUPER_ADMIN_ACCESS") ||
    roles.includes("PLATFORM_SUPER_ADMIN")
  ) {
    return WORKSPACE_COPY.rolePlatformOperator;
  }
  if (roles.some((role) => role.includes("ADMIN"))) return WORKSPACE_COPY.roleOrgAdmin;
  if (roles.length > 0 || permissions.length > 0) return WORKSPACE_COPY.roleTeamMember;
  return WORKSPACE_COPY.rolePending;
}

export function AppHeader() {
  const router = useRouter();
  const { roles, permissions, isSuperAdmin, hasAnyPermission } = useAuth();
  const { label: tenantLabel, subtitle: tenantSubtitle } = useTenantDisplay();
  const roleLabel = getPrimaryRole(roles, permissions);
  const canViewAudit = hasAnyPermission([
    "SUPER_ADMIN_AUDIT_READ",
    "SUPER_ADMIN_ACCESS",
    "TENANT_VIEW",
  ]);
  const quickCreateHref = isSuperAdmin
    ? ROUTES.SUPER_ADMIN_PROVISIONING
    : ROUTES.ADMIN_SETUP;
  const helpHref = canViewAudit
    ? isSuperAdmin
      ? ROUTES.SUPER_ADMIN_AUDIT
      : ROUTES.ADMIN_AUDIT
    : ROUTES.HOME;
  const notificationsHref = helpHref;

  return (
    <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center border-b bg-background/95 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="lg:hidden">
          <GenexLogo showWordmark size="sm" />
          <p className="mt-0.5 text-xs text-muted-foreground">{roleLabel}</p>
        </div>

        <div className="hidden min-w-0 flex-1 max-w-xl items-center gap-2 rounded-xl border bg-card px-3 py-2 lg:flex">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            aria-label="Search audit log"
            className="h-7 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
            onKeyDown={(event) => {
              if (event.key !== "Enter" || !canViewAudit) return;
              const query = event.currentTarget.value.trim();
              const href = query
                ? `${isSuperAdmin ? ROUTES.SUPER_ADMIN_AUDIT : ROUTES.ADMIN_AUDIT}?actionType=${encodeURIComponent(query)}`
                : helpHref;
              router.push(href);
            }}
            placeholder="Search audit actions, then press Enter…"
            type="search"
          />
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        <Button asChild className="hidden lg:inline-flex" size="sm" type="button">
          <Link href={quickCreateHref}>
            <Plus className="h-4 w-4" />
            Quick create
          </Link>
        </Button>
        <Button aria-label="Recent platform activity" asChild size="icon" type="button" variant="ghost">
          <Link href={notificationsHref}>
            <Bell className="h-4 w-4" />
          </Link>
        </Button>
        <Button aria-label="Help and audit" asChild className="hidden sm:inline-flex" size="icon" type="button" variant="ghost">
          <Link href={helpHref}>
            <CircleHelp className="h-4 w-4" />
          </Link>
        </Button>

        <div className="hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 xl:flex">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin ? "Signed-in workspace" : "Active organization"}
            </p>
            <p className="max-w-48 truncate text-sm font-medium">{tenantLabel}</p>
            {tenantSubtitle ? (
              <p className="max-w-48 truncate text-xs text-muted-foreground">
                {tenantSubtitle}
              </p>
            ) : null}
          </div>
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
