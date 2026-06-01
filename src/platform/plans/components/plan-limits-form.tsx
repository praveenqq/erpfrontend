"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import type { Plan } from "@/domain/models/plan";
import { useConfigurePlanLimits } from "@/platform/plans/api/plan-queries";
import {
  configurePlanLimitsSchema,
  type ConfigurePlanLimitsInput,
} from "@/platform/plans/schemas/plan.schema";

const ENFORCEMENT_TYPES = ["HARD_LIMIT", "SOFT_LIMIT", "WARNING_ONLY"] as const;

export function PlanLimitsForm({ plan }: { plan: Plan }) {
  const configureLimits = useConfigurePlanLimits(plan.id);
  const form = useForm<ConfigurePlanLimitsInput>({
    resolver: zodResolver(configurePlanLimitsSchema),
    defaultValues: {
      version: plan.currentVersion,
      limits:
        plan.limits.length > 0
          ? plan.limits.map((limit) => ({
              limitCode: limit.limitCode,
              limitValue: limit.limitValue,
              limitType: limit.limitType,
              enforcementType: limit.enforcementType as ConfigurePlanLimitsInput["limits"][number]["enforcementType"],
            }))
          : [{ limitCode: "MAX_USERS", limitValue: 10, limitType: "COUNT", enforcementType: "HARD_LIMIT" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "limits",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await configureLimits.mutateAsync(values);
      toast.success("Plan limits saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save plan limits");
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2 max-w-xs">
        <Label htmlFor="limits-version">Version</Label>
        <Input id="limits-version" min={1} type="number" {...form.register("version", { valueAsNumber: true })} />
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr_auto]">
            <div className="space-y-2">
              <Label>Limit code</Label>
              <Input {...form.register(`limits.${index}.limitCode`)} />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input min={0} type="number" {...form.register(`limits.${index}.limitValue`, { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input {...form.register(`limits.${index}.limitType`)} />
            </div>
            <div className="space-y-2">
              <Label>Enforcement</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...form.register(`limits.${index}.enforcementType`)}
              >
                {ENFORCEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                disabled={fields.length === 1}
                onClick={() => remove(index)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() =>
            append({
              limitCode: "",
              limitValue: 0,
              limitType: "COUNT",
              enforcementType: "HARD_LIMIT",
            })
          }
          type="button"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Add limit
        </Button>
        <Button disabled={configureLimits.isPending} type="submit">
          {configureLimits.isPending ? "Saving…" : "Save limits"}
        </Button>
      </div>
    </form>
  );
}
