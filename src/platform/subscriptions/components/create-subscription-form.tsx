"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { usePlans } from "@/platform/plans/api/plan-queries";
import {
  useCreateSubscription,
  useStartTrialSubscription,
} from "@/platform/subscriptions/api/subscription-queries";
import {
  createSubscriptionSchema,
  type CreateSubscriptionInput,
} from "@/platform/subscriptions/schemas/subscription.schema";
import { useTenants } from "@/platform/tenants/api/tenant-queries";

export function CreateSubscriptionForm() {
  const { data: tenants } = useTenants({ page: 0, size: 100 });
  const { data: plans } = usePlans();
  const createSubscription = useCreateSubscription();
  const startTrial = useStartTrialSubscription();

  const form = useForm<CreateSubscriptionInput>({
    resolver: zodResolver(createSubscriptionSchema),
    defaultValues: {
      tenantId: "",
      planId: "",
      trialDays: 14,
    },
  });

  const submitCreate = form.handleSubmit(async (values) => {
    try {
      const subscription = await createSubscription.mutateAsync(values);
      toast.success("Subscription created");
      form.reset();
      return subscription;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create subscription");
    }
  });

  const submitTrial = form.handleSubmit(async (values) => {
    try {
      await startTrial.mutateAsync(values);
      toast.success("Trial started");
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start trial");
    }
  });

  return (
    <form className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="subscription-tenant">Tenant</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="subscription-tenant"
          {...form.register("tenantId")}
        >
          <option value="">Select tenant</option>
          {(tenants?.content ?? []).map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.displayName}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subscription-plan">Plan</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="subscription-plan"
          {...form.register("planId")}
        >
          <option value="">Select plan</option>
          {(plans ?? []).map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} ({plan.code})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subscription-trial-days">Trial days</Label>
        <Input
          id="subscription-trial-days"
          min={1}
          type="number"
          {...form.register("trialDays", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
        />
      </div>
      <div className="flex flex-wrap items-end gap-2 md:col-span-2">
        <Button disabled={createSubscription.isPending} onClick={submitCreate} type="button">
          {createSubscription.isPending ? "Creating…" : "Create subscription"}
        </Button>
        <Button
          disabled={startTrial.isPending}
          onClick={submitTrial}
          type="button"
          variant="outline"
        >
          {startTrial.isPending ? "Starting…" : "Start trial"}
        </Button>
      </div>
    </form>
  );
}
