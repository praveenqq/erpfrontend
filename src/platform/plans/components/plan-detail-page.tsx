"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { ROUTES } from "@/common/navigation/routes";
import {
  formatBillingCycle,
  formatPlanPrice,
  formatPlanStatus,
  formatPlanVisibility,
  type PlanStatus,
} from "@/domain/models/plan";
import {
  useArchivePlan,
  useCreatePlanVersion,
  useDeprecatePlan,
  usePlan,
  usePublishPlan,
} from "@/platform/plans/api/plan-queries";
import { PlanEditForm } from "@/platform/plans/components/plan-edit-form";
import { PlanLimitsForm } from "@/platform/plans/components/plan-limits-form";
import { PlanModuleMappingForm } from "@/platform/plans/components/plan-module-mapping-form";
import { PlanPriceForm } from "@/platform/plans/components/plan-price-form";
import { RoleGuard } from "@/security/guards/role-guard";
import { AuditLink } from "@/common/components/audit/audit-link";

function statusVariant(status: PlanStatus) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "DRAFT":
      return "secondary" as const;
    case "DEPRECATED":
      return "warning" as const;
    case "ARCHIVED":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export function PlanDetailPage({ id }: { id: string }) {
  const { data: plan, isLoading, error } = usePlan(id);
  const publishPlan = usePublishPlan(id);
  const deprecatePlan = useDeprecatePlan(id);
  const archivePlan = useArchivePlan(id);
  const createVersion = useCreatePlanVersion(id);
  const [reason, setReason] = useState("");

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading plan details…
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Plan not found</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Unable to load this plan."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={ROUTES.SUPER_ADMIN_PLANS}>Back to plans</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const runAction = async (
    action: "publish" | "deprecate" | "archive" | "version",
  ) => {
    try {
      if (action === "publish") await publishPlan.mutateAsync();
      if (action === "deprecate") await deprecatePlan.mutateAsync(reason || undefined);
      if (action === "archive") await archivePlan.mutateAsync(reason || undefined);
      if (action === "version") await createVersion.mutateAsync();
      toast.success("Plan updated");
      setReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Plan action failed");
    }
  };

  const actionPending =
    publishPlan.isPending ||
    deprecatePlan.isPending ||
    archivePlan.isPending ||
    createVersion.isPending;

  return (
    <RoleGuard permissions={["PLAN_VIEW_INTERNAL", "SUPER_ADMIN_ACCESS"]} match="any">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.SUPER_ADMIN_PLANS}>
              <ArrowLeft className="h-4 w-4" />
              Back to plans
            </Link>
          </Button>
          <Badge variant={statusVariant(plan.status)}>{formatPlanStatus(plan.status)}</Badge>
          <Badge variant="outline">v{plan.currentVersion}</Badge>
          <Badge variant="outline">{plan.planType}</Badge>
          <AuditLink label="Plan audit log" variant="button" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>
              <span className="font-mono">{plan.code}</span>
              {" · "}
              {plan.description || "No description provided"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
            <p><span className="text-muted-foreground">Visibility:</span> {formatPlanVisibility(plan.visibility)}</p>
            <p><span className="text-muted-foreground">Trial days:</span> {plan.trialDays ?? "None"}</p>
            <p><span className="text-muted-foreground">Pricing:</span> {formatPlanPrice(plan)}</p>
            <p><span className="text-muted-foreground">Billing cycle:</span> {formatBillingCycle(plan.billingCycle)}</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Edit plan</CardTitle>
              <CardDescription>Update commercial metadata and visibility.</CardDescription>
            </CardHeader>
            <CardContent>
              <PlanEditForm plan={plan} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lifecycle actions</CardTitle>
              <CardDescription>Publish, deprecate, archive, or create a new version.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-reason">Reason (optional)</Label>
                <Input
                  id="plan-reason"
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Reason for deprecate or archive"
                  value={reason}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={actionPending || plan.status === "ACTIVE"}
                  onClick={() => runAction("publish")}
                  type="button"
                >
                  Publish
                </Button>
                <Button
                  disabled={actionPending || plan.status !== "ACTIVE"}
                  onClick={() => runAction("deprecate")}
                  type="button"
                  variant="outline"
                >
                  Deprecate
                </Button>
                <Button
                  disabled={actionPending || plan.status === "ARCHIVED"}
                  onClick={() => runAction("archive")}
                  type="button"
                  variant="outline"
                >
                  Archive
                </Button>
                <Button
                  disabled={actionPending}
                  onClick={() => runAction("version")}
                  type="button"
                  variant="secondary"
                >
                  New version
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Configure the active plan version price and billing cycle.</CardDescription>
            </CardHeader>
            <CardContent>
              <PlanPriceForm plan={plan} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limits</CardTitle>
              <CardDescription>Set usage limits enforced when tenants subscribe to this plan.</CardDescription>
            </CardHeader>
            <CardContent>
              <PlanLimitsForm plan={plan} />
            </CardContent>
          </Card>
        </div>

        <PlanModuleMappingForm
          key={`${plan.id}-${plan.currentVersion}-${plan.modules.join(",")}`}
          plan={plan}
        />

        <Card>
          <CardHeader>
            <CardTitle>Configured limits</CardTitle>
            <CardDescription>Read-only view of limits currently attached to this plan.</CardDescription>
          </CardHeader>
          <CardContent>
            {plan.limits.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Limit code</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Enforcement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.limits.map((limit) => (
                    <TableRow key={`${limit.limitCode}-${limit.limitType}`}>
                      <TableCell className="font-medium">{limit.limitCode}</TableCell>
                      <TableCell>{limit.limitValue.toLocaleString()}</TableCell>
                      <TableCell>{limit.limitType}</TableCell>
                      <TableCell>{limit.enforcementType}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No limits configured for this plan yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
