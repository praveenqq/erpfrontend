"use client";

import { useMemo, useState } from "react";
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
import { useDebounce } from "@/common/hooks/use-debounce";
import type { SubscriptionStatus } from "@/domain/models/subscription";
import { useSubscriptionDirectory } from "@/platform/subscriptions/api/subscription-queries";
import { CreateSubscriptionForm } from "@/platform/subscriptions/components/create-subscription-form";
import { subscriptionDirectoryColumns } from "@/platform/subscriptions/components/subscription-columns";
import { RoleGuard } from "@/security/guards/role-guard";
import { AuditLink } from "@/common/components/audit/audit-link";
import { isNonBillableTenantType, WORKSPACE_COPY } from "@/common/copy/workspace-labels";

const STATUS_FILTERS: Array<{ id: "ALL" | SubscriptionStatus | "NONE"; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "TRIALING", label: "Trialing" },
  { id: "PAST_DUE", label: "Past due" },
  { id: "SUSPENDED", label: "Suspended" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "NONE", label: "Awaiting subscription" },
];

export function SubscriptionsPage() {
  const { rows, metrics, isLoading, error, refetch } = useSubscriptionDirectory();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]["id"]>("ALL");
  const debouncedSearch = useDebounce(search);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter === "NONE" && row.subscription) return false;
      if (statusFilter !== "ALL" && statusFilter !== "NONE" && row.subscription?.status !== statusFilter) {
        return false;
      }
      if (!debouncedSearch.trim()) return true;
      const query = debouncedSearch.trim().toLowerCase();
      return (
        row.tenantName.toLowerCase().includes(query) ||
        row.tenantSlug.toLowerCase().includes(query) ||
        row.subscription?.planName?.toLowerCase().includes(query) ||
        row.subscription?.planCode?.toLowerCase().includes(query) ||
        row.subscription?.status.toLowerCase().includes(query)
      );
    });
  }, [rows, debouncedSearch, statusFilter]);

  const summary = useMemo(() => {
    const customerRows = rows.filter((row) => !isNonBillableTenantType(row.tenantType));
    const subscriptions = customerRows.map((row) => row.subscription).filter(Boolean);
    const computed = {
      organizations: rows.length,
      customers: customerRows.length,
      assigned: subscriptions.length,
      active: subscriptions.filter((item) => item?.status === "ACTIVE").length,
      trialing: subscriptions.filter((item) => item?.status === "TRIALING").length,
      blocked: subscriptions.filter(
        (item) => item && !["ACTIVE", "TRIALING", "GRACE_PERIOD", "PAST_DUE"].includes(item.status),
      ).length,
      awaiting: customerRows.filter((row) => !row.subscription).length,
    };

    if (metrics.tenants && metrics.subscriptions) {
      return {
        organizations: metrics.tenants.total,
        customers: metrics.tenants.total,
        assigned: metrics.subscriptions.active + metrics.subscriptions.trialing,
        active: metrics.subscriptions.active,
        trialing: metrics.subscriptions.trialing,
        blocked: metrics.subscriptions.pastDue + metrics.subscriptions.expired + metrics.subscriptions.cancelled,
        awaiting: computed.awaiting,
      };
    }

    return computed;
  }, [rows, metrics.subscriptions, metrics.tenants]);

  return (
    <RoleGuard
      permissions={["SUBSCRIPTION_VIEW", "SUPER_ADMIN_ACCESS", "SUPER_ADMIN_SUBSCRIPTION_READ"]}
      match="any"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <AuditLink label="View subscription audit" variant="button" />
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading tenant subscriptions…
            </div>
          </div>
        ) : null}

        {error ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Unable to load subscriptions</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Failed to load subscription directory"}
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {[
                { label: "Organizations listed", value: summary.organizations },
                { label: "Customer orgs", value: summary.customers },
                { label: "With a plan", value: summary.assigned },
                { label: "Active billing", value: summary.active },
                { label: "In trial", value: summary.trialing },
                { label: "Awaiting plan", value: summary.awaiting },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">{item.value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card id="create-subscription">
              <CardHeader>
                <CardTitle>Assign plan to customer</CardTitle>
                <CardDescription>{WORKSPACE_COPY.createSubscriptionHint}</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateSubscriptionForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>{WORKSPACE_COPY.subscriptionDirectoryTitle}</CardTitle>
                    <CardDescription>{WORKSPACE_COPY.subscriptionDirectoryDescription}</CardDescription>
                  </div>
                  <Input
                    aria-label="Search subscriptions"
                    className="max-w-sm"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search organization, plan, or billing status…"
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
                  columns={subscriptionDirectoryColumns}
                  data={filteredRows}
                  emptyMessage="No customer subscriptions match the current filters."
                />
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </RoleGuard>
  );
}
