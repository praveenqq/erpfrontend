import { ROUTES } from "@/common/navigation/routes";

export interface AuditLinkParams {
  tenantId?: string;
  actionType?: string;
}

export function buildAuditHref(params: AuditLinkParams = {}): string {
  const search = new URLSearchParams();
  if (params.tenantId) search.set("tenantId", params.tenantId);
  if (params.actionType) search.set("actionType", params.actionType);
  const query = search.toString();
  return query ? `${ROUTES.SUPER_ADMIN_AUDIT}?${query}` : ROUTES.SUPER_ADMIN_AUDIT;
}

export function buildTenantAuditHref(tenantId?: string): string {
  if (tenantId) {
    return `${ROUTES.ADMIN_AUDIT}?tenantId=${encodeURIComponent(tenantId)}`;
  }
  return ROUTES.ADMIN_AUDIT;
}
