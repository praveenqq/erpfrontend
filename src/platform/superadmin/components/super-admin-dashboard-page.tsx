"use client";

import { Building2, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { ModuleAdoptionChart } from "@/common/components/charts/module-adoption-chart";
import { TenantStatusChart } from "@/common/components/charts/tenant-status-chart";
import { ROUTES } from "@/common/navigation/routes";
import { RoleGuard } from "@/security/guards/role-guard";
import { useSuperAdminDashboard } from "@/platform/superadmin/api/dashboard-queries";
import { DashboardHealthPanel } from "@/platform/superadmin/components/dashboard-health-panel";
import { DashboardMetricCard } from "@/platform/superadmin/components/dashboard-metric-card";
import { DashboardRecentActions } from "@/platform/superadmin/components/dashboard-recent-actions";
import { DashboardSubscriptionPanel } from "@/platform/superadmin/components/dashboard-subscription-panel";
import { AuditLink } from "@/common/components/audit/audit-link";

function DashboardLoadingState() {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-xl border bg-card">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading platform dashboard metrics…
      </div>
    </div>
  );
}

function DashboardErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle>Unable to load platform dashboard</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onRetry} type="button" variant="outline">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

export function SuperAdminDashboardPage() {
  const { data: dashboard, isLoading, error, refetch, isFetching } = useSuperAdminDashboard();

  return (
    <RoleGuard
      permissions={["SUPER_ADMIN_ACCESS", "SUPER_ADMIN_TENANT_READ"]}
      match="any"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <AuditLink label="Platform audit log" variant="button" />
        </div>

        {isLoading ? <DashboardLoadingState /> : null}

        {error ? (
          <DashboardErrorState
            message={error instanceof Error ? error.message : "Failed to load dashboard"}
            onRetry={() => refetch()}
          />
        ) : null}

        {dashboard ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DashboardMetricCard
                description="All organizations on the platform, including operator and customer workspaces"
                href={ROUTES.PLATFORM_TENANTS}
                label="Total organizations"
                value={dashboard.tenants.total}
              />
              <DashboardMetricCard
                description="Customer organizations operating normally"
                href={ROUTES.PLATFORM_TENANTS}
                label="Active organizations"
                tone="success"
                value={dashboard.tenants.active}
              />
              <DashboardMetricCard
                description="Organizations blocked from normal operation"
                href={ROUTES.PLATFORM_TENANTS}
                label="Suspended organizations"
                tone={dashboard.tenants.suspended > 0 ? "warning" : "default"}
                value={dashboard.tenants.suspended}
              />
              <DashboardMetricCard
                description="Active customer subscriptions with billing in good standing"
            href={ROUTES.SUPER_ADMIN_SUBSCRIPTIONS}
            label="Active subscriptions"
                tone="success"
                value={dashboard.subscriptions.active}
              />
            </section>

            <DashboardHealthPanel health={dashboard.health} />

            <DashboardSubscriptionPanel subscriptions={dashboard.subscriptions} />

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Organization status
                      </CardTitle>
                      <CardDescription>
                        Lifecycle distribution across customer and operator organizations.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <TenantStatusChart
                    data={[
                      { name: "Active", value: dashboard.tenants.active },
                      { name: "Pending", value: dashboard.tenants.pending },
                      { name: "Suspended", value: dashboard.tenants.suspended },
                      { name: "Cancelled", value: dashboard.tenants.cancelled },
                    ]}
                  />
                </CardContent>
              </Card>

              <Card id="module-adoption">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>Module adoption</CardTitle>
                      <CardDescription>
                        Enabled or trialing modules across customer organizations.
                      </CardDescription>
                    </div>
                    <Link
                      className="text-sm font-medium text-primary hover:underline"
                      href={ROUTES.SUPER_ADMIN_MODULE_REGISTRY}
                    >
                      Open registry
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <ModuleAdoptionChart data={dashboard.moduleAdoption} />
                </CardContent>
              </Card>
            </div>

            <DashboardRecentActions actions={dashboard.recentActions} />

            {isFetching && !isLoading ? (
              <p className="text-xs text-muted-foreground">Refreshing dashboard data…</p>
            ) : null}
          </>
        ) : null}
      </div>
    </RoleGuard>
  );
}
