"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
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
  formatModuleType,
  getModuleCatalogLabels,
} from "@/domain/models/module-registry";
import type { Plan } from "@/domain/models/plan";
import { useModuleRegistry } from "@/platform/moduleaccess/api/module-registry-queries";
import { useConfigurePlanModules } from "@/platform/plans/api/plan-queries";
import { useAuth } from "@/security/auth/auth-provider";
import {
  defaultSelectedModules,
  validateModuleSelection,
  withRequiredDependencies,
} from "@/platform/plans/utils/plan-module-validation";

interface PlanModuleMappingFormProps {
  plan: Plan;
}

export function PlanModuleMappingForm({ plan }: PlanModuleMappingFormProps) {
  const { data: registry, isLoading, error } = useModuleRegistry();
  const configureModules = useConfigurePlanModules(plan.id);
  const { hasAnyPermission } = useAuth();
  const canManageEntitlements = hasAnyPermission(["PLAN_ENTITLEMENT_MANAGE", "SUPER_ADMIN_ACCESS"]);
  const [version, setVersion] = useState(plan.currentVersion);
  const [selectedModules, setSelectedModules] = useState<string[]>(plan.modules);
  const [search, setSearch] = useState("");

  const sortedRegistry = useMemo(
    () => [...(registry ?? [])].sort((a, b) => a.code.localeCompare(b.code)),
    [registry],
  );

  const filteredRegistry = useMemo(() => {
    if (!search.trim()) return sortedRegistry;
    const query = search.trim().toLowerCase();
    return sortedRegistry.filter(
      (entry) =>
        entry.code.toLowerCase().includes(query) ||
        entry.name.toLowerCase().includes(query) ||
        entry.moduleType.toLowerCase().includes(query),
    );
  }, [search, sortedRegistry]);

  const validation = useMemo(
    () => validateModuleSelection(selectedModules, sortedRegistry),
    [selectedModules, sortedRegistry],
  );

  const toggleModule = (moduleCode: string, checked: boolean) => {
    setSelectedModules((current) => {
      if (checked) {
        return withRequiredDependencies([...current, moduleCode], sortedRegistry);
      }
      return current.filter((code) => code !== moduleCode);
    });
  };

  const applyDefaults = () => {
    setSelectedModules(defaultSelectedModules(sortedRegistry));
  };

  const includeRequiredModules = () => {
    setSelectedModules(withRequiredDependencies(selectedModules, sortedRegistry));
  };

  const saveMapping = async () => {
    if (!validation.valid) {
      toast.error("Resolve dependency warnings before saving module mapping.");
      return;
    }

    try {
      await configureModules.mutateAsync({
        version,
        modules: selectedModules,
      });
      toast.success("Plan module mapping saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save module mapping");
    }
  };

  const mappingLocked = plan.status === "ARCHIVED" || !canManageEntitlements;

  return (
    <Card id="plan-module-mapping">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Plan to module mapping</CardTitle>
            <CardDescription>
              Select modules from the backend registry for plan version packaging. Dependency rules mirror the backend validator.
            </CardDescription>
          </div>
          <Link
            className="text-sm font-medium text-primary hover:underline"
            href={ROUTES.SUPER_ADMIN_MODULE_REGISTRY}
          >
            Open module registry
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {plan.status === "ACTIVE" || plan.status === "DEPRECATED" ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900">
            Published plans require a new draft version before module mapping can be saved. Create a new version above, then configure modules for that version.
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading module registry catalog…
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load module registry"}
          </p>
        ) : null}

        {registry ? (
          <>
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="mapping-version">Plan version</Label>
                <Input
                  id="mapping-version"
                  min={1}
                  onChange={(event) => setVersion(Number(event.target.value) || plan.currentVersion)}
                  type="number"
                  value={version}
                />
              </div>
              <Button onClick={applyDefaults} type="button" variant="outline">
                <Sparkles className="h-4 w-4" />
                Apply defaults
              </Button>
              <Button
                disabled={validation.requiredModules.length === 0}
                onClick={includeRequiredModules}
                type="button"
                variant="secondary"
              >
                Include required modules
              </Button>
            </div>

            <Input
              aria-label="Search modules"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search registry modules…"
              value={search}
            />

            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-3">
                {filteredRegistry.map((entry) => {
                  const checked = selectedModules.includes(entry.code);
                  return (
                    <label
                      key={entry.code}
                      className="flex cursor-pointer gap-3 rounded-xl border p-4 transition hover:border-primary/30"
                    >
                      <input
                        checked={checked}
                        className="mt-1"
                        disabled={mappingLocked}
                        onChange={(event) => toggleModule(entry.code, event.target.checked)}
                        type="checkbox"
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{entry.name}</p>
                          <Badge variant="outline">{entry.code}</Badge>
                          <Badge variant="secondary">{formatModuleType(entry.moduleType)}</Badge>
                          {getModuleCatalogLabels(entry).map((label) => (
                            <Badge key={label} variant="secondary">
                              {label}
                            </Badge>
                          ))}
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>
                            Module dependencies:{" "}
                            {entry.dependsOnModules.length > 0
                              ? entry.dependsOnModules.join(", ")
                              : "None"}
                          </p>
                          <p>
                            Platform capabilities:{" "}
                            {entry.platformCapabilities.length > 0
                              ? entry.platformCapabilities.join(", ")
                              : "None"}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="space-y-4">
                <section className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2">
                    {validation.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    )}
                    <p className="text-sm font-semibold">Dependency validation</p>
                  </div>
                  {validation.valid ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selected modules satisfy backend dependency rules.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm text-amber-900">
                      {validation.issues.map((issue) => (
                        <li key={`${issue.moduleCode}-${issue.missingDependency}`}>
                          {issue.moduleCode} requires {issue.missingDependency}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-xl border p-4">
                  <p className="text-sm font-semibold">Required modules to add</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {validation.requiredModules.length > 0 ? (
                      validation.requiredModules.map((moduleCode) => (
                        <Badge key={moduleCode} variant="warning">
                          {moduleCode}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No missing dependencies</span>
                    )}
                  </div>
                </section>

                <section className="rounded-xl border p-4">
                  <p className="text-sm font-semibold">Platform capabilities required</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {validation.platformCapabilities.length > 0 ? (
                      validation.platformCapabilities.map((capability) => (
                        <Badge key={capability} variant="outline">
                          {capability}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None required</span>
                    )}
                  </div>
                </section>

                <section className="rounded-xl border p-4">
                  <p className="text-sm font-semibold">Selected modules</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedModules.length > 0 ? (
                      selectedModules.map((moduleCode) => (
                        <Badge key={moduleCode}>{moduleCode}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No modules selected</span>
                    )}
                  </div>
                </section>
              </div>
            </div>

            <section className="rounded-xl border p-4">
              <p className="text-sm font-semibold">Plan limits for this package</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Limits apply at plan level and are enforced alongside the selected module entitlements.
              </p>
              {plan.limits.length > 0 ? (
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Limit code</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Enforcement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plan.limits.map((limit) => (
                      <TableRow key={`${limit.limitCode}-${limit.limitType}`}>
                        <TableCell>{limit.limitCode}</TableCell>
                        <TableCell>{limit.limitValue.toLocaleString()}</TableCell>
                        <TableCell>{limit.enforcementType}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No plan limits configured yet. Configure limits in the section above before publishing.
                </p>
              )}
            </section>

            <div className="flex flex-wrap gap-3">
              <Button
                disabled={
                  mappingLocked ||
                  configureModules.isPending ||
                  selectedModules.length === 0 ||
                  !validation.valid
                }
                onClick={saveMapping}
                type="button"
              >
                {configureModules.isPending ? "Saving…" : "Save module mapping"}
              </Button>
              {!canManageEntitlements ? (
                <p className="text-xs text-muted-foreground self-center">
                  PLAN_ENTITLEMENT_MANAGE permission is required to change module mapping.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground self-center">
                  Saving is audited by the backend as a plan entitlement change.
                </p>
              )}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
