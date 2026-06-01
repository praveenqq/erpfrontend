"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuditLink } from "@/common/components/audit/audit-link";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { ROUTES } from "@/common/navigation/routes";
import {
  useApproveExpense,
  useExpense,
  useRejectExpense,
  useSubmitExpense,
} from "@/modules/expenses/api/expense-queries";
import { RoleGuard } from "@/security/guards/role-guard";
import { useAuth } from "@/security/auth/auth-provider";

export function ExpenseDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: expense, isLoading, error } = useExpense(id);
  const submit = useSubmitExpense();
  const approve = useApproveExpense();
  const reject = useRejectExpense();
  const { hasAnyPermission } = useAuth();
  const canApprove = hasAnyPermission(["EXPENSE_APPROVE", "SUPER_ADMIN_ACCESS"]);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border bg-card">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !expense) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Expense not found</CardTitle>
          <CardDescription>{error instanceof Error ? error.message : "Unable to load expense"}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      toast.success(message);
      router.refresh();
    } catch (actionError) {
      toast.error(actionError instanceof Error ? actionError.message : "Action failed");
    }
  };

  return (
    <RoleGuard match="any" permissions={["EXPENSE_APPROVE", "SUPER_ADMIN_ACCESS"]}>
      <div className="space-y-6">
        <AuditLink tenantScoped label="View audit trail" variant="button" />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{expense.title}</CardTitle>
              <Badge variant="secondary">{expense.status}</Badge>
            </div>
            <CardDescription>{expense.currency}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Amount: {expense.totalAmount?.toFixed(2) ?? "—"}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {expense.status === "DRAFT" ? (
                <Button disabled={submit.isPending} onClick={() => run(() => submit.mutateAsync(id), "Submitted")} type="button">
                  Submit
                </Button>
              ) : null}
              {canApprove && expense.status === "SUBMITTED" ? (
                <>
                  <Button disabled={approve.isPending} onClick={() => run(() => approve.mutateAsync(id), "Approved")} type="button">
                    Approve
                  </Button>
                  <Button disabled={reject.isPending} onClick={() => run(() => reject.mutateAsync(id), "Rejected")} type="button" variant="outline">
                    Reject
                  </Button>
                </>
              ) : null}
              <Button asChild variant="outline">
                <Link href={ROUTES.MODULE_EXPENSES}>Back to list</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
