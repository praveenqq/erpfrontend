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
  companyId: string | null;
  tenantSource: "manual" | "token" | "subdomain" | "development" | "none";
  setTenantId: (id: string | null) => void;
  clearTenantOverride: () => void;
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

export function TenantProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [manualTenantId, setManualTenantId] = useState<string | null | undefined>(
    undefined,
  );

  const tenantState = useMemo(() => {
    if (manualTenantId !== undefined) {
      return { tenantId: manualTenantId, tenantSource: "manual" as const };
    }

    if (currentUser.tenantId) {
      return { tenantId: currentUser.tenantId, tenantSource: "token" as const };
    }

    const subdomainTenant = resolveTenantFromSubdomain();
    if (subdomainTenant) {
      return { tenantId: subdomainTenant, tenantSource: "subdomain" as const };
    }

    if (isDevAuth() && process.env.NEXT_PUBLIC_DEV_TENANT_ID) {
      return {
        tenantId: process.env.NEXT_PUBLIC_DEV_TENANT_ID,
        tenantSource: "development" as const,
      };
    }

    return { tenantId: null, tenantSource: "none" as const };
  }, [manualTenantId, currentUser.tenantId]);

  const setTenantId = (id: string | null) => setManualTenantId(id);
  const clearTenantOverride = () => setManualTenantId(undefined);

  const value = useMemo(
    () => ({
      tenantId: tenantState.tenantId,
      companyId: currentUser.companyId,
      tenantSource: tenantState.tenantSource,
      setTenantId,
      clearTenantOverride,
    }),
    [tenantState, currentUser.companyId],
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
