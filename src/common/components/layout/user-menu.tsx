"use client";

import { LogOut, User } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { WORKSPACE_COPY } from "@/common/copy/workspace-labels";
import { useAuth } from "@/security/auth/auth-provider";
import { useTenantDisplay } from "@/tenancy/hooks/use-tenant-display";

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

function getModeLabel(mode: string) {
  if (mode === "super-admin") return WORKSPACE_COPY.platformOperatorMode;
  if (mode === "tenant-admin") return WORKSPACE_COPY.tenantAdminMode;
  if (mode === "tenant-user") return WORKSPACE_COPY.tenantUserMode;
  return "Signed out";
}

export function UserMenu() {
  const { displayName, email, roles, permissions, mode, logout, isSuperAdmin } = useAuth();
  const { label: tenantLabel } = useTenantDisplay();
  const roleLabel = getPrimaryRole(roles, permissions);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open user menu"
          className="h-auto gap-2 rounded-xl border bg-card px-3 py-2"
          type="button"
          variant="ghost"
        >
          <User className="h-4 w-4 text-primary" />
          <div className="hidden leading-tight sm:block">
            <p className="max-w-40 truncate text-left text-sm font-medium">
              {displayName ?? email ?? "User"}
            </p>
            <Badge
              className="mt-1"
              variant={isSuperAdmin ? "default" : "secondary"}
            >
              {roleLabel}
            </Badge>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="space-y-1">
            <p className="truncate text-sm font-semibold">{displayName ?? email ?? "User"}</p>
            {email ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
            <p className="text-xs text-muted-foreground">{getModeLabel(mode)}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {isSuperAdmin ? "Operator workspace" : "Organization"}: {tenantLabel}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
