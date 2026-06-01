"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import {
  formatSetupStepLabel,
  setupStepVariant,
  SETUP_STEP_ORDER,
  type TenantSetupProgress,
} from "@/domain/models/setup";

interface SetupStepTimelineProps {
  progress: TenantSetupProgress;
  activeStep?: string | null;
  onSelectStep?: (step: string) => void;
}

export function SetupStepTimeline({ progress, activeStep, onSelectStep }: SetupStepTimelineProps) {
  const steps = useMemo(() => {
    return SETUP_STEP_ORDER.map((code) => {
      const completed = progress.completedSteps.includes(code);
      const blocking = progress.blockingSteps.includes(code);
      const status: "completed" | "pending" | "blocking" = completed
        ? "completed"
        : blocking
          ? "blocking"
          : "pending";
      return { code, status, completed, blocking };
    });
  }, [progress]);

  return (
    <ol className="space-y-2">
      {steps.map((step) => {
        const isActive = activeStep === step.code;
        return (
          <li key={step.code}>
            <button
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                isActive ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40"
              }`}
              onClick={() => onSelectStep?.(step.code)}
              type="button"
            >
              {step.completed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : step.blocking ? (
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{formatSetupStepLabel(step.code)}</p>
                  <Badge variant={setupStepVariant(step.status)}>
                    {step.completed ? "Completed" : step.blocking ? "Required" : "Pending"}
                  </Badge>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
