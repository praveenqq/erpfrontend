"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  SETUP_STEP_DEFINITIONS,
  type SetupStepDefinition,
  type TenantSetupProgress,
  type TenantSetupStepCode,
} from "@/domain/models/setup";
import {
  useCreateBranch,
  useCreateDepartment,
  useOrganizationBranches,
  useOrganizationCompany,
  useOrganizationDepartments,
  useUpdateOrganizationCompany,
} from "@/platform/organization/api/organization-queries";
import { useCompleteSetupStep } from "@/platform/setup/api/setup-queries";
import { useAuth } from "@/security/auth/auth-provider";

interface SetupStepPanelProps {
  step: SetupStepDefinition;
  progress: TenantSetupProgress;
}

function SetupStepChecklist({ tasks }: { tasks: string[] }) {
  return (
    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
      {tasks.map((task) => (
        <li key={task}>{task}</li>
      ))}
    </ul>
  );
}

function CompanyProfileStep({
  initialName,
  onValidChange,
}: {
  initialName: string;
  onValidChange: (valid: boolean) => void;
}) {
  const [name, setName] = useState(initialName);

  const handleChange = (value: string) => {
    setName(value);
    onValidChange(value.trim().length >= 2);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="setup-company-name">Company display name</Label>
      <Input
        id="setup-company-name"
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Acme Corporation"
        value={name}
      />
      <input id="setup-company-name-value" type="hidden" value={name} />
    </div>
  );
}

function BranchStep() {
  const { data: branches } = useOrganizationBranches();
  const createBranch = useCreateBranch();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const addBranch = async () => {
    try {
      await createBranch.mutateAsync({ code, name });
      toast.success("Branch created");
      setCode("");
      setName("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create branch");
    }
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-1 text-sm">
        {(branches ?? []).map((branch) => (
          <li key={branch.id}>
            {branch.code} — {branch.name}
          </li>
        ))}
      </ul>
      <div className="grid gap-3 md:grid-cols-3">
        <Input onChange={(event) => setCode(event.target.value)} placeholder="Branch code" value={code} />
        <Input onChange={(event) => setName(event.target.value)} placeholder="Branch name" value={name} />
        <Button disabled={!code || !name || createBranch.isPending} onClick={addBranch} type="button">
          Add branch
        </Button>
      </div>
    </div>
  );
}

function DepartmentStep() {
  const { data: departments } = useOrganizationDepartments();
  const createDepartment = useCreateDepartment();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const addDepartment = async () => {
    try {
      await createDepartment.mutateAsync({ code, name });
      toast.success("Department created");
      setCode("");
      setName("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create department");
    }
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-1 text-sm">
        {(departments ?? []).map((department) => (
          <li key={department.id}>
            {department.code} — {department.name}
          </li>
        ))}
      </ul>
      <div className="grid gap-3 md:grid-cols-3">
        <Input onChange={(event) => setCode(event.target.value)} placeholder="Department code" value={code} />
        <Input onChange={(event) => setName(event.target.value)} placeholder="Department name" value={name} />
        <Button disabled={!code || !name || createDepartment.isPending} onClick={addDepartment} type="button">
          Add department
        </Button>
      </div>
    </div>
  );
}

