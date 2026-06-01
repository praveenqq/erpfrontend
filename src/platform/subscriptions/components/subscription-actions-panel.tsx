"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import type { Subscription } from "@/domain/models/subscription";
import { usePlans } from "@/platform/plans/api/plan-queries";
import {
  useActivateSubscription,
  useCancelSubscription,
  useCancelSubscriptionAtPeriodEnd,
  useChangeSubscriptionPlan,
  useRecalculateSubscriptionEntitlements,
  useRenewSubscription,
  useResumeSubscription,
  useSuspendSubscription,
} from "@/platform/subscriptions/api/subscription-queries";

interface SubscriptionActionsPanelProps {
  subscription: Subscription;
}

export function SubscriptionActionsPanel({ subscription }: SubscriptionActionsPanelProps) {
  const { data: plans } = usePlans();
  const [reason, setReason] = useState("");
  const [newPlanId, setNewPlanId] = useState("");
  const [planChangeReason, setPlanChangeReason] = useState("");

  const activate = useActivateSubscription(subscription.id);
  const renew = useRenewSubscription(subscription.id);
  const cancel = useCancelSubscription(subscription.id);
  const cancelAtPeriodEnd = useCancelSubscriptionAtPeriodEnd(subscription.id);
  const suspend = useSuspendSubscription(subscription.id);
  const resume = useResumeSubscription(subscription.id);
  const changePlan = useChangeSubscriptionPlan(subscription.id);
  const recalculateEntitlements = useRecalculateSubscriptionEntitlements(
    subscription.id,
    subscription.tenantId,
  );

  const pending =
    activate.isPending ||
    renew.isPending ||
    cancel.isPending ||
    cancelAtPeriodEnd.isPending ||
    suspend.isPending ||
    resume.isPending ||
    changePlan.isPending ||
    recalculateEntitlements.isPending;

  const run = async (action: () => Promise<unknown>, successMessage: string) => {
    try {
      await action();
      toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Subscription action failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="subscription-action-reason">Reason</Label>
        <Input
          id="subscription-action-reason"
          onChange={(event) => setReason(event.target.value)}
          placeholder="Required for suspend or cancel"
          value={reason}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button disabled={pending} onClick={() => run(() => activate.mutateAsync(), "Subscription activated")} type="button">
          Activate
        </Button>
        <Button disabled={pending} onClick={() => run(() => renew.mutateAsync(), "Subscription renewed")} type="button" variant="outline">
          Renew
        </Button>
        <Button
          disabled={pending || reason.trim().length < 3}
          onClick={() => run(() => suspend.mutateAsync({ reason, immediate: true }), "Subscription suspended")}
          type="button"
          variant="outline"
        >
          Suspend
        </Button>
        <Button disabled={pending} onClick={() => run(() => resume.mutateAsync(), "Subscription resumed")} type="button" variant="outline">
          Resume
        </Button>
        <Button
          disabled={pending || reason.trim().length < 3}
          onClick={() =>
            run(
              () => cancel.mutateAsync({ reason, immediate: true }),
              "Subscription cancelled",
            )
          }
          type="button"
          variant="destructive"
        >
          Cancel now
        </Button>
        <Button
          disabled={pending}
          onClick={() => run(() => cancelAtPeriodEnd.mutateAsync(), "Cancellation scheduled")}
          type="button"
          variant="outline"
        >
          Cancel at period end
        </Button>
        <Button
          disabled={pending}
          onClick={() =>
            run(() => recalculateEntitlements.mutateAsync(), "Entitlements recalculated")
          }
          type="button"
          variant="secondary"
        >
          Recalculate entitlements
        </Button>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm font-semibold">Change plan</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Plan changes update commercial entitlements without deleting tenant data. Backend remains the authority.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            onChange={(event) => setNewPlanId(event.target.value)}
            value={newPlanId}
          >
            <option value="">Select new plan</option>
            {(plans ?? [])
              .filter((plan) => plan.id !== subscription.planId)
              .map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.code})
                </option>
              ))}
          </select>
          <Input
            onChange={(event) => setPlanChangeReason(event.target.value)}
            placeholder="Reason (optional)"
            value={planChangeReason}
          />
          <Button
            disabled={pending || !newPlanId}
            onClick={() =>
              run(
                () =>
                  changePlan.mutateAsync({
                    newPlanId,
                    reason: planChangeReason || undefined,
                  }),
                "Plan changed",
              )
            }
            type="button"
          >
            Change plan
          </Button>
        </div>
      </div>
    </div>
  );
}
