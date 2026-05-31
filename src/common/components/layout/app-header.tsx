"use client";

import {
  Bell,
  CircleHelp,
  Plus,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { useAuth } from "@/security/auth/auth-provider";
import { useTenantDisplay } from "@/tenancy/hooks/use-tenant-display";
import { GenexLogo } from "@/common/components/brand/genex-logo";

function getPrimaryRole(roles: string[]) {
  if (roles.includes("SUPER_ADMIN_ACCESS")) return "Super Admin";
  if (roles.some((role) => role.includes("ADMIN"))) return "Tenant Admin";
  if (roles.length > 0) return "Employee";
  return "No role assigned";
}

export function AppHeader() {
  const { displayName, email, roles } = useAuth();
  const { label: tenantLabel, subtitle: tenantSubtitle } = useTenantDisplay();
  const roleLabel = getPrimaryRole(roles);

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
            aria-label="Global search"
            className="h-7 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
            placeholder="Search tenants, subscriptions, modules, records..."
            type="search"
          />
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        <Button className="hidden lg:inline-flex" size="sm" type="button">
          <Plus className="h-4 w-4" />
          Quick create
        </Button>
        <Button aria-label="Notifications" size="icon" type="button" variant="ghost">
          <Bell className="h-4 w-4" />
        </Button>
        <Button aria-label="Help" className="hidden sm:inline-flex" size="icon" type="button" variant="ghost">
          <CircleHelp className="h-4 w-4" />
        </Button>

        <div className="hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 xl:flex">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Tenant context</p>
            <p className="max-w-48 truncate text-sm font-medium">{tenantLabel}</p>
            {tenantSubtitle ? (
              <p className="max-w-48 truncate text-xs text-muted-foreground">
                {tenantSubtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
          <User className="h-4 w-4 text-primary" />
          <div className="hidden leading-tight sm:block">
            <p className="max-w-40 truncate text-sm font-medium">
              {displayName ?? email ?? "User"}
            </p>
            <Badge className="mt-1" variant={roleLabel === "Super Admin" ? "default" : "secondary"}>
              {roleLabel}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
