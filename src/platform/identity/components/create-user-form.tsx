"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { OrganizationScopeFields } from "@/platform/identity/components/organization-scope-fields";
import { useCreateUser, useRoles } from "@/platform/identity/api/identity-queries";
import {
  createUserSchema,
  type CreateUserInput,
} from "@/platform/identity/schemas/identity.schema";
import { useOrganizationCompany } from "@/platform/organization/api/organization-queries";
import { useAuth } from "@/security/auth/auth-provider";

export function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const { companyId: authCompanyId } = useAuth();
  const { data: company } = useOrganizationCompany();
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      companyId: authCompanyId ?? undefined,
      roleIds: [],
      branchIds: [],
      departmentIds: [],
    },
  });

  useEffect(() => {
    const resolvedCompanyId = authCompanyId ?? company?.id;
    if (resolvedCompanyId && !form.getValues("companyId")) {
      form.setValue("companyId", resolvedCompanyId);
    }
  }, [authCompanyId, company?.id, form]);

  const submit = form.handleSubmit(async (values) => {
    try {
      await createUser.mutateAsync({
        ...values,
        companyId: values.companyId || company?.id,
        branchIds,
        departmentIds,
      });
      toast.success("User invited");
      form.reset({
        email: "",
        firstName: "",
        lastName: "",
        companyId: authCompanyId ?? company?.id,
        roleIds: [],
        branchIds: [],
        departmentIds: [],
      });
      setBranchIds([]);
      setDepartmentIds([]);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    }
  });

  const selectedCompanyId = form.watch("companyId") || company?.id || "";

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
      {(
        [
          ["email", "Email"],
          ["firstName", "First name"],
          ["lastName", "Last name"],
        ] as const
      ).map(([name, label]) => (
        <div className="space-y-2" key={name}>
          <Label htmlFor={`create-user-${name}`}>{label}</Label>
          <Input id={`create-user-${name}`} {...form.register(name)} />
          {form.formState.errors[name] ? (
            <p className="text-xs text-destructive">{form.formState.errors[name]?.message}</p>
          ) : null}
        </div>
      ))}

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="create-user-roles">Roles</Label>
        <select
          className="flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="create-user-roles"
          multiple
          onChange={(event) => {
            const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
            form.setValue("roleIds", selected);
          }}
        >
          {(roles ?? []).map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} ({role.code})
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <OrganizationScopeFields
          branchIds={branchIds}
          companyId={selectedCompanyId}
          departmentIds={departmentIds}
          onBranchChange={setBranchIds}
          onCompanyChange={(value) => form.setValue("companyId", value)}
          onDepartmentChange={setDepartmentIds}
        />
      </div>

      <div className="md:col-span-2">
        <Button disabled={createUser.isPending} type="submit">
          {createUser.isPending ? "Inviting…" : "Invite user"}
        </Button>
      </div>
    </form>
  );
}
