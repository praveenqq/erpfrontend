"use client";

import { User } from "lucide-react";
import { useAuth } from "@/security/auth/auth-provider";
import { useTenant } from "@/tenancy/context/tenant-context";

export function AppHeader() {
  const { displayName, email } = useAuth();
  const { tenantId } = useTenant();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 lg:px-6">
      <div className="text-sm text-muted-foreground lg:hidden">
        ERP Platform
      </div>
      <div className="hidden text-sm text-muted-foreground lg:block">
        {tenantId ? (
          <>
            Tenant:{" "}
            <span className="font-medium text-foreground">{tenantId}</span>
          </>
        ) : (
          "No tenant context — set via JWT or subdomain"
        )}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>{displayName ?? email ?? "User"}</span>
      </div>
    </header>
  );
}
