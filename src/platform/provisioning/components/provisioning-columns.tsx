"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/common/components/ui/badge";
import { ROUTES } from "@/common/navigation/routes";
import {
  formatTenantStatus,
  formatTenantTimestamp,
  tenantStatusVariant,
  type Tenant,
} from "@/domain/models/tenant";

export const provisioningQueueColumns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "displayName",
    header: "Tenant",
    cell: ({ row }) => (
      <div>
        <Link
          className="font-medium hover:underline"
          href={ROUTES.SUPER_ADMIN_PROVISIONING_DETAIL(row.original.id)}
        >
          {row.original.displayName}
        </Link>
        <p className="text-xs text-muted-foreground">{row.original.slug}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Tenant status",
    cell: ({ row }) => (
      <Badge variant={tenantStatusVariant(row.original.status)}>
        {formatTenantStatus(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "setupStatus",
    header: "Setup",
    cell: ({ row }) =>
      row.original.setupStatus ? (
        <Badge variant="secondary">{formatTenantStatus(row.original.setupStatus)}</Badge>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "primaryContactEmail",
    header: "Admin email",
    cell: ({ row }) => row.original.primaryContactEmail ?? "—",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatTenantTimestamp(row.original.createdAt),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        className="text-sm font-medium text-primary hover:underline"
        href={ROUTES.SUPER_ADMIN_PROVISIONING_DETAIL(row.original.id)}
      >
        View job
      </Link>
    ),
  },
];
