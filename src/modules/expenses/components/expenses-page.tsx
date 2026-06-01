"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { AuditLink } from "@/common/components/audit/audit-link";
import { DataTable } from "@/common/components/data-table/data-table";
import { Badge } from "@/common/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { ROUTES } from "@/common/navigation/routes";
import { CreateExpenseForm } from "@/modules/expenses/components/create-expense-form";
import {
  useExpenses,
  useSubmitExpense,
  type Expense,
} from "@/modules/expenses/api/expense-queries";
import { RoleGuard } from "@/security/guards/role-guard";

const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link className="font-medium text-primary hover:underline" href={ROUTES.MODULE_EXPENSE_DETAIL(row.original.id)}>
        {row.original.title}
      </Link>
    ),
  },
  { accessorKey: "currency", header: "Currency" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => row.original.totalAmount?.toFixed(2) ?? "—",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <SubmitButton expenseId={row.original.id} status={row.original.status} />
    ),
  },
];

function SubmitButton({ expenseId, status }: { expenseId: string; status: string }) {
  const submit = useSubmitExpense();
  if (status !== "DRAFT") return null;
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={submit.isPending}
      onClick={() => submit.mutate(expenseId)}
    >
      Submit
    </Button>
  );
}

export function ExpensesPage() {
  const { data: expenses, isLoading, error, refetch } = useExpenses();

  return (
    <RoleGuard match="any" permissions={["EXPENSE_APPROVE", "SUPER_ADMIN_ACCESS"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AuditLink tenantScoped label="View audit trail" variant="button" />
        </div>

        <CreateExpenseForm />

        <Card>
          <CardHeader>
            <CardTitle>Claims</CardTitle>
            <CardDescription>Review, submit, and track expense workflow status.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-[120px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : null}
            {error ? (
              <div className="space-y-3">
                <p className="text-destructive">
                  {error instanceof Error ? error.message : "Failed to load expenses"}
                </p>
                <Button onClick={() => refetch()} type="button" variant="outline">
                  Retry
                </Button>
              </div>
            ) : null}
            {!isLoading && !error ? (
              <DataTable
                columns={columns}
                data={expenses ?? []}
                emptyMessage="No expense claims yet. Create a draft claim above."
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
