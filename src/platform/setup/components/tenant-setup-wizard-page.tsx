"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { ROUTES } from "@/common/navigation/routes";
import {
  formatSetupStepLabel,
  getNextSetupStep,
  SETUP_STEP_DEFINITIONS,
} from "@/domain/models/setup";
import { useSetupProgress } from "@/platform/setup/api/setup-queries";
import {
  getSetupStepDefinition,
  SetupStepPanel,
} from "@/platform/setup/components/setup-step-panel";
import { SetupStepTimeline } from "@/platform/setup/components/setup-step-timeline";
import { SetupOrganizationSummary } from "@/platform/setup/components/setup-organization-summary";
import { RoleGuard } from "@/security/guards/role-guard";
import { AuditLink } from "@/common/components/audit/audit-link";
import { useTenant } from "@/tenancy/context/tenant-context";

export function TenantSetupWizardPage() {
  const { tenantId } = useTenant();
  const { data: progress, isLoading, error, refetch } = useSetupProgress();
  const nextStep = progress ? getNextSetupStep(progress) : null;
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const defaultActiveStep = useMemo(() => {
    if (!progress) return null;
    return (
      nextStep ??
      progress.completedSteps.at(-1) ??
      SETUP_STEP_DEFINITIONS[0]?.code ??
      null
    );
  }, [progress, nextStep]);

  const activeStep = selectedStep ?? defaultActiveStep;

  const activeDefinition = useMemo(
    () => (activeStep ? getSetupStepDefinition(activeStep) : undefined),
    [activeStep],
  );

  return (
    <RoleGuard match="any" permissions={["TENANT_VIEW", "TENANT_UPDATE", "SUPER_ADMIN_ACCESS"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <AuditLink tenantScoped label="Setup audit log" variant="button" />
        </div>

        {!tenantId ? (
          <Card className="border-amber-500/30">
            <CardHeader>
              <CardTitle>Organization context required</CardTitle>
              <CardDescription>
                Company setup runs inside a signed-in organization. Sign in with an organization admin account or set{" "}
                <code className="text-xs">NEXT_PUBLIC_DEV_TENANT_ID</code> in development mode.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {tenantId && isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading setup progress…
            </div>
          </div>
        ) : null}

        {tenantId && error ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Unable to load setup wizard</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Failed to load company setup progress"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => refetch()} type="button" variant="outline">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {tenantId && !isLoading && !error && progress ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Progress", value: `${progress.setupProgressPercent}%` },
                {
                  label: "Minimum setup",
                  value: progress.minimumSetupComplete ? "Complete" : "Incomplete",
                },
                { label: "Completed steps", value: progress.completedSteps.length },
                { label: "Blocking steps", value: progress.blockingSteps.length },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-2xl">{item.value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {!progress.minimumSetupComplete ? (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Setup incomplete — paid modules remain blocked
                  </CardTitle>
                  <CardDescription>
                    {nextStep
                      ? `Next required action: ${formatSetupStepLabel(nextStep)}`
                      : "Complete the remaining blocking steps to unlock operational modules."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardHeader>
                  <CardTitle className="text-base">Minimum setup complete</CardTitle>
                  <CardDescription>
                    Core company structure is ready. Remaining optional steps can be finished anytime.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Setup checklist</CardTitle>
                  <CardDescription>
                    Select a step to review requirements and mark it complete. Each completion is audited.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SetupStepTimeline
                    activeStep={activeStep}
                    onSelectStep={setSelectedStep}
                    progress={progress}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{activeDefinition?.label ?? "Setup step"}</CardTitle>
                    {activeStep && progress.completedSteps.includes(activeStep) ? (
                      <Badge variant="success">Completed</Badge>
                    ) : activeStep && progress.blockingSteps.includes(activeStep) ? (
                      <Badge variant="warning">Required</Badge>
                    ) : null}
                  </div>
                  <CardDescription>
                    {activeDefinition?.description ?? "Choose a setup step from the checklist."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeDefinition ? (
                    <SetupStepPanel progress={progress} step={activeDefinition} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a step to begin.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Organization structure</CardTitle>
                <CardDescription>
                  Live organization data used by setup, access control, and module provisioning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SetupOrganizationSummary />
              </CardContent>
            </Card>

            {progress.minimumSetupComplete ? (
              <Card>
                <CardHeader>
                  <CardTitle>Continue to operations</CardTitle>
                  <CardDescription>Setup is sufficient to start using enabled business modules.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href={ROUTES.HOME}>Return to dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : null}
      </div>
    </RoleGuard>
  );
}
