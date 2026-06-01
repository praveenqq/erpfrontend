"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ROUTES } from "@/common/navigation/routes";
import type { TenantRole } from "@/domain/models/identity";

export const roleColumns: ColumnDef<TenantRole>[] = [
  {
    accessorKey: "name",
    header: "Role",
    cell: ({ row }) => (
      <div>
        <Link
          className="font-medium hover:underline"
          href={ROUTES.ADMIN_ROLE_DETAIL(row.original.id)}
        >
          {row.original.name}
        </Link>
        <p className="font-mono text-xs text-muted-foreground">{row.original.code}</p>
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        className="text-sm font-medium text-primary hover:underline"
        href={ROUTES.ADMIN_ROLE_DETAIL(row.original.id)}
      >
        Manage permissions
      </Link>
    ),
  },
];
