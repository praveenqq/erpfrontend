"use client";

import { isDevAuth } from "@/common/config/env";
import { WORKSPACE_COPY } from "@/common/copy/workspace-labels";
import { useTenant as useTenantQuery } from "@/platform/tenants/api/tenant-queries";
import { useAuth } from "@/security/auth/auth-provider";
import { useTenant } from "@/tenancy/context/tenant-context";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string | null): value is string {
  return Boolean(value && UUID_PATTERN.test(value));
}

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function useTenantDisplay() {
  const { tenantId } = useTenant();
  const { isSuperAdmin } = useAuth();
  const devLabel = process.env.NEXT_PUBLIC_DEV_TENANT_NAME ?? "Development organization";
  const shouldFetch = isUuid(tenantId);
  const { data: tenant } = useTenantQuery(shouldFetch ? tenantId : "");

  if (!tenantId) {
    return {
      label: isSuperAdmin ? WORKSPACE_COPY.operatorContextLabel : WORKSPACE_COPY.noWorkspaceSelected,
      subtitle: null as string | null,
    };
  }

  if (isSuperAdmin) {
    return {
      label: WORKSPACE_COPY.operatorContextLabel,
      subtitle: tenant?.displayName ?? titleCaseSlug(tenantId),
    };
  }

  if (isDevAuth() && tenantId === process.env.NEXT_PUBLIC_DEV_TENANT_ID) {
    return { label: devLabel, subtitle: "Development environment" };
  }

  if (tenant?.displayName) {
    return {
      label: tenant.displayName,
      subtitle: tenant.slug ?? null,
    };
  }

  if (!isUuid(tenantId)) {
    return {
      label: titleCaseSlug(tenantId),
      subtitle: tenantId,
    };
  }

  return {
    label: WORKSPACE_COPY.customerContextLabel,
    subtitle: null,
  };
}
