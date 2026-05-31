"use client";

import { ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { useAuth } from "@/security/auth/auth-provider";

interface RoleGuardProps {
  roles?: string[];
  permissions?: string[];
  match?: "any" | "all";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

function DefaultUnauthorizedState() {
  return (
    <Card className="border-amber-200 bg-amber-50/70 text-amber-950 shadow-sm">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="rounded-full bg-amber-100 p-2 text-amber-700">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Access restricted</CardTitle>
          <CardDescription className="text-amber-800/80">
            Your current role or permission set does not allow this action. Contact an administrator if this access is required for your work.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-amber-800/90">
        This area is protected by the same role and permission context used by the backend, so unavailable actions are blocked before a request is sent.
      </CardContent>
    </Card>
  );
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
  return allowed ? <>{children}</> : <>{fallback ?? <DefaultUnauthorizedState />}</>;
}
