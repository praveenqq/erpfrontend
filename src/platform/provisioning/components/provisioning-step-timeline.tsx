"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import {
  formatProvisioningStepLabel,
  formatProvisioningTimestamp,
  isAdminProvisioningStep,
  isCompanySetupStep,
  provisioningStepVariant,
  sortProvisioningSteps,
  type ProvisioningStep,
} from "@/domain/models/provisioning";

interface ProvisioningStepTimelineProps {
  steps: ProvisioningStep[];
  currentStep?: string;
}

function StepIcon({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "FAILED":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "IN_PROGRESS":
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

export function ProvisioningStepTimeline({ steps, currentStep }: ProvisioningStepTimelineProps) {
  const orderedSteps = useMemo(() => sortProvisioningSteps(steps), [steps]);

  if (orderedSteps.length === 0) {
    return <p className="text-sm text-muted-foreground">No provisioning steps recorded yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {orderedSteps.map((step) => {
        const isCurrent = currentStep === step.stepCode;
        return (
          <li
            className={`flex gap-3 rounded-xl border p-4 ${isCurrent ? "border-primary/40 bg-primary/5" : ""}`}
            key={step.stepCode}
          >
            <StepIcon status={step.status} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{formatProvisioningStepLabel(step.stepCode)}</p>
                <Badge variant={provisioningStepVariant(step.status)}>{step.status}</Badge>
                {isAdminProvisioningStep(step.stepCode) ? (
                  <Badge variant="outline">Default admin</Badge>
                ) : null}
                {isCompanySetupStep(step.stepCode) ? (
                  <Badge variant="outline">Company setup</Badge>
                ) : null}
                {isCurrent ? <Badge variant="secondary">Current</Badge> : null}
              </div>
              <div className="grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
                <p>Started: {formatProvisioningTimestamp(step.startedAt)}</p>
                <p>Completed: {formatProvisioningTimestamp(step.completedAt)}</p>
              </div>
              {step.failureReason ? (
                <p className="text-sm text-destructive">{step.failureReason}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
