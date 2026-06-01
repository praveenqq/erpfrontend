"use client";

import { useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
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
import { isNonBillableTenantType } from "@/common/copy/workspace-labels";
import {
  formatModuleEntitlementStatus,
  isModuleEntitled,
  moduleEntitlementVariant,
  type TenantModuleAccess,
} from "@/domain/models/tenant-modules";
import { useModuleRegistry } from "@/platform/moduleaccess/api/module-registry-queries";
import { resolveBlockedReason } from "@/platform/moduleaccess/config/navigation-blocked-reasons";
import {
  useDisableTenantModule,
  useEnableTenantModule,
  useStartTenantModuleTrial,
  useTenantModules,
} from "@/platform/tenants/api/tenant-queries";
import { RoleGuard } from "@/security/guards/role-guard";

type ModuleAction = "enable" | "disable" | "trial";

interface TenantModuleAccessPanelProps {
  tenantId: string;
  tenantType?: string | null;
}

function moduleDisplayName(code: string, registryNames: Map<string, string>): string {
  return registryNames.get(code) ?? code.replace(/_/g, " ");
}

function accessStatusLabel(access: TenantModuleAccess): string {
  if (access.canAccess) return "Accessible";
  if (isModuleEntitled(access)) return "Entitled but blocked";
  return "Not entitled";
}

function accessStatusVariant(access: TenantModuleAccess) {
  if (access.canAccess) return "success" as const;
  if (isModuleEntitled(access)) return "warning" as const;
  return "secondary" as const;
}

export function TenantModuleAccessPanel({
  tenantId,
  tenantType,
}: TenantModuleAccessPanelProps) {
  const { data, isLoading, error, refetch, isFetching } = useTenantModules(tenantId);
  const { data: registry } = useModuleRegistry();
  const enableModule = useEnableTenantModule(tenantId);
  const disableModule = useDisableTenantModule(tenantId);
  const startTrial = useStartTenantModuleTrial(tenantId);

  const [activeAction, setActiveAction] = useState<{
    moduleCode: string;
    action: ModuleAction;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [trialDays, setTrialDays] = useState("14");
  const [enterpriseOverride, setEnterpriseOverride] = useState(false);

  const registryNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of registry ?? []) {
      map.set(entry.code, entry.name);
    }
    return map;
  }, [registry]);

  const rows = useMemo(() => {
    return [...(data?.modules ?? [])].sort((a, b) =>
      a.moduleCode.localeCompare(b.moduleCode),
    );
  }, [data?.modules]);

  const isOperatorWorkspace = isNonBillableTenantType(tenantType);
  const isPending =
    enableModule.isPending || disableModule.isPending || startTrial.isPending;

  const closeDialog = () => {
    setActiveAction(null);
    setReason("");
    setTrialDays("14");
    setEnterpriseOverride(false);
  };

  const submitAction = async () => {
    if (!activeAction) return;
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 3) {
      toast.error("Provide a reason for the audit trail");
      return;
    }

    try {
      if (activeAction.action === "enable") {
        await enableModule.mutateAsync({
          moduleCode: activeAction.moduleCode,
          reason: trimmedReason,
          enterpriseOverride,
        });
        toast.success(`${activeAction.moduleCode} enabled`);
      } else if (activeAction.action === "disable") {
        await disableModule.mutateAsync({
          moduleCode: activeAction.moduleCode,
          reason: trimmedReason,
        });
        toast.success(`${activeAction.moduleCode} disabled`);
      } else {
        const days = Number.parseInt(trialDays, 10);
        await startTrial.mutateAsync({
          moduleCode: activeAction.moduleCode,
          reason: trimmedReason,
          trialDays: Number.isFinite(days) && days > 0 ? days : 14,
        });
        toast.success(`${activeAction.moduleCode} trial started`);
      }
      closeDialog();
    } catch (actionError) {
      toast.error(
        actionError instanceof Error ? actionError.message : "Module action failed",
      );
    }
  };

  if (isOperatorWorkspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Module access</CardTitle>
          <CardDescription>
            Platform operator workspaces do not use customer module entitlements. Module
            management applies to customer organizations only.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <RoleGuard
      match="any"
      permissions={["SUPER_ADMIN_MODULE_MANAGE", "SUPER_ADMIN_ACCESS"]}
    >
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Module access management</CardTitle>
            <CardDescription>
              Enable, disable, or start trials for business modules. Changes are audited and
              take effect immediately for this organization.
            </CardDescription>
          </div>
          <Button
            disabled={isLoading || isFetching}
            onClick={() => refetch()}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex min-h-[120px] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : null}

          {error ? (
            <div className="space-y-3">
              <p className="text-sm text-destructive">
                {error instanceof Error ? error.message : "Failed to load module access"}
              </p>
              <Button onClick={() => refetch()} type="button" variant="outline">
                Retry
              </Button>
            </div>
          ) : null}

          {!isLoading && !error ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: "Accessible now",
                    value: rows.filter((row) => row.canAccess).length,
                  },
                  {
                    label: "Entitled",
                    value: rows.filter((row) => isModuleEntitled(row)).length,
                  },
                  { label: "Catalog modules", value: rows.length },
                ].map((item) => (
                  <div className="rounded-xl border p-4" key={item.label}>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{item.value}</p>
                  </div>
                ))}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Entitlement</TableHead>
                    <TableHead>User access</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const blocked = resolveBlockedReason(
                      row.reasonCode,
                      row.reasonMessage,
                    );
                    const entitled = isModuleEntitled(row);

                    return (
                      <TableRow key={row.moduleCode}>
                        <TableCell>
                          <p className="font-medium">
                            {moduleDisplayName(row.moduleCode, registryNames)}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {row.moduleCode}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={moduleEntitlementVariant(row.entitlementStatus)}>
                            {formatModuleEntitlementStatus(row.entitlementStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={accessStatusVariant(row)}>
                            {accessStatusLabel(row)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.source ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-xs text-sm text-muted-foreground">
                          {row.canAccess
                            ? "Users with module permissions can open this module."
                            : (blocked?.message ??
                              row.reasonMessage ??
                              "Blocked by entitlement rules.")}
                          {row.missingDependencies.length > 0 ? (
                            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                              Requires: {row.missingDependencies.join(", ")}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            {!entitled ? (
                              <>
                                <Button
                                  onClick={() =>
                                    setActiveAction({
                                      moduleCode: row.moduleCode,
                                      action: "enable",
                                    })
                                  }
                                  size="sm"
                                  type="button"
                                  variant="default"
                                >
                                  Enable
                                </Button>
                                <Button
                                  onClick={() =>
                                    setActiveAction({
                                      moduleCode: row.moduleCode,
                                      action: "trial",
                                    })
                                  }
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                >
                                  Start trial
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() =>
                                  setActiveAction({
                                    moduleCode: row.moduleCode,
                                    action: "disable",
                                  })
                                }
                                size="sm"
                                type="button"
                                variant="outline"
                              >
                                Disable
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No modules are registered for this organization yet.
                </p>
              ) : null}
            </>
          ) : null}

          {activeAction ? (
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-semibold">
                {activeAction.action === "enable"
                  ? "Enable module"
                  : activeAction.action === "disable"
                    ? "Disable module"
                    : "Start module trial"}
                {": "}
                {moduleDisplayName(activeAction.moduleCode, registryNames)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                A reason is required and will be stored in the entitlement audit log.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="module-action-reason">Reason</Label>
                  <Input
                    id="module-action-reason"
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Required for audit trail"
                    value={reason}
                  />
                </div>
                {activeAction.action === "trial" ? (
                  <div className="space-y-2">
                    <Label htmlFor="module-trial-days">Trial days</Label>
                    <Input
                      id="module-trial-days"
                      inputMode="numeric"
                      min={1}
                      onChange={(event) => setTrialDays(event.target.value)}
                      type="number"
                      value={trialDays}
                    />
                  </div>
                ) : null}
                {activeAction.action === "enable" ? (
                  <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <input
                      checked={enterpriseOverride}
                      className="h-4 w-4 rounded border"
                      onChange={(event) => setEnterpriseOverride(event.target.checked)}
                      type="checkbox"
                    />
                    Enterprise override (bypass dependency checks when permitted)
                  </label>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button disabled={isPending} onClick={submitAction} type="button">
                  {isPending ? "Saving…" : "Confirm"}
                </Button>
                <Button
                  disabled={isPending}
                  onClick={closeDialog}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
