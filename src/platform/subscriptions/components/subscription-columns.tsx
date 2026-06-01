"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/common/components/ui/badge";
import {
  formatTenantTypeLabel,
  isNonBillableTenantType,
  WORKSPACE_COPY,
} from "@/common/copy/workspace-labels";
import { ROUTES } from "@/common/navigation/routes";
import {
  formatSubscriptionPrice,
  formatSubscriptionStatus,
  formatSubscriptionTimestamp,
  subscriptionAllowsAccess,
  type SubscriptionDirectoryRow,
  type SubscriptionStatus,
} from "@/domain/models/subscription";

function statusVariant(status: SubscriptionStatus) {
  switch (status) {
    case "ACTIVE":
    case "TRIALING":
      return "success" as const;
    case "PAST_DUE":
    case "GRACE_PERIOD":
    case "PAYMENT_FAILED":
      return "warning" as const;
    case "SUSPENDED":
    case "CANCELLED":
    case "EXPIRED":
    case "ENDED":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export const subscriptionDirectoryColumns: ColumnDef<SubscriptionDirectoryRow>[] = [
  {
    accessorKey: "tenantName",
    header: "Organization",
    cell: ({ row }) => (
      <div>
        <Link
          className="font-medium text-primary hover:underline"
          href={ROUTES.PLATFORM_TENANT_DETAIL(row.original.tenantId)}
        >
          {row.original.tenantName}
        </Link>
        <p className="text-xs text-muted-foreground">{row.original.tenantSlug}</p>
        {row.original.tenantType ? (
          <p className="text-xs text-muted-foreground">
            {formatTenantTypeLabel(row.original.tenantType)}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    id: "plan",
    header: "Plan",
    cell: ({ row }) => {
      if (isNonBillableTenantType(row.original.tenantType)) {
        return (
          <div>
            <p className="font-medium text-muted-foreground">{WORKSPACE_COPY.operatorPlanLabel}</p>
            <p className="text-xs text-muted-foreground">{WORKSPACE_COPY.operatorPlanHint}</p>
          </div>
        );
      }
      return row.original.subscription ? (
        <div>
          <p className="font-medium">{row.original.subscription.planName ?? "—"}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {row.original.subscription.planCode ?? row.original.subscription.planId}
          </p>
        </div>
      ) : (
        <div>
          <p className="font-medium text-muted-foreground">{WORKSPACE_COPY.customerUnassignedPlan}</p>
          <p className="text-xs text-muted-foreground">Assign a plan to enable module access</p>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Billing status",
    cell: ({ row }) => {
      if (isNonBillableTenantType(row.original.tenantType)) {
        return (
          <div className="space-y-1">
            <Badge variant="secondary">{WORKSPACE_COPY.operatorStatusLabel}</Badge>
            <p className="text-xs text-muted-foreground">Subscription not required</p>
          </div>
        );
      }
      return row.original.subscription ? (
        <div className="space-y-1">
          <Badge variant={statusVariant(row.original.subscription.status)}>
            {formatSubscriptionStatus(row.original.subscription.status)}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {subscriptionAllowsAccess(row.original.subscription.status)
              ? "Module access allowed"
              : "Business modules restricted"}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <Badge variant="warning">{WORKSPACE_COPY.customerUnassignedStatus}</Badge>
          <p className="text-xs text-muted-foreground">Create a subscription to go live</p>
        </div>
      );
    },
  },
  {
    id: "period",
    header: "Current period",
    cell: ({ row }) =>
      row.original.subscription ? (
        <div className="text-sm">
          <p>{formatSubscriptionTimestamp(row.original.subscription.currentPeriodEnd)}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.subscription.cancelAtPeriodEnd ? "Cancels at period end" : "Renews on schedule"}
          </p>
        </div>
      ) : (
        "—"
      ),
  },
  {
    id: "pricing",
    header: "Pricing",
    cell: ({ row }) =>
      row.original.subscription ? formatSubscriptionPrice(row.original.subscription) : "—",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) =>
      row.original.subscription ? (
        <Link
          className="text-sm font-medium text-primary hover:underline"
          href={ROUTES.SUPER_ADMIN_SUBSCRIPTION_DETAIL(row.original.subscription.id)}
        >
          Manage
        </Link>
      ) : isNonBillableTenantType(row.original.tenantType) ? (
        <Link
          className="text-sm font-medium text-primary hover:underline"
          href={ROUTES.PLATFORM_TENANT_DETAIL(row.original.tenantId)}
        >
          View workspace
        </Link>
      ) : (
        <Link
          className="text-sm font-medium text-primary hover:underline"
          href={`${ROUTES.SUPER_ADMIN_SUBSCRIPTIONS}#create-subscription`}
        >
          Assign plan
        </Link>
      ),
  },
];

export function getSubscriptionStatusVariant(status: SubscriptionStatus) {
  return statusVariant(status);
}
