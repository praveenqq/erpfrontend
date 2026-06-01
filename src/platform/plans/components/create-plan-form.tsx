"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { useCreatePlan } from "@/platform/plans/api/plan-queries";
import {
  createPlanSchema,
  type CreatePlanInput,
} from "@/platform/plans/schemas/plan.schema";

const PLAN_TYPES = ["STANDARD", "TRIAL", "ENTERPRISE", "CUSTOM"] as const;
const VISIBILITIES = ["PUBLIC", "PRIVATE", "INTERNAL"] as const;

export function CreatePlanForm({ onSuccess }: { onSuccess?: () => void }) {
  const createPlan = useCreatePlan();
  const form = useForm<CreatePlanInput>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      planType: "STANDARD",
      visibility: "PUBLIC",
      trialDays: undefined,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createPlan.mutateAsync(values);
      toast.success("Plan created");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create plan");
    }
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="code">Plan code</Label>
        <Input id="code" placeholder="starter" {...form.register("code")} />
        {form.formState.errors.code ? (
          <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Plan name</Label>
        <Input id="name" placeholder="Starter" {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...form.register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="planType">Plan type</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="planType"
          {...form.register("planType")}
        >
          {PLAN_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="visibility"
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
        <Label htmlFor="trialDays">Trial days</Label>
        <Input
          id="trialDays"
          min={0}
          type="number"
          {...form.register("trialDays", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
        />
      </div>
      <div className="md:col-span-2">
        <Button disabled={createPlan.isPending} type="submit">
          {createPlan.isPending ? "Creating…" : "Create plan"}
        </Button>
      </div>
    </form>
  );
}
