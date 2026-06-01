"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { formatSubscriptionTimestamp } from "@/domain/models/subscription";
import { useSuperAdminAudit, useTenantAuditLog } from "@/platform/audit/api/audit-queries";
import { useTenants } from "@/platform/tenants/api/tenant-queries";
import { RoleGuard } from "@/security/guards/role-guard";

export function AuditLogsPage({ tenantScoped = false }: { tenantScoped?: boolean }) {
  const searchParams = useSearchParams();
  const initialTenantId = searchParams.get("tenantId") ?? "";
  const [tenantId, setTenantId] = useState(initialTenantId);
  const [actionType, setActionType] = useState(searchParams.get("actionType") ?? "");
  const [entityType, setEntityType] = useState(searchParams.get("entityType") ?? "");
  const [page, setPage] = useState(0);
  const { data: tenants } = useTenants({ page: 0, size: 100 });

  const superAdminQuery = useSuperAdminAudit({
    tenantId: tenantScoped ? tenantId : tenantId || undefined,
    actionType: actionType || undefined,
    page,
  });
  const tenantQuery = useTenantAuditLog(tenantId, page);

  const activeQuery = tenantScoped && tenantId ? tenantQuery : superAdminQuery;
  const rows = useMemo(() => {
    const content = activeQuery.data?.content ?? [];
    if (!entityType.trim()) return content;
    const query = entityType.trim().toLowerCase();
    return content.filter((entry) => {
      const isTenantEntry = "action" in entry;
      const value = isTenantEntry ? entry.entityType : entry.actionType;
      return value?.toLowerCase().includes(query);
    });
  }, [activeQuery.data?.content, entityType]);

  return (
    <RoleGuard
      match="any"
      permissions={["SUPER_ADMIN_AUDIT_READ", "SUPER_ADMIN_ACCESS", "TENANT_VIEW"]}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{tenantScoped ? "Tenant audit log" : "Platform audit log"}</CardTitle>
            <CardDescription>
              Filter sensitive SaaS changes by organization and action type. Entity type filtering
              applies to the current result page.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="audit-tenant-id">Organization</Label>
              {!tenantScoped ? (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  id="audit-tenant-id"
                  onChange={(event) => {
                    setTenantId(event.target.value);
                    setPage(0);
                  }}
                  value={tenantId}
                >
                  <option value="">All organizations</option>
                  {(tenants?.content ?? []).map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.displayName} ({tenant.slug})
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="audit-tenant-id"
                  onChange={(event) => {
                    setTenantId(event.target.value);
                    setPage(0);
                  }}
                  placeholder="Organization ID"
                  value={tenantId}
                />
              )}
            </div>
            {!tenantScoped ? (
              <div className="space-y-2">
                <Label htmlFor="audit-action-type">Action type</Label>
                <Input
                  id="audit-action-type"
                  onChange={(event) => {
                    setActionType(event.target.value);
                    setPage(0);
                  }}
                  placeholder="Optional action filter"
                  value={actionType}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="audit-entity-type">Entity type</Label>
              <Input
                id="audit-entity-type"
                onChange={(event) => {
                  setEntityType(event.target.value);
                  setPage(0);
                }}
                placeholder="Optional entity filter"
                value={entityType}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => activeQuery.refetch()} type="button" variant="outline">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeQuery.isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border bg-card">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : null}

        {activeQuery.isError ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Unable to load audit records</CardTitle>
              <CardDescription>
                {activeQuery.error instanceof Error
                  ? activeQuery.error.message
                  : "Audit API unavailable"}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {!activeQuery.isLoading && !activeQuery.isError ? (
          <Card>
            <CardHeader>
              <CardTitle>Audit entries</CardTitle>
              <CardDescription>
                {rows.length === 0
                  ? "No audit records match the current filters."
                  : `${activeQuery.data?.totalElements ?? rows.length} records`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rows.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Actor / user</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((entry) => {
                        const isTenantEntry = "action" in entry;
                        return (
                          <TableRow key={entry.id}>
                            <TableCell>{formatSubscriptionTimestamp(entry.createdAt)}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {isTenantEntry ? entry.action : entry.actionType}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {isTenantEntry
                                ? entry.userId?.slice(0, 8) ?? "—"
                                : entry.actorUserId.slice(0, 8)}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {isTenantEntry
                                ? entry.tenantId.slice(0, 8)
                                : entry.targetTenantId?.slice(0, 8) ?? "—"}
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                              {isTenantEntry
                                ? entry.details ?? entry.entityType ?? "—"
                                : entry.reason ?? "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      disabled={page <= 0}
                      onClick={() => setPage((current) => Math.max(0, current - 1))}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {page + 1}</span>
                    <Button
                      disabled={(activeQuery.data?.totalPages ?? 1) <= page + 1}
                      onClick={() => setPage((current) => current + 1)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No audit records found.</p>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </RoleGuard>
  );
}
