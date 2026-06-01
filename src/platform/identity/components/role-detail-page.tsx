"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import { ROUTES } from "@/common/navigation/routes";
import {
  usePermissions,
  useRole,
  useUpdateRolePermissions,
} from "@/platform/identity/api/identity-queries";
import { RoleGuard } from "@/security/guards/role-guard";

export function RoleDetailPage({ id }: { id: string }) {
  const { data, isLoading, error } = useRole(id);
  const { data: permissions } = usePermissions();
  const updatePermissions = useUpdateRolePermissions(id);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const activePermissions = useMemo(
    () =>
      selectedPermissions.length > 0 ? selectedPermissions : data?.permissionCodes ?? [],
    [selectedPermissions, data?.permissionCodes],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading role…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Role not found</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Unable to load this role."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN_ROLES}>Back to roles</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const save = async () => {
    try {
      await updatePermissions.mutateAsync({ permissionCodes: activePermissions });
      toast.success("Role permissions updated");
      setSelectedPermissions([]);
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Failed to update permissions");
    }
  };

  return (
    <RoleGuard match="any" permissions={["ROLE_VIEW", "SUPER_ADMIN_ACCESS"]}>
      <div className="space-y-6">
        <Button asChild size="sm" variant="outline">
          <Link href={ROUTES.ADMIN_ROLES}>
            <ArrowLeft className="h-4 w-4" />
            Back to roles
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{data.role.name}</CardTitle>
            <CardDescription>
              <span className="font-mono">{data.role.code}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Current permissions: {data.permissionCodes.join(", ") || "None assigned"}
            </p>
            <div className="space-y-2">
              <Label htmlFor="role-permission-select">Permission codes</Label>
              <select
                className="flex min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                id="role-permission-select"
                multiple
                onChange={(event) =>
                  setSelectedPermissions(
                    Array.from(event.target.selectedOptions).map((option) => option.value),
                  )
                }
                value={activePermissions}
              >
                {(permissions ?? []).map((permission) => (
                  <option key={permission.id} value={permission.code}>
                    {permission.code}
                    {permission.description ? ` — ${permission.description}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <Button disabled={updatePermissions.isPending} onClick={save} type="button">
              {updatePermissions.isPending ? "Saving…" : "Save permissions"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
