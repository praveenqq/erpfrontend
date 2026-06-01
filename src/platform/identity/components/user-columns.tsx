"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/common/components/ui/badge";
import { ROUTES } from "@/common/navigation/routes";
import {
  formatUserName,
  userStatusVariant,
  type TenantUser,
} from "@/domain/models/identity";

export const userColumns: ColumnDef<TenantUser>[] = [
  {
    accessorKey: "email",
    header: "User",
    cell: ({ row }) => (
      <div>
        <Link
          className="font-medium hover:underline"
          href={ROUTES.ADMIN_USER_DETAIL(row.original.id)}
        >
          {formatUserName(row.original)}
        </Link>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={userStatusVariant(row.original.status)}>{row.original.status}</Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        className="text-sm font-medium text-primary hover:underline"
        href={ROUTES.ADMIN_USER_DETAIL(row.original.id)}
      >
        Manage access
      </Link>
    ),
  },
];
