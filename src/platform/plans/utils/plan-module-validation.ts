import type { ModuleRegistryEntry } from "@/domain/models/module-registry";

export interface ModuleDependencyIssue {
  moduleCode: string;
  missingDependency: string;
}

export interface ModuleSelectionValidation {
  valid: boolean;
  issues: ModuleDependencyIssue[];
  warnings: string[];
  requiredModules: string[];
  platformCapabilities: string[];
}

export function collectRequiredModules(
  selectedModules: string[],
  registry: ModuleRegistryEntry[],
): string[] {
  const registryByCode = new Map(registry.map((entry) => [entry.code, entry]));
  const required = new Set<string>();

  for (const moduleCode of selectedModules) {
    const entry = registryByCode.get(moduleCode);
    if (!entry) continue;
    for (const dependency of entry.dependsOnModules) {
      if (!selectedModules.includes(dependency)) {
        required.add(dependency);
      }
    }
  }

  return [...required];
}

export function validateModuleSelection(
  selectedModules: string[],
  registry: ModuleRegistryEntry[],
): ModuleSelectionValidation {
  const registryByCode = new Map(registry.map((entry) => [entry.code, entry]));
  const issues: ModuleDependencyIssue[] = [];
  const warnings: string[] = [];
  const platformCapabilities = new Set<string>();

  for (const moduleCode of selectedModules) {
    const entry = registryByCode.get(moduleCode);
    if (!entry) {
      warnings.push(`${moduleCode} is not present in the module registry catalog.`);
      continue;
    }

    for (const capability of entry.platformCapabilities) {
      platformCapabilities.add(capability);
    }

    for (const dependency of entry.dependsOnModules) {
      if (!selectedModules.includes(dependency)) {
        issues.push({ moduleCode, missingDependency: dependency });
      }
    }
  }

  if (selectedModules.includes("PAYROLL")) {
    for (const dependency of ["EMPLOYEES", "LEAVE", "ATTENDANCE"]) {
      if (!selectedModules.includes(dependency)) {
        issues.push({ moduleCode: "PAYROLL", missingDependency: dependency });
      }
    }
  }

  const requiredModules = collectRequiredModules(selectedModules, registry);

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    requiredModules,
    platformCapabilities: [...platformCapabilities].sort(),
  };
}

export function withRequiredDependencies(
  selectedModules: string[],
  registry: ModuleRegistryEntry[],
): string[] {
  const next = new Set(selectedModules);
  for (const dependency of collectRequiredModules(selectedModules, registry)) {
    next.add(dependency);
  }
  return [...next].sort();
}

export function defaultSelectedModules(registry: ModuleRegistryEntry[]): string[] {
  return registry.filter((entry) => entry.enabledByDefault || entry.core).map((entry) => entry.code);
}
