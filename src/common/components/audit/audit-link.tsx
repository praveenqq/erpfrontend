import Link from "next/link";
import { FileSearch } from "lucide-react";
import { buildAuditHref, buildTenantAuditHref, type AuditLinkParams } from "@/common/navigation/audit-routes";
import { Button } from "@/common/components/ui/button";
import { useAuth } from "@/security/auth/auth-provider";

interface AuditLinkProps extends AuditLinkParams {
  label?: string;
  variant?: "link" | "button";
  tenantScoped?: boolean;
}

export function AuditLink({
  label = "View audit log",
  variant = "link",
  tenantScoped = false,
  tenantId,
  actionType,
}: AuditLinkProps) {
  const { hasAnyPermission } = useAuth();
  const canView = hasAnyPermission([
    "SUPER_ADMIN_AUDIT_READ",
    "SUPER_ADMIN_ACCESS",
    "TENANT_VIEW",
  ]);

  if (!canView) return null;

  const href = tenantScoped
    ? buildTenantAuditHref(tenantId)
    : buildAuditHref({ tenantId, actionType });

  if (variant === "button") {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href={href}>
          <FileSearch className="mr-1 h-4 w-4" />
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <Link className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline" href={href}>
      <FileSearch className="h-4 w-4" />
      {label}
    </Link>
  );
}
