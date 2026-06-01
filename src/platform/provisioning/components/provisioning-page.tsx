"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { DataTable } from "@/common/components/data-table/data-table";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { useDebounce } from "@/common/hooks/use-debounce";
import { ROUTES } from "@/common/navigation/routes";
import { useTenants } from "@/platform/tenants/api/tenant-queries";
import { ProvisionTenantForm } from "@/platform/provisioning/components/provision-tenant-form";
import { provisioningQueueColumns } from "@/platform/provisioning/components/provisioning-columns";
import { usePlatformListMetrics } from "@/platform/superadmin/hooks/use-platform-list-metrics";
import { RoleGuard } from "@/security/guards/role-guard";
import { AuditLink } from "@/common/components/audit/audit-link";

const QUEUE_STATUSES = new Set(["PENDING", "PROVISIONING"]);

export function ProvisioningPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { data, isLoading, error, refetch } = useTenants({
    q: debouncedSearch || undefined,
    page: 0,
    size: 100,
  });
  const { health: metricsHealth, tenants: metricsTenants } = usePlatformListMetrics();
  const metrics = { health: metricsHealth, tenants: metricsTenants };

  const rows = useMemo(() => data?.content ?? [], [data?.content]);

  const queueRows = useMemo(
    () => rows.filter((tenant) => QUEUE_STATUSES.has(tenant.status)),
    [rows],
  );

  const summary = useMemo(() => {
    if (metrics.health && metrics.tenants) {
      return {
        queue: queueRows.length,
        pending: queueRows.filter((tenant) => tenant.status === "PENDING").length,
        provisioning: queueRows.filter((tenant) => tenant.status === "PROVISIONING").length,
        setupIncomplete: metrics.health.failedProvisioningJobs,
      };
    }

    return {
      queue: queueRows.length,
      pending: queueRows.filter((tenant) => tenant.status === "PENDING").length,
      provisioning: queueRows.filter((tenant) => tenant.status === "PROVISIONING").length,
      setupIncomplete: rows.filter(
        (tenant) => tenant.setupStatus && tenant.setupStatus !== "COMPLETED",
      ).length,
    };
  }, [metrics.health, metrics.tenants, queueRows, rows]);

  return (
    <RoleGuard
      match="any"
      permissions={[
        "SUPER_ADMIN_PROVISIONING_MANAGE",
        "SUPER_ADMIN_ACCESS",
        "TENANT_CREATE",
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <AuditLink label="View provisioning audit" variant="button" />
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading onboarding queue…
            </div>
          </div>
        ) : null}

        {error ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Unable to load onboarding data</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Failed to load customer onboarding queue"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => refetch()} type="button" variant="outline">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "In queue", value: summary.queue },
                { label: "Pending", value: summary.pending },
                { label: "Provisioning", value: summary.provisioning },
                { label: "Setup incomplete", value: summary.setupIncomplete },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">{item.value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card id="provision-tenant">
              <CardHeader>
                <CardTitle>Onboard customer organization</CardTitle>
                <CardDescription>
                  Start customer onboarding with plan selection and idempotency protection. Setup runs asynchronously after creation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProvisionTenantForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>Onboarding queue</CardTitle>
                    <CardDescription>
                      Customer organizations pending or actively onboarding. Open a job to inspect the step timeline and retry failures.
                    </CardDescription>
                  </div>
                  <Input
                    aria-label="Search onboarding queue"
                    className="max-w-sm"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search organization name or slug…"
                    value={search}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={provisioningQueueColumns}
                  data={queueRows}
                  emptyMessage="No organizations are currently in the onboarding queue."
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  Need the full organization view?{" "}
                  <Link className="font-medium text-primary hover:underline" href={ROUTES.PLATFORM_TENANTS}>
                    Open organizations
                  </Link>
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </RoleGuard>
  );
}
