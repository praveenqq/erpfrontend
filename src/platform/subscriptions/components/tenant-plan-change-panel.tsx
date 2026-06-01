"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import {
  formatPlanPrice,
  formatSubscriptionStatus,
  formatSubscriptionTimestamp,
  type Subscription,
  type SubscriptionUsage,
  type TenantPlanOption,
} from "@/domain/models/subscription";
import { useComparePublicPlans } from "@/platform/plans/api/public-plan-queries";
import { useTenantChangePlan } from "@/platform/subscriptions/api/tenant-subscription-queries";
import {
  buildPlanChangeImpact,
  findPlanByCode,
  formatPlanChangeDirection,
} from "@/platform/subscriptions/utils/plan-change-impact";
import { useAuth } from "@/security/auth/auth-provider";

interface TenantPlanChangePanelProps {
  subscription: Subscription;
  availablePlans: TenantPlanOption[];
  usage: SubscriptionUsage[];
}

export function TenantPlanChangePanel({
  subscription,
  availablePlans,
  usage,
}: TenantPlanChangePanelProps) {
  const { hasAnyPermission } = useAuth();
  const changePlan = useTenantChangePlan();
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [lastResult, setLastResult] = useState<Subscription | null>(null);

  const currentPlanCode = subscription.planCode ?? "";
  const selectablePlans = availablePlans.filter((plan) => !plan.current && plan.selectable);
  const selectedPlan = selectablePlans.find((plan) => plan.planCode === selectedPlanCode);

  const compareCodes = useMemo(
    () => (currentPlanCode && selectedPlanCode ? [currentPlanCode, selectedPlanCode] : []),
    [currentPlanCode, selectedPlanCode],
  );
  const { data: comparedPlans, isLoading: compareLoading } = useComparePublicPlans(compareCodes);

  const impact = useMemo(() => {
    if (!comparedPlans || comparedPlans.length < 2 || !currentPlanCode || !selectedPlanCode) {
      return null;
    }
    const currentPlan = findPlanByCode(comparedPlans, currentPlanCode);
    const targetPlan = findPlanByCode(comparedPlans, selectedPlanCode);
    if (!currentPlan || !targetPlan) return null;
    return buildPlanChangeImpact(currentPlan, targetPlan, usage);
  }, [comparedPlans, currentPlanCode, selectedPlanCode, usage]);

  const canChangePlan = hasAnyPermission(["SUBSCRIPTION_CHANGE_PLAN", "SUPER_ADMIN_ACCESS"]);

  const handleConfirm = async () => {
    if (!selectedPlanCode || !acknowledged || reason.trim().length < 3) return;

    try {
      const updated = await changePlan.mutateAsync({
        planCode: selectedPlanCode,
        reason: reason.trim(),
      });
      setLastResult(updated);
      setSelectedPlanCode(null);
      setReason("");
      setAcknowledged(false);
      toast.success("Plan change applied. Entitlements will sync from the backend.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Plan change failed");
    }
  };

  return (
    <Card id="upgrade-options">
      <CardHeader>
        <CardTitle>Upgrade and downgrade</CardTitle>
        <CardDescription>
          Compare plans, review module and limit impact, then confirm a backend-controlled plan
          change. Downgrades disable module access but never delete tenant business data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {lastResult ? (
          <PlanChangeResult result={lastResult} onDismiss={() => setLastResult(null)} />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {availablePlans.map((plan) => {
            const isCurrent = plan.current || plan.planCode === currentPlanCode;
            const isSelected = plan.planCode === selectedPlanCode;

            return (
              <button
                key={plan.planId}
                type="button"
                disabled={isCurrent || !plan.selectable}
                onClick={() => {
                  setSelectedPlanCode(plan.planCode);
                  setAcknowledged(false);
                }}
                className={`rounded-xl border p-4 text-left transition ${
                  isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:border-border"
                } ${isCurrent ? "border-primary/30 bg-primary/5" : ""} ${
                  !plan.selectable && !isCurrent ? "cursor-not-allowed opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{plan.planName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{plan.planCode}</p>
                  </div>
                  {isCurrent ? (
                    <Badge variant="success">Current</Badge>
                  ) : plan.selectable ? (
                    <Badge variant="secondary">Selectable</Badge>
                  ) : (
                    <Badge variant="outline">Not allowed</Badge>
                  )}
                </div>
                <p className="mt-3 text-lg font-medium">{formatPlanPrice(plan)}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {plan.modules.length} packaged module{plan.modules.length === 1 ? "" : "s"}
                </p>
              </button>
            );
          })}
        </div>

        {!selectedPlan ? (
          <p className="text-sm text-muted-foreground">
            Select a plan to compare modules, limits, and billing impact before confirming.
          </p>
        ) : (
          <PlanChangePreview
            compareLoading={compareLoading}
            impact={impact}
            selectedPlan={selectedPlan}
          />
        )}

        {selectedPlan ? (
          <div className="space-y-4 rounded-xl border p-4">
            <div>
              <p className="text-sm font-semibold">Confirm plan change</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Backend upgrade rules must allow this path. The server validates the change and
                syncs entitlements after confirmation.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-change-reason">Audit reason</Label>
              <Input
                id="plan-change-reason"
                onChange={(event) => setReason(event.target.value)}
                placeholder="Why is this workspace changing plans?"
                value={reason}
              />
            </div>

            <label className="flex items-start gap-3 text-sm">
              <input
                checked={acknowledged}
                className="mt-1"
                onChange={(event) => setAcknowledged(event.target.checked)}
                type="checkbox"
              />
              <span>
                I understand that modules removed by a downgrade will be blocked in navigation,
                but existing tenant records are retained. Backend enforcement remains authoritative.
              </span>
            </label>

            {!canChangePlan ? (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You can preview plan impact, but confirming a change requires the
                SUBSCRIPTION_CHANGE_PLAN permission.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={
                  !canChangePlan ||
                  changePlan.isPending ||
                  !acknowledged ||
                  reason.trim().length < 3 ||
                  !selectedPlan.selectable
                }
                onClick={handleConfirm}
                type="button"
              >
                {changePlan.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying change…
                  </>
                ) : (
                  `Confirm ${formatPlanChangeDirection(impact?.direction ?? "lateral")}`
                )}
              </Button>
              <Button
                disabled={changePlan.isPending}
                onClick={() => {
                  setSelectedPlanCode(null);
                  setReason("");
                  setAcknowledged(false);
                }}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {selectablePlans.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No selectable upgrade or downgrade paths are available for this workspace according to
            backend upgrade rules.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PlanChangePreview({
  compareLoading,
  impact,
  selectedPlan,
}: {
  compareLoading: boolean;
  impact: ReturnType<typeof buildPlanChangeImpact> | null;
  selectedPlan: TenantPlanOption;
}) {
  if (compareLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading plan comparison…
      </div>
    );
  }

  if (!impact) {
    return (
      <div className="rounded-xl border border-amber-500/30 p-4 text-sm text-muted-foreground">
        Unable to load a public plan comparison for {selectedPlan.planCode}. Plan change remains
        blocked until comparison data is available.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold">{formatPlanChangeDirection(impact.direction)} preview</p>
        <Badge variant="secondary">{impact.currentPlan.name}</Badge>
        <span className="text-muted-foreground">→</span>
        <Badge variant="secondary">{impact.targetPlan.name}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ImpactList
          emptyLabel="No modules added"
          items={impact.modulesAdded}
          title="Modules gained"
          tone="success"
        />
        <ImpactList
          emptyLabel="No modules removed"
          explanation="Removed modules lose access in navigation. Existing records stay in the tenant database."
          items={impact.modulesRemoved}
          title="Modules disabled"
          tone="warning"
        />
        <ImpactList
          emptyLabel="No shared modules"
          items={impact.modulesRetained}
          title="Modules retained"
          tone="secondary"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Limit impact</p>
        {impact.limitChanges.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Limit</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>New</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {impact.limitChanges.map((limit) => (
                <TableRow key={limit.limitCode}>
                  <TableCell className="font-medium">{limit.limitCode}</TableCell>
                  <TableCell>{limit.currentLimit.toLocaleString()}</TableCell>
                  <TableCell>{limit.targetLimit.toLocaleString()}</TableCell>
                  <TableCell>
                    {limit.currentUsage != null ? limit.currentUsage.toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={limit.delta >= 0 ? "success" : "warning"}>
                      {limit.delta >= 0 ? "+" : ""}
                      {limit.delta.toLocaleString()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No plan limits configured for comparison.</p>
        )}
      </div>
    </div>
  );
}

function ImpactList({
  title,
  items,
  emptyLabel,
  explanation,
  tone,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
  explanation?: string;
  tone: "success" | "warning" | "secondary";
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm font-semibold">{title}</p>
      {explanation ? (
        <p className="mt-1 text-xs text-muted-foreground">{explanation}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-1">
        {items.length > 0 ? (
          items.map((item) => (
            <Badge key={item} variant={tone === "success" ? "success" : tone === "warning" ? "warning" : "secondary"}>
              {item}
            </Badge>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}

function PlanChangeResult({
  result,
  onDismiss,
}: {
  result: Subscription;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 p-4 dark:bg-emerald-950/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-emerald-900 dark:text-emerald-100">Plan change applied</p>
          <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
            Backend updated the subscription and synced entitlements. Navigation and module access
            will reflect the new plan shortly.
          </p>
        </div>
        <Button onClick={onDismiss} size="sm" type="button" variant="outline">
          Dismiss
        </Button>
      </div>
      <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
        <p>
          <span className="text-muted-foreground">New plan:</span>{" "}
          {result.planName ?? result.planCode ?? result.planId}
        </p>
        <p>
          <span className="text-muted-foreground">Status:</span>{" "}
          {formatSubscriptionStatus(result.status)}
        </p>
        <p>
          <span className="text-muted-foreground">Renewal:</span>{" "}
          {formatSubscriptionTimestamp(result.renewalAt)}
        </p>
        <p>
          <span className="text-muted-foreground">Period end:</span>{" "}
          {formatSubscriptionTimestamp(result.currentPeriodEnd)}
        </p>
      </div>
    </div>
  );
}
