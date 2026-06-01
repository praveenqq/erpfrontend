"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { useRetryProvisioning } from "@/platform/provisioning/api/provisioning-queries";

interface ProvisioningRetryPanelProps {
  tenantId: string;
  disabled?: boolean;
}

export function ProvisioningRetryPanel({ tenantId, disabled }: ProvisioningRetryPanelProps) {
  const retry = useRetryProvisioning(tenantId);
  const [reason, setReason] = useState("");

  const submit = async () => {
    if (reason.trim().length < 3) {
      toast.error("Provide a reason before retrying provisioning");
      return;
    }
    try {
      await retry.mutateAsync({ reason: reason.trim() });
      toast.success("Provisioning retry started");
      setReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to retry provisioning");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Retry resumes the backend orchestrator from the failed step. Idempotency rules prevent duplicate workspace data.
      </p>
      <div className="space-y-2">
        <Label htmlFor="provisioning-retry-reason">Reason</Label>
        <Input
          id="provisioning-retry-reason"
          onChange={(event) => setReason(event.target.value)}
          placeholder="Required for audit trail"
          value={reason}
        />
      </div>
      <Button
        disabled={disabled || retry.isPending || reason.trim().length < 3}
        onClick={submit}
        type="button"
        variant="destructive"
      >
        {retry.isPending ? "Retrying…" : "Retry failed provisioning"}
      </Button>
    </div>
  );
}
