"use client";

import { useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { DataTable } from "@/common/components/data-table/data-table";
import { useDebounce } from "@/common/hooks/use-debounce";
import type { ModuleRegistryEntry, ModuleRegistryFilter } from "@/domain/models/module-registry";
import { useModuleRegistry } from "@/platform/moduleaccess/api/module-registry-queries";
import { createModuleRegistryColumns } from "@/platform/moduleaccess/components/module-registry-columns";
import {
  ModuleRegistryDetailPanel,
  ModuleRegistrySummary,
} from "@/platform/moduleaccess/components/module-registry-detail-panel";
import { RoleGuard } from "@/security/guards/role-guard";
import { AuditLink } from "@/common/components/audit/audit-link";

const TYPE_FILTERS = ["ALL", "HCM", "OPERATIONS", "FINANCE", "ANALYTICS"] as const;
const FLAG_FILTERS: Array<{ id: ModuleRegistryFilter; label: string }> = [
  { id: "all", label: "All modules" },
  { id: "core", label: "Core" },
  { id: "paid", label: "Paid" },
  { id: "default", label: "Default enabled" },
];

function matchesSearch(entry: ModuleRegistryEntry, query: string) {
  if (!query) return true;
  const normalized = query.trim().toLowerCase();
  return (
    entry.code.toLowerCase().includes(normalized) ||
    entry.name.toLowerCase().includes(normalized) ||
    entry.moduleType.toLowerCase().includes(normalized)
  );
}

function matchesType(entry: ModuleRegistryEntry, moduleType: string) {
  if (moduleType === "ALL") return true;
  return entry.moduleType === moduleType;
}

function matchesFlag(entry: ModuleRegistryEntry, flag: ModuleRegistryFilter) {
  switch (flag) {
    case "core":
      return entry.core;
    case "paid":
      return entry.paid;
    case "default":
      return entry.enabledByDefault;
    default:
      return true;
  }
}

export function ModuleRegistryPage() {
  const { data, isLoading, error, refetch, isFetching } = useModuleRegistry();
  const [search, setSearch] = useState("");
  const [moduleType, setModuleType] = useState<(typeof TYPE_FILTERS)[number]>("ALL");
  const [flagFilter, setFlagFilter] = useState<ModuleRegistryFilter>("all");
  const [selectedModule, setSelectedModule] = useState<ModuleRegistryEntry | null>(null);
  const debouncedSearch = useDebounce(search);

  const filteredModules = useMemo(() => {
    return (data ?? [])
      .filter((entry) => matchesSearch(entry, debouncedSearch))
      .filter((entry) => matchesType(entry, moduleType))
      .filter((entry) => matchesFlag(entry, flagFilter))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data, debouncedSearch, moduleType, flagFilter]);

  const columns = useMemo(
    () => createModuleRegistryColumns((entry) => setSelectedModule(entry)),
    [],
  );

  return (
    <RoleGuard permissions={["SUPER_ADMIN_MODULE_MANAGE", "SUPER_ADMIN_ACCESS"]} match="any">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <AuditLink label="Module entitlement audit" variant="button" />
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading module registry catalog…
            </div>
          </div>
        ) : null}

        {error ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>Unable to load module registry</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "Failed to load module catalog"}
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

        {data ? (
          <>
            <ModuleRegistrySummary modules={data} />

            <Card>
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>ERP module catalog</CardTitle>
                    <CardDescription>
                      Backend-defined product capabilities used by plans, subscriptions, and tenant entitlements.
                    </CardDescription>
                  </div>
                  <Input
                    aria-label="Search module registry"
                    className="max-w-sm"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by code, name, or type…"
                    value={search}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map((type) => (
                      <Button
                        key={type}
                        onClick={() => setModuleType(type)}
                        size="sm"
                        type="button"
                        variant={moduleType === type ? "default" : "outline"}
                      >
                        {type === "ALL" ? "All types" : type}
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FLAG_FILTERS.map((filter) => (
                      <Button
                        key={filter.id}
                        onClick={() => setFlagFilter(filter.id)}
                        size="sm"
                        type="button"
                        variant={flagFilter === filter.id ? "secondary" : "outline"}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={filteredModules}
                  emptyMessage="No modules match the current filters."
                />
                {isFetching && !isLoading ? (
                  <p className="mt-3 text-xs text-muted-foreground">Refreshing module catalog…</p>
                ) : null}
              </CardContent>
            </Card>

            {selectedModule ? (
              <ModuleRegistryDetailPanel
                entry={selectedModule}
                onClose={() => setSelectedModule(null)}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </RoleGuard>
  );
}
