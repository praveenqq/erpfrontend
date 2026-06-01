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
import { formatTenantTypeLabel } from "@/common/copy/workspace-labels";

export const tenantColumns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "displayName",
    header: "Tenant",
    cell: ({ row }) => (
      <div>
        <Link
          className="font-medium hover:underline"
          href={ROUTES.PLATFORM_TENANT_DETAIL(row.original.id)}
        >
          {row.original.displayName}
        </Link>
        <p className="text-xs text-muted-foreground">{row.original.slug}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
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
    accessorKey: "type",
    header: "Organization type",
    cell: ({ row }) => formatTenantTypeLabel(row.original.type),
  },
  {
    accessorKey: "primaryContactEmail",
    header: "Contact",
    cell: ({ row }) => row.original.primaryContactEmail ?? "—",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatTenantTimestamp(row.original.createdAt),
  },
];
