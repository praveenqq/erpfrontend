"use client";

import { Label } from "@/common/components/ui/label";
import {
  useOrganizationBranches,
  useOrganizationCompany,
  useOrganizationDepartments,
} from "@/platform/organization/api/organization-queries";

interface OrganizationScopeFieldsProps {
  companyId: string;
  branchIds: string[];
  departmentIds: string[];
  onCompanyChange: (companyId: string) => void;
  onBranchChange: (branchIds: string[]) => void;
  onDepartmentChange: (departmentIds: string[]) => void;
}

export function OrganizationScopeFields({
  companyId,
  branchIds,
  departmentIds,
  onCompanyChange,
  onBranchChange,
  onDepartmentChange,
}: OrganizationScopeFieldsProps) {
  const { data: company, isLoading: companyLoading } = useOrganizationCompany();
  const { data: branches, isLoading: branchesLoading } = useOrganizationBranches();
  const { data: departments, isLoading: departmentsLoading } = useOrganizationDepartments();

  const resolvedCompanyId = companyId || company?.id || "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="org-scope-company">Company</Label>
        {companyLoading ? (
          <p className="text-sm text-muted-foreground">Loading company…</p>
        ) : company ? (
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            id="org-scope-company"
            onChange={(event) => onCompanyChange(event.target.value)}
            value={resolvedCompanyId}
          >
            <option value={company.id}>
              {company.name} ({company.code})
            </option>
          </select>
        ) : (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            No company profile found. Complete company setup first.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-scope-branches">Branch access</Label>
        {branchesLoading ? (
          <p className="text-sm text-muted-foreground">Loading branches…</p>
        ) : (branches?.length ?? 0) > 0 ? (
          <select
            className="flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            id="org-scope-branches"
            multiple
            onChange={(event) =>
              onBranchChange(Array.from(event.target.selectedOptions).map((option) => option.value))
            }
            value={branchIds}
          >
            {(branches ?? []).map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} ({branch.code})
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-muted-foreground">
            No branches defined. Add branches in company setup to scope access.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Leave empty for organization-wide branch access.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-scope-departments">Department access</Label>
        {departmentsLoading ? (
          <p className="text-sm text-muted-foreground">Loading departments…</p>
        ) : (departments?.length ?? 0) > 0 ? (
          <select
            className="flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            id="org-scope-departments"
            multiple
            onChange={(event) =>
              onDepartmentChange(
                Array.from(event.target.selectedOptions).map((option) => option.value),
              )
            }
            value={departmentIds}
          >
            {(departments ?? []).map((department) => (
              <option key={department.id} value={department.id}>
                {department.name} ({department.code})
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-muted-foreground">
            No departments defined. Add departments in company setup to scope access.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Leave empty for organization-wide department access.
        </p>
      </div>
    </div>
  );
}
