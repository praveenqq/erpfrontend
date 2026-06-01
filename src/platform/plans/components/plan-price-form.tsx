"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import type { Plan } from "@/domain/models/plan";
import { useAddPlanPrice } from "@/platform/plans/api/plan-queries";
import {
  planPriceSchema,
  type PlanPriceInput,
} from "@/platform/plans/schemas/plan.schema";

const BILLING_CYCLES = ["MONTHLY", "QUARTERLY", "YEARLY", "TRIAL", "CUSTOM"] as const;

export function PlanPriceForm({ plan }: { plan: Plan }) {
  const addPrice = useAddPlanPrice(plan.id);
  const form = useForm<PlanPriceInput>({
    resolver: zodResolver(planPriceSchema),
    defaultValues: {
      currency: plan.currency ?? "USD",
      billingCycle: plan.billingCycle ?? "MONTHLY",
      amount: plan.priceAmount ?? undefined,
      countryCode: "",
      taxInclusive: false,
      version: plan.currentVersion,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await addPrice.mutateAsync(values);
      toast.success("Plan price saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save plan price");
    }
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="price-currency">Currency</Label>
        <Input id="price-currency" maxLength={3} {...form.register("currency")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price-amount">Amount</Label>
        <Input id="price-amount" step="0.01" type="number" {...form.register("amount", { valueAsNumber: true })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price-cycle">Billing cycle</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="price-cycle"
          {...form.register("billingCycle")}
        >
          {BILLING_CYCLES.map((cycle) => (
            <option key={cycle} value={cycle}>
              {cycle}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="price-version">Version</Label>
        <Input id="price-version" min={1} type="number" {...form.register("version", { valueAsNumber: true })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price-country">Country code</Label>
        <Input id="price-country" maxLength={2} placeholder="US" {...form.register("countryCode")} />
      </div>
      <div className="flex items-center gap-2 pt-8">
        <input id="price-taxInclusive" type="checkbox" {...form.register("taxInclusive")} />
        <Label htmlFor="price-taxInclusive">Tax inclusive</Label>
      </div>
      <div className="md:col-span-2">
        <Button disabled={addPrice.isPending} type="submit">
          {addPrice.isPending ? "Saving…" : "Save pricing"}
        </Button>
      </div>
    </form>
  );
}
