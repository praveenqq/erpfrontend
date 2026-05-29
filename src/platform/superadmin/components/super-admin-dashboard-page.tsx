"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { ModuleAdoptionChart } from "@/common/components/charts/module-adoption-chart";
import { TenantStatusChart } from "@/common/components/charts/tenant-status-chart";
import { RoleGuard } from "@/security/guards/role-guard";
import { useSuperAdminDashboard } from "@/platform/superadmin/api/dashboard-queries";

export function SuperAdminDashboardPage() {
  const { data: dashboard, isLoading, error } = useSuperAdminDashboard();

  return (
    <RoleGuard
      roles={["SUPER_ADMIN_ACCESS", "SUPER_ADMIN_TENANT_READ"]}
      fallback={
        <p className="text-muted-foreground">You do not have super admin access.</p>
      }
    >
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {error && (
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Failed to load dashboard"}
        </p>
      )}

      {dashboard && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Total tenants", value: dashboard.tenants?.total ?? 0 },
              { label: "Active", value: dashboard.tenants?.active ?? 0 },
              { label: "Suspended", value: dashboard.tenants?.suspended ?? 0 },
              { label: "Active subs", value: dashboard.subscriptions?.active ?? 0 },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="pb-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <CardTitle className="text-3xl">{stat.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tenant status</CardTitle>
              </CardHeader>
              <CardContent>
                <TenantStatusChart
                  data={[
                    { name: "Active", value: dashboard.tenants?.active ?? 0 },
                    { name: "Pending", value: dashboard.tenants?.pending ?? 0 },
                    { name: "Suspended", value: dashboard.tenants?.suspended ?? 0 },
                    { name: "Cancelled", value: dashboard.tenants?.cancelled ?? 0 },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Module adoption</CardTitle>
              </CardHeader>
              <CardContent>
                <ModuleAdoptionChart data={dashboard.moduleAdoption ?? {}} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </RoleGuard>
  );
}