export function SetupStepPanel({ step, progress }: SetupStepPanelProps) {
  const completeStep = useCompleteSetupStep();
  const updateCompany = useUpdateOrganizationCompany();
  const { data: company } = useOrganizationCompany();
  const { data: branches } = useOrganizationBranches();
  const { data: departments } = useOrganizationDepartments();
  const { hasAnyPermission } = useAuth();
  const canManage = hasAnyPermission(["TENANT_UPDATE", "SUPER_ADMIN_ACCESS"]);
  const isCompleted = progress.completedSteps.includes(step.code);
  const [companyProfileValid, setCompanyProfileValid] = useState(false);
  const [deferEmployeeImport, setDeferEmployeeImport] = useState(false);

  const submit = async () => {
    try {
      if (step.code === "COMPANY_PROFILE") {
        const input = document.getElementById("setup-company-name") as HTMLInputElement | null;
        const name = input?.value?.trim() ?? "";
        if (name.length >= 2) {
          await updateCompany.mutateAsync(name);
        }
      }
      await completeStep.mutateAsync(step.code as TenantSetupStepCode);
      toast.success(`${step.label} marked complete`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete setup step");
    }
  };

  const canComplete =
    canManage &&
    !isCompleted &&
    !completeStep.isPending &&
    (step.code !== "COMPANY_PROFILE" || companyProfileValid) &&
    (step.code !== "BRANCHES" || (branches?.length ?? 0) > 0) &&
    (step.code !== "DEPARTMENTS" || (departments?.length ?? 0) > 0) &&
    (step.code !== "DESIGNATIONS" || (departments?.length ?? 0) > 0) &&
    (step.code !== "COST_CENTRES" || (Boolean(company) && (departments?.length ?? 0) > 0)) &&
    (step.code !== "APPROVAL_HIERARCHY" ||
      ((branches?.length ?? 0) > 0 && (departments?.length ?? 0) > 0)) &&
    (step.code !== "EMPLOYEE_IMPORT" || deferEmployeeImport);

  const hasCustomStepUi = ["COMPANY_PROFILE", "BRANCHES", "DEPARTMENTS"].includes(step.code);
  const readinessMessage = (() => {
    if (step.code === "DESIGNATIONS" && (departments?.length ?? 0) === 0) {
      return "Add at least one department before completing designations.";
    }
    if (step.code === "COST_CENTRES" && ((departments?.length ?? 0) === 0 || !company)) {
      return "Company profile and departments must exist before completing cost centres.";
    }
    if (
      step.code === "APPROVAL_HIERARCHY" &&
      ((branches?.length ?? 0) === 0 || (departments?.length ?? 0) === 0)
    ) {
      return "Create branches and departments before completing approval hierarchy.";
    }
    if (step.code === "EMPLOYEE_IMPORT" && !deferEmployeeImport) {
      return "Confirm below if you are deferring employee import to a later phase.";
    }
    return null;
  })();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{step.description}</p>
        {step.blocking ? (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            This step blocks paid operational modules until it is completed.
          </p>
        ) : null}
      </div>

      {!hasCustomStepUi && !isCompleted ? (
        <SetupStepChecklist tasks={step.tasks} />
      ) : null}

      {step.code === "COMPANY_PROFILE" && !isCompleted ? (
        <CompanyProfileStep
          initialName={company?.name ?? ""}
          key={company?.id ?? "company-empty"}
          onValidChange={setCompanyProfileValid}
        />
      ) : null}
      {step.code === "BRANCHES" && !isCompleted ? <BranchStep /> : null}
      {step.code === "DEPARTMENTS" && !isCompleted ? <DepartmentStep /> : null}

      {step.code === "EMPLOYEE_IMPORT" && !isCompleted ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={deferEmployeeImport}
            className="h-4 w-4 rounded border"
            onChange={(event) => setDeferEmployeeImport(event.target.checked)}
            type="checkbox"
          />
          We will import employees later — mark this optional step complete for now.
        </label>
      ) : null}

      {readinessMessage ? (
        <p className="text-sm text-amber-700 dark:text-amber-400">{readinessMessage}</p>
      ) : null}

      {isCompleted ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          This step is complete and audited on the backend.
        </p>
      ) : canManage ? (
        <Button disabled={!canComplete} onClick={submit} type="button">
          {completeStep.isPending ? "Saving…" : `Mark ${step.label.toLowerCase()} complete`}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">TENANT_UPDATE permission is required to complete setup steps.</p>
      )}
    </div>
  );
}

export function getSetupStepDefinition(code: string): SetupStepDefinition | undefined {
  return SETUP_STEP_DEFINITIONS.find((step) => step.code === code);
}
