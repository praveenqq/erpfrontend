"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
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
  formatProvisioningStatus,
  formatProvisioningStepLabel,
  formatProvisioningTimestamp,
  isAdminProvisioningStep,
  isCompanySetupStep,
  provisioningStatusVariant,
  sortProvisioningSteps,
} from "@/domain/models/provisioning";
import { formatTenantStatus, tenantStatusVariant } from "@/domain/models/tenant";
import { useProvisioningStatus } from "@/platform/provisioning/api/provisioning-queries";
import { ProvisioningRetryPanel } from "@/platform/provisioning/components/provisioning-retry-panel";
import { ProvisioningStepTimeline } from "@/platform/provisioning/components/provisioning-step-timeline";
import { useTenant } from "@/platform/tenants/api/tenant-queries";
import { RoleGuard } from "@/security/guards/role-guard";
import { AuditLink } from "@/common/components/audit/audit-link";

export function ProvisioningDetailPage({ tenantId }: { tenantId: string }) {
  const { data: tenant } = useTenant(tenantId);
  const { data: job, isLoading, error, refetch } = useProvisioningStatus(tenantId);

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading provisioning job…
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Provisioning job not found</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Unable to load provisioning status for this tenant."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={ROUTES.SUPER_ADMIN_PROVISIONING}>Back to provisioning</Link>
          </Button>
          <Button onClick={() => refetch()} type="button" variant="outline">
            Retry load
          </Button>
        </CardContent>
      </Card>
    );
  }

  const orderedSteps = sortProvisioningSteps(job.steps);
  const adminSteps = orderedSteps.filter((step) => isAdminProvisioningStep(step.stepCode));
  const companySteps = orderedSteps.filter((step) => isCompanySetupStep(step.stepCode));
  const adminComplete =
    adminSteps.length > 0 && adminSteps.every((step) => step.status === "COMPLETED");
  const companyComplete =
    companySteps.length > 0 && companySteps.every((step) => step.status === "COMPLETED");
  const canRetry = job.status === "FAILED";

  return (
    <RoleGuard
      match="any"
      permissions={[
        "SUPER_ADMIN_PROVISIONING_MANAGE",
        "SUPER_ADMIN_ACCESS",
        "TENANT_CREATE",
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.SUPER_ADMIN_PROVISIONING}>
              <ArrowLeft className="h-4 w-4" />
              Back to provisioning
            </Link>
          </Button>
          <Badge variant={provisioningStatusVariant(job.status)}>
            {formatProvisioningStatus(job.status)}
          </Badge>
          {tenant ? (
            <Badge variant={tenantStatusVariant(tenant.status)}>
              {formatTenantStatus(tenant.status)}
            </Badge>
          ) : null}
          <AuditLink tenantId={tenantId} label="Tenant audit" variant="button" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Job ID", value: job.jobId.slice(0, 8) },
            {
              label: "Current step",
              value: job.currentStep ? formatProvisioningStepLabel(job.currentStep) : "—",
            },
            { label: "Setup progress", value: `${job.setupProgressPercent}%` },
            { label: "Default admin", value: adminComplete ? "Ready" : "Pending" },
            { label: "Company setup", value: companyComplete ? "Ready" : "Pending" },
          ].map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="text-xl">{item.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Provisioning timeline</CardTitle>
              <CardDescription>
                Backend-controlled step execution with idempotent workspace creation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProvisioningStepTimeline currentStep={job.currentStep} steps={job.steps} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Started:</span>{" "}
                  {formatProvisioningTimestamp(job.startedAt)}
                </p>
                <p>
                  <span className="text-muted-foreground">Completed:</span>{" "}
                  {formatProvisioningTimestamp(job.completedAt)}
                </p>
                {job.lastError ? (
                  <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive">
                    {job.lastError}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No errors recorded for the current job.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related workspace</CardTitle>
                <CardDescription>Open the organization workspace once onboarding completes.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={ROUTES.PLATFORM_TENANT_DETAIL(tenantId)}>
                    <ExternalLink className="h-4 w-4" />
                    Organization overview
                  </Link>
                </Button>
                {tenant?.primaryContactEmail ? (
                  <p className="w-full text-sm text-muted-foreground">
                    Admin contact: {tenant.primaryContactEmail}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {canRetry ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Retry failed provisioning</CardTitle>
                  <CardDescription>
                    Resume from the failed step without duplicating organization data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProvisioningRetryPanel tenantId={tenantId} />
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
