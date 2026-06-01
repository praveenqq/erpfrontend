"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/common/components/ui/badge";
import { ROUTES } from "@/common/navigation/routes";
import {
  formatBillingCycle,
  formatPlanPrice,
  formatPlanStatus,
  formatPlanVisibility,
  type Plan,
  type PlanStatus,
} from "@/domain/models/plan";

function statusVariant(status: PlanStatus) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "DRAFT":
      return "secondary" as const;
    case "DEPRECATED":
      return "warning" as const;
    case "ARCHIVED":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export const planColumns: ColumnDef<Plan>[] = [
  {
    accessorKey: "name",
    header: "Plan",
    cell: ({ row }) => (
      <div>
        <Link
          className="font-medium text-primary hover:underline"
          href={ROUTES.SUPER_ADMIN_PLAN_DETAIL(row.original.id)}
        >
          {row.original.name}
        </Link>
        <p className="font-mono text-xs text-muted-foreground">{row.original.code}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status)}>
        {formatPlanStatus(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "planType",
    header: "Type",
    cell: ({ row }) => <Badge variant="outline">{row.original.planType}</Badge>,
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
    cell: ({ row }) => formatPlanVisibility(row.original.visibility),
  },
  {
    accessorKey: "currentVersion",
    header: "Version",
    cell: ({ row }) => `v${row.original.currentVersion}`,
  },
  {
    id: "pricing",
    header: "Pricing",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{formatPlanPrice(row.original)}</p>
        <p className="text-xs text-muted-foreground">
          {formatBillingCycle(row.original.billingCycle)}
        </p>
      </div>
    ),
  },
  {
    id: "limits",
    header: "Limits",
    cell: ({ row }) =>
      row.original.limits.length > 0 ? (
        <span>{row.original.limits.length} configured</span>
      ) : (
        <span className="text-muted-foreground">None</span>
      ),
  },
];
