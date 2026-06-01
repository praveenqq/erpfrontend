"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { DataTable } from "@/common/components/data-table/data-table";
import { ROUTES } from "@/common/navigation/routes";
import { useDebounce } from "@/common/hooks/use-debounce";
import type { PlanStatus } from "@/domain/models/plan";
import { usePlans } from "@/platform/plans/api/plan-queries";
import { CreatePlanForm } from "@/platform/plans/components/create-plan-form";
import { planColumns } from "@/platform/plans/components/plan-columns";
import { RoleGuard } from "@/security/guards/role-guard";
import { AuditLink } from "@/common/components/audit/audit-link";

const STATUS_FILTERS: Array<{ id: "ALL" | PlanStatus; label: string }> = [
  { id: "ALL", label: "All statuses" },
  { id: "DRAFT", label: "Draft" },
  { id: "ACTIVE", label: "Active" },
  { id: "DEPRECATED", label: "Deprecated" },
  { id: "ARCHIVED", label: "Archived" },
];

export function PlansPage() {
  const { data, isLoading, error, refetch, isFetching } = usePlans();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]["id"]>("ALL");
  const debouncedSearch = useDebounce(search);

  const filteredPlans = useMemo(() => {
    return (data ?? [])
      .filter((plan) => {
        if (statusFilter !== "ALL" && plan.status !== statusFilter) return false;
        if (!debouncedSearch.trim()) return true;
        const query = debouncedSearch.trim().toLowerCase();
        return (
          plan.code.toLowerCase().includes(query) ||
          plan.name.toLowerCase().includes(query) ||
          plan.planType.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data, debouncedSearch, statusFilter]);

  const summary = useMemo(() => {
    const plans = data ?? [];
    return {
      total: plans.length,
      draft: plans.filter((plan) => plan.status === "DRAFT").length,
      active: plans.filter((plan) => plan.status === "ACTIVE").length,
      deprecated: plans.filter((plan) => plan.status === "DEPRECATED").length,
    };
  }, [data]);

  return (
    <RoleGuard permissions={["PLAN_VIEW_INTERNAL", "SUPER_ADMIN_ACCESS"]} match="any">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <AuditLink label="View plan audit log" variant="button" />
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading commercial plans…
            </div>
          </div>
        ) : null}

        {error ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Unable to load plans</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Failed to load plan catalog"}
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

        {data ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total plans", value: summary.total },
                { label: "Draft", value: summary.draft },
                { label: "Active", value: summary.active },
                { label: "Deprecated", value: summary.deprecated },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">{item.value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card id="create-plan">
              <CardHeader>
                <CardTitle>Create plan</CardTitle>
                <CardDescription>
                  Define a new commercial package before pricing, limits, and module mapping.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreatePlanForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>Plan catalog</CardTitle>
                    <CardDescription>
                      Review plan lifecycle status, pricing, limits, and visibility before subscriptions use them.
                    </CardDescription>
                  </div>
                  <Input
                    aria-label="Search plans"
                    className="max-w-sm"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by code, name, or type…"
                    value={search}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((filter) => (
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
                  columns={planColumns}
                  data={filteredPlans}
                  emptyMessage="No plans match the current filters."
                />
                {isFetching && !isLoading ? (
                  <p className="mt-3 text-xs text-muted-foreground">Refreshing plan catalog…</p>
                ) : null}
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground">
              Module mapping for each plan is managed in the next step. Open a plan to configure pricing, limits, and lifecycle actions.
              {" "}
              <Link className="font-medium text-primary hover:underline" href={ROUTES.SUPER_ADMIN_MODULE_REGISTRY}>
                View module registry
              </Link>
            </p>
          </>
        ) : null}
      </div>
    </RoleGuard>
  );
}
