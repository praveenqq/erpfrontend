"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import type { TenantStatus } from "@/domain/models/tenant";
import { useUpdateTenantStatus } from "@/platform/tenants/api/tenant-queries";

const STATUS_OPTIONS: TenantStatus[] = [
  "PENDING",
  "PROVISIONING",
  "ACTIVE",
  "SUSPENDED",
  "CANCELLED",
  "ARCHIVED",
];

interface TenantStatusActionsProps {
  tenantId: string;
  currentStatus: string;
}

export function TenantStatusActions({ tenantId, currentStatus }: TenantStatusActionsProps) {
  const updateStatus = useUpdateTenantStatus(tenantId);
  const [status, setStatus] = useState<TenantStatus>(
    STATUS_OPTIONS.includes(currentStatus as TenantStatus)
      ? (currentStatus as TenantStatus)
      : "ACTIVE",
  );
  const [reason, setReason] = useState("");

  const submit = async () => {
    if (reason.trim().length < 3) {
      toast.error("Provide a reason for the status change");
      return;
    }
    try {
      await updateStatus.mutateAsync({ status, reason: reason.trim() });
      toast.success("Tenant status updated");
      setReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update tenant status");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tenant-status-select">New status</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            id="tenant-status-select"
            onChange={(event) => setStatus(event.target.value as TenantStatus)}
            value={status}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tenant-status-reason">Reason</Label>
          <Input
            id="tenant-status-reason"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Required for audit trail"
            value={reason}
          />
        </div>
      </div>
      <Button
        disabled={updateStatus.isPending || reason.trim().length < 3}
        onClick={submit}
        type="button"
      >
        {updateStatus.isPending ? "Updating…" : "Update tenant status"}
      </Button>
    </div>
  );
}
