"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { formatUserName, userStatusVariant } from "@/domain/models/identity";
import { OrganizationScopeFields } from "@/platform/identity/components/organization-scope-fields";
import {
  useDeactivateUser,
  useRoles,
  useUpdateUserAccess,
  useUser,
} from "@/platform/identity/api/identity-queries";
import {
  useOrganizationBranches,
  useOrganizationCompany,
  useOrganizationDepartments,
} from "@/platform/organization/api/organization-queries";
import { RoleGuard } from "@/security/guards/role-guard";

function resolveScopeLabel(
  ids: string[],
  items: Array<{ id: string; name: string; code: string }> | undefined,
): string {
  if (ids.length === 0) return "Organization-wide";
  return ids
    .map((id) => {
      const match = items?.find((item) => item.id === id);
      return match ? `${match.name} (${match.code})` : id;
    })
    .join(", ");
}

export function UserDetailPage({ id }: { id: string }) {
  const { data, isLoading, error } = useUser(id);
  const { data: roles } = useRoles();
  const { data: company } = useOrganizationCompany();
  const { data: branches } = useOrganizationBranches();
  const { data: departments } = useOrganizationDepartments();
  const updateAccess = useUpdateUserAccess(id);
  const deactivateUser = useDeactivateUser(id);
  const [reason, setReason] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);

  const roleIdsFromData = useMemo(() => {
    if (!data || !roles) return [];
    return roles.filter((role) => data.roleCodes.includes(role.code)).map((role) => role.id);
  }, [data, roles]);

  useEffect(() => {
    if (!data) return;
    setSelectedRoles(roleIdsFromData);
    setCompanyId(data.companyIds[0] ?? company?.id ?? "");
    setBranchIds(data.branchIds);
    setDepartmentIds(data.departmentIds);
  }, [data, roleIdsFromData, company?.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading user…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>User not found</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Unable to load this user."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN_USERS}>Back to users</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { user } = data;

  const saveAccess = async () => {
    try {
      await updateAccess.mutateAsync({
        roleIds: selectedRoles,
        companyId: companyId || undefined,
        branchIds,
        departmentIds,
      });
      toast.success("User access updated");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Failed to update user access");
    }
  };

  const deactivate = async () => {
    if (reason.trim().length < 3) {
      toast.error("Provide a reason before deactivating the user");
      return;
    }
    try {
      await deactivateUser.mutateAsync({ reason: reason.trim() });
      toast.success("User deactivated");
    } catch (deactivateError) {
      toast.error(deactivateError instanceof Error ? deactivateError.message : "Failed to deactivate user");
    }
  };

  return (
    <RoleGuard match="any" permissions={["USER_VIEW", "SUPER_ADMIN_ACCESS"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.ADMIN_USERS}>
              <ArrowLeft className="h-4 w-4" />
              Back to users
            </Link>
          </Button>
          <Badge variant={userStatusVariant(user.status)}>{user.status}</Badge>
          <Badge variant={data.tenantMembershipActive ? "success" : "warning"}>
            {data.tenantMembershipActive ? "Organization member" : "No organization membership"}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{formatUserName(user)}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Roles:</span>{" "}
              {data.roleCodes.join(", ") || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Company:</span>{" "}
              {resolveScopeLabel(data.companyIds, company ? [company] : [])}
            </p>
            <p>
              <span className="text-muted-foreground">Branch access:</span>{" "}
              {resolveScopeLabel(data.branchIds, branches)}
            </p>
            <p>
              <span className="text-muted-foreground">Department access:</span>{" "}
              {resolveScopeLabel(data.departmentIds, departments)}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Access assignment</CardTitle>
              <CardDescription>
                Assign roles and organization scope. Permissions come from roles and are enforced by
                the backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-role-select">Roles</Label>
                <select
                  className="flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  id="user-role-select"
                  multiple
                  onChange={(event) =>
                    setSelectedRoles(Array.from(event.target.selectedOptions).map((option) => option.value))
                  }
                  value={selectedRoles}
                >
                  {(roles ?? []).map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.code})
                    </option>
                  ))}
                </select>
              </div>

              <OrganizationScopeFields
                branchIds={branchIds}
                companyId={companyId}
                departmentIds={departmentIds}
                onBranchChange={setBranchIds}
                onCompanyChange={setCompanyId}
                onDepartmentChange={setDepartmentIds}
              />

              <Button disabled={updateAccess.isPending} onClick={saveAccess} type="button">
                {updateAccess.isPending ? "Saving…" : "Save access"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Deactivate user</CardTitle>
              <CardDescription>
                Deactivation removes active organization membership and is recorded in the audit trail.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-deactivate-reason">Reason</Label>
                <Input
                  id="user-deactivate-reason"
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Required for audit trail"
                  value={reason}
                />
              </div>
              <Button
                disabled={deactivateUser.isPending || user.status === "INACTIVE"}
                onClick={deactivate}
                type="button"
                variant="destructive"
              >
                {deactivateUser.isPending ? "Deactivating…" : "Deactivate user"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
