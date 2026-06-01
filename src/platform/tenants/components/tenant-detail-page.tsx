"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import {
  formatTenantTypeLabel,
  isNonBillableTenantType,
  WORKSPACE_COPY,
} from "@/common/copy/workspace-labels";
import { ROUTES } from "@/common/navigation/routes";
import {
  formatSubscriptionStatus,
  formatSubscriptionTimestamp,
  formatSubscriptionPrice,
  subscriptionAllowsAccess,
} from "@/domain/models/subscription";
import {
  formatTenantStatus,
  formatTenantTimestamp,
  healthStatusVariant,
  tenantStatusVariant,
} from "@/domain/models/tenant";
import { formatProvisioningStatus } from "@/domain/models/provisioning";
import { useSubscriptionUsage } from "@/platform/subscriptions/api/subscription-queries";
import { useProvisioningStatus } from "@/platform/provisioning/api/provisioning-queries";
import {
  useTenant360,
  useTenantAuditLogs,
  useTenantStatusHistory,
} from "@/platform/tenants/api/tenant-queries";
import { TenantModuleAccessPanel } from "@/platform/tenants/components/tenant-module-access-panel";
import { TenantStatusActions } from "@/platform/tenants/components/tenant-status-actions";
import { AuditLink } from "@/common/components/audit/audit-link";
import { RoleGuard } from "@/security/guards/role-guard";

