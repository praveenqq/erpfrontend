"use client";

import { useHasRoles } from "@/security/auth/auth-provider";

interface RoleGuardProps {
  roles: string[];
  match?: "any" | "all";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({
  roles,
  match = "any",
  fallback = null,
  children,
}: RoleGuardProps) {
  const allowed = useHasRoles(roles, match);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
