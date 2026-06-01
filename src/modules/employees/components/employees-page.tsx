"use client";

import Link from "next/link";
import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuditLink } from "@/common/components/audit/audit-link";
import { DataTable } from "@/common/components/data-table/data-table";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { ROUTES } from "@/common/navigation/routes";
import { formatEmployeeStatus, type Employee } from "@/domain/models/employee";
import {
  useCreateEmployee,
  useEmployees,
} from "@/modules/employees/api/employee-queries";
import { useOrganizationCompany, useOrganizationDepartments } from "@/platform/organization/api/organization-queries";
import { RoleGuard } from "@/security/guards/role-guard";
import { useAuth } from "@/security/auth/auth-provider";
import type { ColumnDef } from "@tanstack/react-table";

const createEmployeeSchema = z.object({
  employeeCode: z.string().min(1),
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  departmentId: z.string().optional(),
});

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm";

type CreateEmployeeForm = z.infer<typeof createEmployeeSchema>;

export function EmployeesPage() {
  const { data, isLoading, error, refetch } = useEmployees();
  const { data: company } = useOrganizationCompany();
  const { data: departments } = useOrganizationDepartments();
  const createEmployee = useCreateEmployee();
  const { hasAnyPermission } = useAuth();
  const canManage = hasAnyPermission(["EMPLOYEE_MANAGE", "SUPER_ADMIN_ACCESS"]);

  const form = useForm<CreateEmployeeForm>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: { employeeCode: "", fullName: "", email: "", departmentId: "" },
  });

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "employeeCode",
        header: "Code",
        cell: ({ row }) => (
          <Link className="font-medium text-primary hover:underline" href={ROUTES.MODULE_EMPLOYEE_DETAIL(row.original.id)}>
            {row.original.employeeCode}
          </Link>
        ),
      },
      { accessorKey: "fullName", header: "Name" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge variant="secondary">{formatEmployeeStatus(row.original.status)}</Badge>,
      },
    ],
    [],
  );

  const submit = form.handleSubmit(async (values) => {
    if (!company?.id) {
      toast.error("Company profile must exist before creating employees.");
      return;
    }
    try {
      await createEmployee.mutateAsync({
        companyId: company.id,
        employeeCode: values.employeeCode,
        fullName: values.fullName,
        email: values.email || undefined,
        departmentId: values.departmentId || undefined,
      });
      toast.success("Employee created");
      form.reset();
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Failed to create employee");
    }
  });

  return (
    <RoleGuard match="any" permissions={["EMPLOYEE_VIEW", "EMPLOYEE_MANAGE", "SUPER_ADMIN_ACCESS"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AuditLink tenantScoped label="View tenant audit" variant="button" />
        </div>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border bg-card">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : null}

        {error ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Unable to load employees</CardTitle>
              <CardDescription>{error instanceof Error ? error.message : "Request failed"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => refetch()} type="button" variant="outline">Retry</Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error ? (
          <Card>
            <CardHeader>
              <CardTitle>Employee directory</CardTitle>
              <CardDescription>Tenant-scoped employee master data for HCM modules.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={data ?? []} emptyMessage="No employees yet." />
            </CardContent>
          </Card>
        ) : null}

        {canManage ? (
          <Card>
            <CardHeader>
              <CardTitle>Create employee</CardTitle>
              <CardDescription>Requires EMPLOYEE_MANAGE and the EMPLOYEES module entitlement.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 md:grid-cols-4" onSubmit={submit}>
                <div className="space-y-2">
                  <Label htmlFor="employee-code">Employee code</Label>
                  <Input id="employee-code" {...form.register("employeeCode")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-name">Full name</Label>
                  <Input id="employee-name" {...form.register("fullName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-email">Email</Label>
                  <Input id="employee-email" type="email" {...form.register("email")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-department">Department</Label>
                  <select className={selectClassName} id="employee-department" {...form.register("departmentId")}>
                    <option value="">Optional</option>
                    {(departments ?? []).map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.code} — {department.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <Button disabled={createEmployee.isPending} type="submit">Create employee</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </RoleGuard>
  );
}
