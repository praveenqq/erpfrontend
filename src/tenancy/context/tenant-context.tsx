"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { env, isDevAuth } from "@/common/config/env";
import { useAuth } from "@/security/auth/auth-provider";

interface TenantContextValue {
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

function resolveTenantFromSubdomain(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length >= 3 && parts[0] !== "www" && parts[0] !== "app") {
    return parts[0];
  }
  return null;
}

function resolveTenantFromToken(
  tokenParsed: Record<string, unknown> | undefined,
): string | null {
  const claimTenant =
    (tokenParsed?.tenant_id as string | undefined) ??
    (tokenParsed?.tenantId as string | undefined);
  return claimTenant ?? resolveTenantFromSubdomain() ?? null;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const { keycloak } = useAuth();
  const [manualTenantId, setManualTenantId] = useState<string | null | undefined>(
    undefined,
  );

  const tenantId = useMemo(() => {
    if (manualTenantId !== undefined) return manualTenantId;
    const resolved = resolveTenantFromToken(
      keycloak?.tokenParsed as Record<string, unknown> | undefined,
    );
    if (resolved) return resolved;
    if (isDevAuth()) {
      return process.env.NEXT_PUBLIC_DEV_TENANT_ID ?? "dev-tenant";
    }
    return null;
  }, [manualTenantId, keycloak?.tokenParsed]);

  const setTenantId = (id: string | null) => setManualTenantId(id);

  const value = useMemo(
    () => ({ tenantId, setTenantId }),
    [tenantId],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}

export function getTenantHeaders(tenantId: string | null): HeadersInit {
  if (!tenantId) return {};
  return { [env.tenantHeader]: tenantId };
}
