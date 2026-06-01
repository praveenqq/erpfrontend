"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { formatEmployeeStatus } from "@/domain/models/employee";
import { useEmployee, useUpdateEmployee } from "@/modules/employees/api/employee-queries";
import { RoleGuard } from "@/security/guards/role-guard";
import { useAuth } from "@/security/auth/auth-provider";

export function EmployeeDetailPage({ id }: { id: string }) {
  const { data: employee, isLoading, error } = useEmployee(id);
  const updateEmployee = useUpdateEmployee(id);
  const { hasAnyPermission } = useAuth();
  const canManage = hasAnyPermission(["EMPLOYEE_MANAGE", "SUPER_ADMIN_ACCESS"]);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border bg-card">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Employee not found</CardTitle>
          <CardDescription>{error instanceof Error ? error.message : "Unable to load employee"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={ROUTES.MODULE_EMPLOYEES}>Back to employees</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const toggleStatus = async () => {
    const nextStatus = employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateEmployee.mutateAsync({
        fullName: employee.fullName,
        email: employee.email ?? undefined,
        departmentId: employee.departmentId ?? undefined,
        status: nextStatus,
      });
      toast.success(`Employee marked ${nextStatus.toLowerCase()}`);
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Update failed");
    }
  };

  return (
    <RoleGuard match="any" permissions={["EMPLOYEE_VIEW", "EMPLOYEE_MANAGE", "SUPER_ADMIN_ACCESS"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.MODULE_EMPLOYEES}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <Badge variant="secondary">{formatEmployeeStatus(employee.status)}</Badge>
          <AuditLink tenantScoped label="Audit trail" variant="button" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{employee.fullName}</CardTitle>
            <CardDescription>{employee.employeeCode}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-2">
            <p><span className="text-muted-foreground">Email:</span> {employee.email ?? "—"}</p>
            <p><span className="text-muted-foreground">Department:</span> {employee.departmentId ?? "—"}</p>
            <p><span className="text-muted-foreground">Company:</span> {employee.companyId}</p>
          </CardContent>
        </Card>

        {canManage ? (
          <Card>
            <CardHeader>
              <CardTitle>Status transition</CardTitle>
              <CardDescription>Activate or deactivate the employee record without deleting data.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled={updateEmployee.isPending} onClick={toggleStatus} type="button">
                Mark {employee.status === "ACTIVE" ? "inactive" : "active"}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </RoleGuard>
  );
}
