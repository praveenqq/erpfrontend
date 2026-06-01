"use client";

import { Blocks, CheckCircle2, CircleDollarSign, Layers3 } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import {
  formatModuleType,
  getModuleCatalogLabels,
  type ModuleRegistryEntry,
} from "@/domain/models/module-registry";

interface ModuleRegistryDetailPanelProps {
  entry: ModuleRegistryEntry;
  onClose: () => void;
}

export function ModuleRegistryDetailPanel({ entry, onClose }: ModuleRegistryDetailPanelProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>{entry.name}</CardTitle>
          <CardDescription>
            Product capability definition for <span className="font-mono">{entry.code}</span>
          </CardDescription>
        </div>
        <button
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <section className="rounded-xl border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold">Module dependencies</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Other ERP modules that must be available before this module can be enabled.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.dependsOnModules.length > 0 ? (
                entry.dependsOnModules.map((dependency) => (
                  <Badge key={dependency} variant="outline">
                    {dependency}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No module dependencies</span>
              )}
            </div>
          </section>

          <section className="rounded-xl border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold">Platform capability dependencies</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Shared platform services required for entitlement and runtime access.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.platformCapabilities.length > 0 ? (
                entry.platformCapabilities.map((capability) => (
                  <Badge key={capability} variant="secondary">
                    {capability}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No platform capabilities required</span>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Catalog attributes
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Type</dt>
                <dd>
                  <Badge variant="outline">{formatModuleType(entry.moduleType)}</Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Core module</dt>
                <dd>{entry.core ? "Yes" : "No"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Paid add-on</dt>
                <dd>{entry.paid ? "Yes" : "No"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Enabled by default</dt>
                <dd>{entry.enabledByDefault ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Plan packaging note</p>
            <p className="mt-2">
              Plan screens should reference this registry entry instead of hardcoding module codes.
              Dependency rules are enforced by the backend when mapping modules to plans.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {getModuleCatalogLabels(entry).map((label) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}

interface ModuleRegistrySummaryProps {
  modules: ModuleRegistryEntry[];
}

export function ModuleRegistrySummary({ modules }: ModuleRegistrySummaryProps) {
  const coreCount = modules.filter((item) => item.core).length;
  const paidCount = modules.filter((item) => item.paid).length;
  const defaultCount = modules.filter((item) => item.enabledByDefault).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        {
          label: "Catalog modules",
          value: modules.length,
          detail: "Product capabilities defined by the backend registry",
          icon: Blocks,
        },
        {
          label: "Core modules",
          value: coreCount,
          detail: "Foundation capabilities required for platform packaging",
          icon: Layers3,
        },
        {
          label: "Paid add-ons",
          value: paidCount,
          detail: "Commercial modules typically mapped to paid plans",
          icon: CircleDollarSign,
        },
        {
          label: "Default enabled",
          value: defaultCount,
          detail: "Modules enabled automatically for new tenants",
          icon: CheckCircle2,
        },
      ].map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardDescription>{item.label}</CardDescription>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-3xl tabular-nums">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{item.detail}</CardContent>
          </Card>
        );
      })}
    </div>
  );
}
