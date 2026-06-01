import { asRecord, parseNumber } from "../common";

export type TenantSetupStepCode =
  | "COMPANY_PROFILE"
  | "BRANCHES"
  | "DEPARTMENTS"
  | "DESIGNATIONS"
  | "COST_CENTRES"
  | "APPROVAL_HIERARCHY"
  | "EMPLOYEE_IMPORT";

export interface TenantSetupProgress {
  setupProgressPercent: number;
  minimumSetupComplete: boolean;
  completedSteps: string[];
  pendingSteps: string[];
  blockingSteps: string[];
}

export function parseTenantSetupProgress(raw: unknown): TenantSetupProgress {
  const r = asRecord(raw);
  const completedSteps = Array.isArray(r.completedSteps)
    ? r.completedSteps.map((item) => String(item))
    : [];
  return {
    setupProgressPercent: parseNumber(r.setupProgressPercent),
    minimumSetupComplete: r.minimumSetupComplete === true,
    completedSteps,
    pendingSteps: Array.isArray(r.pendingSteps)
      ? r.pendingSteps.map((item) => String(item))
      : [],
    blockingSteps: Array.isArray(r.blockingSteps)
      ? r.blockingSteps.map((item) => String(item))
      : [],
  };
}

export function isSetupStepComplete(progress: TenantSetupProgress, step: string): boolean {
  return progress.completedSteps.includes(step);
}

export function isSetupStepBlocking(progress: TenantSetupProgress, step: string): boolean {
  return progress.blockingSteps.includes(step);
}

export function getNextSetupStep(progress: TenantSetupProgress): string | null {
  const order = SETUP_STEP_ORDER;
  return order.find((step) => progress.pendingSteps.includes(step)) ?? null;
}

export const SETUP_STEP_ORDER: TenantSetupStepCode[] = [
  "COMPANY_PROFILE",
  "BRANCHES",
  "DEPARTMENTS",
  "DESIGNATIONS",
  "COST_CENTRES",
  "APPROVAL_HIERARCHY",
  "EMPLOYEE_IMPORT",
];

export interface SetupStepDefinition {
  code: TenantSetupStepCode;
  label: string;
  description: string;
  blocking: boolean;
  tasks: string[];
}

export const SETUP_STEP_DEFINITIONS: SetupStepDefinition[] = [
  {
    code: "COMPANY_PROFILE",
    label: "Company profile",
    description: "Confirm legal identity, locale defaults, and primary company metadata.",
    blocking: true,
    tasks: [
      "Legal and display company names",
      "Country, currency, timezone, and locale",
      "Primary contact details",
    ],
  },
  {
    code: "BRANCHES",
    label: "Branches",
    description: "Define operating locations used for branch-scoped access and reporting.",
    blocking: false,
    tasks: ["Head office branch", "Regional or site branches as needed"],
  },
  {
    code: "DEPARTMENTS",
    label: "Departments",
    description: "Organize teams that approvals, payroll, and HR modules depend on.",
    blocking: true,
    tasks: ["Core departments such as Finance, HR, and Operations", "Department hierarchy alignment"],
  },
  {
    code: "DESIGNATIONS",
    label: "Designations",
    description: "Standardize job titles used across employee records and workflows.",
    blocking: false,
    tasks: ["Common designations for your organization size", "Approval role mapping readiness"],
  },
  {
    code: "COST_CENTRES",
    label: "Cost centres",
    description: "Configure cost allocation units for expenses, payroll, and finance reporting.",
    blocking: false,
    tasks: ["Primary cost centres", "Optional project or department cost mappings"],
  },
  {
    code: "APPROVAL_HIERARCHY",
    label: "Approval hierarchy",
    description: "Prepare approval chains before operational modules start routing work.",
    blocking: false,
    tasks: ["Manager and finance approvers", "Escalation paths for operational modules"],
  },
  {
    code: "EMPLOYEE_IMPORT",
    label: "Employee import",
    description: "Optional bulk employee onboarding before HR modules go live.",
    blocking: false,
    tasks: ["Import template readiness", "Initial employee roster or defer until later"],
  },
];

export function formatSetupStepLabel(stepCode: string): string {
  return (
    SETUP_STEP_DEFINITIONS.find((step) => step.code === stepCode)?.label ??
    stepCode
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function setupStepVariant(status: "completed" | "pending" | "blocking") {
  switch (status) {
    case "completed":
      return "success" as const;
    case "blocking":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}
