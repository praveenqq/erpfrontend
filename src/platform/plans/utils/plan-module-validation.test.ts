import { describe, expect, it } from "vitest";
import type { ModuleRegistryEntry } from "@/domain/models/module-registry";
import {
  validateModuleSelection,
  withRequiredDependencies,
} from "@/platform/plans/utils/plan-module-validation";

const registry: ModuleRegistryEntry[] = [
  {
    code: "EMPLOYEES",
    name: "Employees",
    moduleType: "HCM",
    dependsOnModules: ["HCM"],
    platformCapabilities: [],
    core: false,
    paid: false,
    enabledByDefault: true,
  },
  {
    code: "PAYROLL",
    name: "Payroll",
    moduleType: "HCM",
    dependsOnModules: ["EMPLOYEES", "LEAVE", "ATTENDANCE"],
    platformCapabilities: ["WORKFLOW"],
    core: false,
    paid: true,
    enabledByDefault: false,
  },
];

describe("validateModuleSelection", () => {
  it("flags missing payroll dependencies", () => {
    const result = validateModuleSelection(["PAYROLL"], registry);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.missingDependency === "EMPLOYEES")).toBe(true);
  });

  it("adds required dependencies", () => {
    const next = withRequiredDependencies(["PAYROLL", "LEAVE", "ATTENDANCE"], registry);
    expect(next).toContain("EMPLOYEES");
  });
});