export function TenantDetailPage({ id }: { id: string }) {
  const { data: snapshot, isLoading, error } = useTenant360(id);
  const subscriptionId = snapshot?.currentSubscription?.id ?? "";
  const { data: usage } = useSubscriptionUsage(subscriptionId);
  const { data: provisioning } = useProvisioningStatus(id);
  const { data: statusHistory } = useTenantStatusHistory(id);
  const { data: auditLogs } = useTenantAuditLogs(id);

  if (isLoading) {
  return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading organization…
        </div>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Organization not found</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Unable to load this organization."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={ROUTES.PLATFORM_TENANTS}>Back to organizations</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { summary, currentSubscription, setupProgress } = snapshot;
  const isOperatorWorkspace = isNonBillableTenantType(summary.type);
  const accessLabel = isOperatorWorkspace
    ? WORKSPACE_COPY.operatorPlanLabel
    : currentSubscription
      ? subscriptionAllowsAccess(currentSubscription.status)
        ? "Allowed"
        : "Blocked"
      : WORKSPACE_COPY.customerUnassignedStatus;

  return (
    <RoleGuard
      match="any"
      permissions={["TENANT_VIEW", "SUPER_ADMIN_ACCESS", "SUPER_ADMIN_TENANT_READ"]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.PLATFORM_TENANTS}>
              <ArrowLeft className="h-4 w-4" />
              Back to organizations
            </Link>
          </Button>
          <Badge variant={tenantStatusVariant(snapshot.status)}>
            {formatTenantStatus(snapshot.status)}
          </Badge>
          <Badge variant="secondary">{formatTenantStatus(snapshot.setupStatus)} setup</Badge>
          {summary.healthStatus ? (
            <Badge variant={healthStatusVariant(summary.healthStatus)}>
              {summary.healthStatus}
            </Badge>
          ) : null}
          {snapshot.status === "PENDING" || snapshot.status === "PROVISIONING" ? (
            <Button asChild size="sm" variant="outline">
              <Link href={ROUTES.SUPER_ADMIN_PROVISIONING_DETAIL(id)}>
                <ExternalLink className="h-4 w-4" />
                View provisioning job
              </Link>
            </Button>
          ) : null}
          <AuditLink tenantId={id} label="Full audit log" variant="button" />
        </div>

        <Card className="border-primary/20 bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle>Organization support view</CardTitle>
            <CardDescription>
              Read-only summary for customer support: billing, setup, modules, usage, and recent activity.
              Lifecycle changes are available in the sections below and are recorded in the audit log.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-3">
            <p>
              <span className="text-muted-foreground">Health:</span>{" "}
              {summary.healthStatus ?? "Unknown"}
            </p>
            <p>
              <span className="text-muted-foreground">Provisioning:</span>{" "}
              {provisioning
                ? formatProvisioningStatus(provisioning.status)
                : snapshot.status === "PENDING" || snapshot.status === "PROVISIONING"
                  ? "In progress"
                  : "Complete"}
            </p>
            <p>
              <span className="text-muted-foreground">Recent audit entries:</span>{" "}
              {(auditLogs?.content.length ?? snapshot.recentAuditLogs.length).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Plan", value: summary.planCode ?? "—" },
            {
              label: "Subscription",
              value: summary.subscriptionStatus
                ? formatSubscriptionStatus(summary.subscriptionStatus as never)
                : "—",
            },
            { label: "Enabled modules", value: summary.enabledModuleCount },
            { label: "Setup progress", value: `${setupProgress.setupProgressPercent}%` },
            {
              label: "Access",
              value: accessLabel,
            },
          ].map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="text-xl">{item.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Organization profile</CardTitle>
              <CardDescription>Identity, locale defaults, and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-2">
              <p><span className="text-muted-foreground">Display name:</span> {snapshot.displayName}</p>
              <p><span className="text-muted-foreground">Legal name:</span> {snapshot.legalName}</p>
              <p><span className="text-muted-foreground">Slug:</span> {snapshot.slug}</p>
              <p><span className="text-muted-foreground">Type:</span> {formatTenantTypeLabel(summary.type)}</p>
              <p><span className="text-muted-foreground">Created:</span> {formatTenantTimestamp(summary.createdAt)}</p>
              <p><span className="text-muted-foreground">Tenant ID:</span> <span className="font-mono text-xs">{snapshot.tenantId}</span></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setup progress</CardTitle>
              <CardDescription>
                {setupProgress.minimumSetupComplete
                  ? "Minimum setup complete."
                  : "Minimum setup still pending."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Completed:</span>{" "}
                {setupProgress.completedSteps.length > 0
                  ? setupProgress.completedSteps.join(", ")
                  : "None"}
              </p>
              <p>
                <span className="text-muted-foreground">Pending:</span>{" "}
                {setupProgress.pendingSteps.length > 0
                  ? setupProgress.pendingSteps.join(", ")
                  : "None"}
              </p>
              {setupProgress.blockingSteps.length > 0 ? (
                <p className="text-amber-700 dark:text-amber-400">
                  <span className="font-medium">Blocking:</span>{" "}
                  {setupProgress.blockingSteps.join(", ")}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Plan and billing</CardTitle>
                <CardDescription>
                  {isOperatorWorkspace
                    ? "Platform operator workspaces are not billed and do not require a customer plan."
                    : "Commercial plan and billing status for this customer organization."}
                </CardDescription>
              </div>
              {currentSubscription ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={ROUTES.SUPER_ADMIN_SUBSCRIPTION_DETAIL(currentSubscription.id)}>
                    <ExternalLink className="h-4 w-4" />
                    Manage subscription
                  </Link>
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {currentSubscription ? (
                <>
                  <p>
                    <span className="text-muted-foreground">Plan:</span>{" "}
                    {currentSubscription.planName ?? currentSubscription.planCode ?? currentSubscription.planId}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    {formatSubscriptionStatus(currentSubscription.status)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Price:</span>{" "}
                    {formatSubscriptionPrice(currentSubscription)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Period end:</span>{" "}
                    {formatSubscriptionTimestamp(currentSubscription.currentPeriodEnd)}
                  </p>
                </>
              ) : isOperatorWorkspace ? (
                <p className="text-muted-foreground">{WORKSPACE_COPY.operatorPlanHint}</p>
              ) : (
                <p className="text-muted-foreground">{WORKSPACE_COPY.customerUnassignedPlan}. Assign a plan to enable module access.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <TenantModuleAccessPanel tenantId={id} tenantType={summary.type} />

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Current usage counters against plan limits.</CardDescription>
          </CardHeader>
          <CardContent>
            {usage && usage.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Counter</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.map((item) => (
                    <TableRow key={`${item.counterCode}-${item.periodKey}`}>
                      <TableCell>{item.counterCode}</TableCell>
                      <TableCell>{item.currentValue.toLocaleString()}</TableCell>
                      <TableCell>{item.limitValue.toLocaleString()}</TableCell>
                      <TableCell>{item.periodKey}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                {currentSubscription
                  ? "No usage counters recorded."
                  : "Usage appears once a subscription is assigned."}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle status</CardTitle>
              <CardDescription>
                Update tenant status with a required reason. Changes are backend-controlled and audited.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TenantStatusActions currentStatus={snapshot.status} tenantId={id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status history</CardTitle>
              <CardDescription>Recent tenant lifecycle transitions.</CardDescription>
            </CardHeader>
            <CardContent>
              {statusHistory && statusHistory.content.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Change</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statusHistory.content.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {entry.oldStatus ?? "—"} → {entry.newStatus}
                        </TableCell>
                        <TableCell>{entry.reason ?? "—"}</TableCell>
                        <TableCell>{formatTenantTimestamp(entry.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No status history recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Audit trail</CardTitle>
            <CardDescription>
              Recent tenant-scoped actions. Full audit search is available in the audit module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(auditLogs?.content.length ?? snapshot.recentAuditLogs.length) > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(auditLogs?.content ?? snapshot.recentAuditLogs).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.action}</p>
                          {entry.details ? (
                            <p className="text-xs text-muted-foreground">{entry.details}</p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {entry.entityType ?? "—"}
                        {entry.entityId ? ` · ${entry.entityId.slice(0, 8)}` : ""}
                      </TableCell>
                      <TableCell>{formatTenantTimestamp(entry.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No audit entries recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
