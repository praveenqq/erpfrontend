"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { useCreateTenant } from "../api/tenant-queries";
import {
  createTenantSchema,
  type CreateTenantInput,
} from "../schemas/tenant.schema";

export function CreateTenantForm({ onSuccess }: { onSuccess?: () => void }) {
  const createTenant = useCreateTenant();
  const form = useForm<CreateTenantInput>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      legalName: "",
      displayName: "",
      slug: "",
      type: "SMB",
      countryCode: "US",
      defaultCurrency: "USD",
      defaultTimezone: "America/New_York",
      defaultLocale: "en-US",
      primaryContactEmail: "",
      planCode: "starter",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createTenant.mutateAsync(values);
      toast.success("Tenant created");
      form.reset();
      onSuccess?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create tenant");
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      {(
        [
          ["legalName", "Legal name"],
          ["displayName", "Display name"],
          ["slug", "Slug"],
          ["primaryContactEmail", "Contact email"],
          ["planCode", "Plan code"],
          ["countryCode", "Country"],
          ["defaultCurrency", "Currency"],
          ["defaultTimezone", "Timezone"],
          ["defaultLocale", "Locale"],
        ] as const
      ).map(([name, label]) => (
        <div key={name} className="space-y-2">
          <Label htmlFor={name}>{label}</Label>
          <Input id={name} {...form.register(name)} />
          {form.formState.errors[name] && (
            <p className="text-xs text-destructive">
              {form.formState.errors[name]?.message}
            </p>
          )}
        </div>
      ))}
      <div className="md:col-span-2">
        <Button type="submit" disabled={createTenant.isPending}>
          {createTenant.isPending ? "Creating…" : "Create tenant"}
        </Button>
      </div>
    </form>
  );
}
