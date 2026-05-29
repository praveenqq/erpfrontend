"use client";

import type { ColumnDef } from "@tanstack/react-table";
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
import {
  useExpenses,
  useSubmitExpense,
  type Expense,
} from "@/modules/expenses/api/expense-queries";

const columns: ColumnDef<Expense>[] = [
  { accessorKey: "title", header: "Title" },
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
  const { data: expenses, isLoading, error } = useExpenses();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claims</CardTitle>
        <CardDescription>Review and submit expense reports.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Failed to load expenses"}
          </p>
        )}
        <DataTable
          columns={columns}
          data={expenses ?? []}
          emptyMessage="No expense claims yet."
        />
      </CardContent>
    </Card>
  );
}
