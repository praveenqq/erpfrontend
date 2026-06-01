"use client";

import { useAuth } from "@/security/auth/auth-provider";
import { UnauthorizedState } from "@/security/components/unauthorized-state";

interface RoleGuardProps {
  roles?: string[];
  permissions?: string[];
  match?: "any" | "all";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({
  roles = [],
  permissions = [],
  match = "any",
  fallback,
  children,
}: RoleGuardProps) {
  const { hasAnyRole, hasAllRoles, hasAnyPermission, hasAllPermissions } = useAuth();

  const roleAllowed =
    roles.length === 0 || (match === "all" ? hasAllRoles(roles) : hasAnyRole(roles));
  const permissionAllowed =
    permissions.length === 0 ||
    (match === "all" ? hasAllPermissions(permissions) : hasAnyPermission(permissions));

  const allowed = roleAllowed && permissionAllowed;
  return allowed ? <>{children}</> : <>{fallback ?? <UnauthorizedState />}</>;
}
