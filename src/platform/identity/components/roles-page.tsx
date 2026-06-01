"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable } from "@/common/components/data-table/data-table";
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
import { useCreateRole, usePermissions, useRoles } from "@/platform/identity/api/identity-queries";
import { roleColumns } from "@/platform/identity/components/role-columns";
import {
  createRoleSchema,
  type CreateRoleInput,
} from "@/platform/identity/schemas/identity.schema";
import { RoleGuard } from "@/security/guards/role-guard";
import { useAuth } from "@/security/auth/auth-provider";
import { AuditLink } from "@/common/components/audit/audit-link";

export function RolesPage() {
  const { data: roles, isLoading, error, refetch } = useRoles();
  const { data: permissions } = usePermissions();
  const createRole = useCreateRole();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { hasAnyPermission } = useAuth();
  const canManage = hasAnyPermission(["ROLE_MANAGE", "SUPER_ADMIN_ACCESS"]);

  const form = useForm<CreateRoleInput>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { code: "", name: "", permissionCodes: [] },
  });

  const rows = useMemo(() => roles ?? [], [roles]);

  const submit = form.handleSubmit(async (values) => {
    try {
      await createRole.mutateAsync({
        ...values,
        permissionCodes: selectedPermissions,
      });
      toast.success("Role created");
      form.reset();
      setSelectedPermissions([]);
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Failed to create role");
    }
  });

  return (
    <RoleGuard match="any" permissions={["ROLE_VIEW", "SUPER_ADMIN_ACCESS"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <AuditLink tenantScoped label="Role change audit" variant="button" />
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading roles…
            </div>
          </div>
        ) : null}

        {error ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Unable to load roles</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Failed to load tenant roles"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => refetch()} type="button" variant="outline">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error ? (
          <>
            {canManage ? (
            <Card id="create-role">
              <CardHeader>
                <CardTitle>Create role</CardTitle>
                <CardDescription>
                  Define a tenant-scoped role and attach permission codes from the backend catalog.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
                  <div className="space-y-2">
                    <Label htmlFor="role-code">Code</Label>
                    <Input id="role-code" placeholder="TENANT_ADMIN" {...form.register("code")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Name</Label>
                    <Input id="role-name" placeholder="Tenant administrator" {...form.register("name")} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="role-permissions">Permissions</Label>
                    <select
                      className="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      id="role-permissions"
                      multiple
                      onChange={(event) =>
                        setSelectedPermissions(
                          Array.from(event.target.selectedOptions).map((option) => option.value),
                        )
                      }
                    >
                      {(permissions ?? []).map((permission) => (
                        <option key={permission.id} value={permission.code}>
                          {permission.code}
                          {permission.description ? ` — ${permission.description}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Button disabled={createRole.isPending} type="submit">
                      {createRole.isPending ? "Creating…" : "Create role"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Role directory</CardTitle>
                <CardDescription>
                  Tenant-scoped roles drive authorization. The frontend checks permission codes, not role names alone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={roleColumns}
                  data={rows}
                  emptyMessage="No roles defined for this tenant yet."
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  Assign roles to users from{" "}
                  <Link className="font-medium text-primary hover:underline" href={ROUTES.ADMIN_USERS}>
                    Users
                  </Link>
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </RoleGuard>
  );
}
