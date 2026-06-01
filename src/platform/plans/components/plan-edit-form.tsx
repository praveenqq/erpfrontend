"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import type { Plan } from "@/domain/models/plan";
import { useUpdatePlan } from "@/platform/plans/api/plan-queries";
import {
  updatePlanSchema,
  type UpdatePlanInput,
} from "@/platform/plans/schemas/plan.schema";

const VISIBILITIES = ["PUBLIC", "PRIVATE", "INTERNAL"] as const;

export function PlanEditForm({ plan }: { plan: Plan }) {
  const updatePlan = useUpdatePlan(plan.id);
  const form = useForm<UpdatePlanInput>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: {
      name: plan.name,
      description: plan.description ?? "",
      visibility: plan.visibility,
      trialDays: plan.trialDays ?? undefined,
    },
  });

  useEffect(() => {
    form.reset({
      name: plan.name,
      description: plan.description ?? "",
      visibility: plan.visibility,
      trialDays: plan.trialDays ?? undefined,
    });
  }, [form, plan]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updatePlan.mutateAsync(values);
      toast.success("Plan updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update plan");
    }
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="edit-name">Plan name</Label>
        <Input id="edit-name" {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="edit-description">Description</Label>
        <Input id="edit-description" {...form.register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-visibility">Visibility</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="edit-visibility"
          {...form.register("visibility")}
        >
          {VISIBILITIES.map((visibility) => (
            <option key={visibility} value={visibility}>
              {visibility}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-trialDays">Trial days</Label>
        <Input
          id="edit-trialDays"
          min={0}
          type="number"
          {...form.register("trialDays", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
        />
      </div>
      <div className="md:col-span-2">
        <Button disabled={updatePlan.isPending} type="submit" variant="outline">
          {updatePlan.isPending ? "Saving…" : "Save plan details"}
        </Button>
      </div>
    </form>
  );
}
