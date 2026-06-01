import { asRecord, parseString } from "@/domain/models/common";

export interface ModuleRegistryEntry {
  code: string;
  name: string;
  moduleType: string;
  dependsOnModules: string[];
  platformCapabilities: string[];
  core: boolean;
  paid: boolean;
  enabledByDefault: boolean;
}

export type ModuleRegistryFilter = "all" | "core" | "paid" | "default";

export function parseModuleRegistryEntry(value: unknown): ModuleRegistryEntry {
  const record = asRecord(value);

  return {
    code: parseString(record.code),
    name: parseString(record.name),
    moduleType: parseString(record.moduleType),
    dependsOnModules: Array.isArray(record.dependsOnModules)
      ? record.dependsOnModules.filter((item): item is string => typeof item === "string")
      : [],
    platformCapabilities: Array.isArray(record.platformCapabilities)
      ? record.platformCapabilities.filter((item): item is string => typeof item === "string")
      : [],
    core: record.core === true,
    paid: record.paid === true,
    enabledByDefault: record.enabledByDefault === true,
  };
}

export function formatModuleType(moduleType: string): string {
  return moduleType
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getModuleCatalogLabels(entry: ModuleRegistryEntry): string[] {
  const labels: string[] = [];
  if (entry.core) labels.push("Core");
  if (entry.paid) labels.push("Paid");
  if (entry.enabledByDefault) labels.push("Default");
  if (labels.length === 0) labels.push("Standard");
  return labels;
}
