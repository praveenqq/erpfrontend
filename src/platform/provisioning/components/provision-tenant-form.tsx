"use client";

import { useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { ROUTES } from "@/common/navigation/routes";
import { usePlans } from "@/platform/plans/api/plan-queries";
import { useCreateTenant } from "@/platform/tenants/api/tenant-queries";
import {
  createTenantSchema,
  type CreateTenantInput,
} from "@/platform/tenants/schemas/tenant.schema";

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `provision-${Date.now()}`;
}

export function ProvisionTenantForm() {
  const router = useRouter();
  const idempotencyFieldId = useId();
  const createTenant = useCreateTenant();
  const { data: plans } = usePlans();

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
      planCode: "",
      idempotencyKey: createIdempotencyKey(),
    },
  });

  useEffect(() => {
    const firstPlan = plans?.[0];
    if (firstPlan && !form.getValues("planCode")) {
      form.setValue("planCode", firstPlan.code);
    }
  }, [plans, form]);

  const regenerateIdempotencyKey = () => {
    form.setValue("idempotencyKey", createIdempotencyKey());
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const tenant = await createTenant.mutateAsync({
        ...values,
        idempotencyKey: values.idempotencyKey || createIdempotencyKey(),
      });
      toast.success("Customer onboarding started");
      router.push(ROUTES.SUPER_ADMIN_PROVISIONING_DETAIL(tenant.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start provisioning");
    }
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      {(
        [
          ["legalName", "Legal name"],
          ["displayName", "Display name"],
          ["slug", "Slug"],
          ["primaryContactEmail", "Admin contact email"],
          ["countryCode", "Country"],
          ["defaultCurrency", "Currency"],
          ["defaultTimezone", "Timezone"],
          ["defaultLocale", "Locale"],
        ] as const
      ).map(([name, label]) => (
        <div className="space-y-2" key={name}>
          <Label htmlFor={name}>{label}</Label>
          <Input id={name} {...form.register(name)} />
          {form.formState.errors[name] ? (
            <p className="text-xs text-destructive">{form.formState.errors[name]?.message}</p>
          ) : null}
        </div>
      ))}

      <div className="space-y-2">
        <Label htmlFor="provision-type">Organization type</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="provision-type"
          {...form.register("type")}
        >
          <option value="SMB">SMB</option>
          <option value="ENTERPRISE">Enterprise</option>
          <option value="PARTNER">Partner</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="provision-plan">Plan</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="provision-plan"
          {...form.register("planCode")}
        >
          <option value="">Select plan</option>
          {(plans ?? []).map((plan) => (
            <option key={plan.id} value={plan.code}>
              {plan.name} ({plan.code})
            </option>
          ))}
        </select>
        {form.formState.errors.planCode ? (
          <p className="text-xs text-destructive">{form.formState.errors.planCode.message}</p>
        ) : null}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={idempotencyFieldId}>Idempotency key</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input id={idempotencyFieldId} {...form.register("idempotencyKey")} />
          <Button onClick={regenerateIdempotencyKey} type="button" variant="outline">
            Regenerate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Reusing the same key prevents duplicate organization creation if the request is retried.
        </p>
      </div>

      <div className="md:col-span-2">
        <Button disabled={createTenant.isPending} type="submit">
          {createTenant.isPending ? "Starting onboarding…" : "Onboard customer organization"}
        </Button>
      </div>
    </form>
  );
}
