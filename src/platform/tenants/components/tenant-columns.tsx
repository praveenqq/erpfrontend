"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/common/components/ui/badge";
import type { Tenant } from "@/domain/models/tenant";

function statusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "SUSPENDED":
      return "warning" as const;
    case "CANCELLED":
    case "ARCHIVED":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export const tenantColumns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "displayName",
    header: "Tenant",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/platform/tenants/${row.original.id}`}
          className="font-medium hover:underline"
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
      <Badge variant={statusVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "primaryContactEmail",
    header: "Contact",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleDateString()
        : "—",
  },
];
