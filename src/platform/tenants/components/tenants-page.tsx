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
import {
  TENANT_STATUS_FILTERS,
  useTenants,
} from "@/platform/tenants/api/tenant-queries";
import { tenantColumns } from "@/platform/tenants/components/tenant-columns";
import { usePlatformListMetrics } from "@/platform/superadmin/hooks/use-platform-list-metrics";
import { RoleGuard } from "@/security/guards/role-guard";
import { AuditLink } from "@/common/components/audit/audit-link";

export function TenantsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof TENANT_STATUS_FILTERS)[number]["id"]>("ALL");
  const debouncedSearch = useDebounce(search);

  const queryStatus = statusFilter === "ALL" ? undefined : statusFilter;
  const { data, isLoading, error, refetch } = useTenants({
    q: debouncedSearch || undefined,
    status: queryStatus,
    page: 0,
    size: 100,
  });
  const { tenants: dashboardTenants, health } = usePlatformListMetrics();

  const rows = useMemo(() => data?.content ?? [], [data?.content]);

  const summary = useMemo(() => {
    if (dashboardTenants) {
      return {
        total: dashboardTenants.total,
        active: dashboardTenants.active,
        provisioning: dashboardTenants.pending,
        blocked: dashboardTenants.suspended + dashboardTenants.cancelled,
        setupIncomplete: health?.failedProvisioningJobs ?? 0,
      };
    }

    return {
      total: data?.totalElements ?? rows.length,
      active: rows.filter((tenant) => tenant.status === "ACTIVE").length,
      provisioning: rows.filter((tenant) => tenant.status === "PROVISIONING").length,
      blocked: rows.filter(
        (tenant) => tenant.status === "SUSPENDED" || tenant.status === "CANCELLED",
      ).length,
      setupIncomplete: rows.filter(
        (tenant) => tenant.setupStatus && tenant.setupStatus !== "COMPLETED",
      ).length,
    };
  }, [dashboardTenants, data?.totalElements, health?.failedProvisioningJobs, rows]);

  return (
    <RoleGuard
      match="any"
      permissions={["TENANT_VIEW", "SUPER_ADMIN_ACCESS", "SUPER_ADMIN_TENANT_READ"]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <AuditLink label="View organization audit" variant="button" />
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading organizations…
            </div>
          </div>
        ) : null}

        {error ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Unable to load organizations</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Failed to load organization directory"}
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                { label: "Total organizations", value: summary.total },
                { label: "Active", value: summary.active },
                { label: "Provisioning", value: summary.provisioning },
                { label: "Access blocked", value: summary.blocked },
                { label: "Onboarding backlog", value: summary.setupIncomplete },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">{item.value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Onboard a customer</CardTitle>
                <CardDescription>
                  Create a customer organization with plan selection, idempotency protection, and step-by-step onboarding tracking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={ROUTES.SUPER_ADMIN_PROVISIONING}>Open customer onboarding</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>Organization directory</CardTitle>
                    <CardDescription>
                      Search organizations with lifecycle status, setup progress, and contact context.
                    </CardDescription>
                  </div>
                  <Input
                    aria-label="Search organizations"
                    className="max-w-sm"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, slug, or email…"
                    value={search}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {TENANT_STATUS_FILTERS.map((filter) => (
                    <Button
                      key={filter.id}
                      onClick={() => setStatusFilter(filter.id)}
                      size="sm"
                      type="button"
                      variant={statusFilter === filter.id ? "default" : "outline"}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={tenantColumns}
                  data={rows}
                  emptyMessage="No organizations match the current filters."
                />
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </RoleGuard>
  );
}
