import { asRecord, parseNumber, parseOptionalString, parseString } from "../common";

export type ProvisioningJobStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "FAILED"
  | "COMPLETED";

export type ProvisioningStepStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED";

export interface ProvisioningStep {
  stepCode: string;
  status: ProvisioningStepStatus | string;
  failureReason?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ProvisioningStatus {
  tenantId: string;
  jobId: string;
  status: ProvisioningJobStatus | string;
  currentStep?: string;
  setupProgressPercent: number;
  steps: ProvisioningStep[];
  lastError?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ProvisioningJobSummary {
  tenantId: string;
  status: ProvisioningJobStatus | string;
  currentStep?: string;
  attemptCount: number;
  lastError?: string;
}

const PROVISIONING_STEP_ORDER = [
  "CREATE_TENANT",
  "CREATE_SUBSCRIPTION",
  "ENABLE_MODULES",
  "CREATE_COMPANY",
  "SEED_ORG_DEFAULTS",
  "SEED_ROLES",
  "SEED_PERMISSIONS",
  "CREATE_ADMIN_USER",
  "CREATE_ADMIN_MEMBERSHIP",
  "SEED_WORKFLOW_TEMPLATES",
  "SEED_SETTINGS",
  "SEED_NUMBERING_SERIES",
  "MARK_ACTIVE",
] as const;

const STEP_LABELS: Record<string, string> = {
  CREATE_TENANT: "Create tenant record",
  CREATE_SUBSCRIPTION: "Create subscription",
  ENABLE_MODULES: "Enable plan modules",
  CREATE_COMPANY: "Create default company",
  SEED_ORG_DEFAULTS: "Seed organization defaults",
  SEED_ROLES: "Seed default roles",
  SEED_PERMISSIONS: "Seed permissions",
  CREATE_ADMIN_USER: "Create default admin user",
  CREATE_ADMIN_MEMBERSHIP: "Assign admin membership",
  SEED_WORKFLOW_TEMPLATES: "Seed workflow templates",
  SEED_SETTINGS: "Seed tenant settings",
  SEED_NUMBERING_SERIES: "Seed numbering series",
  MARK_ACTIVE: "Activate tenant",
};

export function parseProvisioningStep(raw: unknown): ProvisioningStep {
  const r = asRecord(raw);
  return {
    stepCode: parseString(r.stepCode),
    status: parseString(r.status, "NOT_STARTED"),
    failureReason: parseOptionalString(r.failureReason),
    startedAt: parseOptionalString(r.startedAt),
    completedAt: parseOptionalString(r.completedAt),
  };
}

export function parseProvisioningStatus(raw: unknown): ProvisioningStatus {
  const r = asRecord(raw);
  return {
    tenantId: parseString(r.tenantId),
    jobId: parseString(r.jobId),
    status: parseString(r.status, "NOT_STARTED"),
    currentStep: parseOptionalString(r.currentStep),
    setupProgressPercent: parseNumber(r.setupProgressPercent),
    steps: Array.isArray(r.steps) ? r.steps.map(parseProvisioningStep) : [],
    lastError: parseOptionalString(r.lastError),
    startedAt: parseOptionalString(r.startedAt),
    completedAt: parseOptionalString(r.completedAt),
  };
}

export function parseProvisioningJobSummary(raw: unknown): ProvisioningJobSummary {
  const r = asRecord(raw);
  return {
    tenantId: parseString(r.tenantId),
    status: parseString(r.status, "NOT_STARTED"),
    currentStep: parseOptionalString(r.currentStep),
    attemptCount: parseNumber(r.attemptCount),
    lastError: parseOptionalString(r.lastError),
  };
}

export function sortProvisioningSteps(steps: ProvisioningStep[]): ProvisioningStep[] {
  const order = new Map<string, number>(
    PROVISIONING_STEP_ORDER.map((code, index) => [code, index]),
  );
  return [...steps].sort(
    (a, b) => (order.get(a.stepCode) ?? 999) - (order.get(b.stepCode) ?? 999),
  );
}

export function formatProvisioningStepLabel(stepCode: string): string {
  return STEP_LABELS[stepCode] ?? stepCode
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatProvisioningStatus(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function provisioningStatusVariant(status: string) {
  switch (status) {
    case "COMPLETED":
      return "success" as const;
    case "IN_PROGRESS":
      return "secondary" as const;
    case "FAILED":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export function provisioningStepVariant(status: string) {
  switch (status) {
    case "COMPLETED":
      return "success" as const;
    case "IN_PROGRESS":
      return "secondary" as const;
    case "FAILED":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export function isProvisioningInProgress(status: string): boolean {
  return status === "IN_PROGRESS" || status === "NOT_STARTED";
}

export function isAdminProvisioningStep(stepCode: string): boolean {
  return stepCode === "CREATE_ADMIN_USER" || stepCode === "CREATE_ADMIN_MEMBERSHIP";
}

export function isCompanySetupStep(stepCode: string): boolean {
  return stepCode === "CREATE_COMPANY" || stepCode === "SEED_ORG_DEFAULTS";
}

export function formatProvisioningTimestamp(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
