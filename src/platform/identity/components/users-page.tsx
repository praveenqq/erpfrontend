"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
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
import { useDebounce } from "@/common/hooks/use-debounce";
import { ROUTES } from "@/common/navigation/routes";
import { useUsers } from "@/platform/identity/api/identity-queries";
import { CreateUserForm } from "@/platform/identity/components/create-user-form";
import { userColumns } from "@/platform/identity/components/user-columns";
import { RoleGuard } from "@/security/guards/role-guard";
import { useAuth } from "@/security/auth/auth-provider";
import { AuditLink } from "@/common/components/audit/audit-link";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const { hasAnyPermission } = useAuth();
  const canManage = hasAnyPermission(["USER_MANAGE", "SUPER_ADMIN_ACCESS"]);
  const debouncedSearch = useDebounce(search);
  const { data, isLoading, error, refetch } = useUsers({
    q: debouncedSearch || undefined,
    page: 0,
    size: 100,
  });

  const rows = useMemo(() => data?.content ?? [], [data?.content]);
  const totalUsers = data?.totalElements ?? rows.length;

  return (
    <RoleGuard match="any" permissions={["USER_VIEW", "SUPER_ADMIN_ACCESS"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AuditLink tenantScoped label="View identity audit" variant="button" />
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading users…
            </div>
          </div>
        ) : null}

        {error ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Unable to load users</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Failed to load organization users"}
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
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "Total users", value: totalUsers },
                { label: "Loaded in view", value: rows.length },
                {
                  label: "Active in view",
                  value: rows.filter((user) => user.status === "ACTIVE").length,
                },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">{item.value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {canManage ? (
              <Card id="invite-user">
                <CardHeader>
                  <CardTitle>Invite user</CardTitle>
                  <CardDescription>
                    Invite a team member with membership, roles, and optional branch or department scopes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateUserForm />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Invite user</CardTitle>
                  <CardDescription>
                    User management permission is required to invite or modify organization users.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle>User directory</CardTitle>
                  <CardDescription>
                    Organization users with role and membership context. Access changes are audited.
                  </CardDescription>
                </div>
                <Input
                  aria-label="Search users"
                  className="max-w-sm"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name or email…"
                  value={search}
                />
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={userColumns}
                  data={rows}
                  emptyMessage="No users found for this organization."
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  Manage role permissions in{" "}
                  <Link className="font-medium text-primary hover:underline" href={ROUTES.ADMIN_ROLES}>
                    Roles & permissions
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
