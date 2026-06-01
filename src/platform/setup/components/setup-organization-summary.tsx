"use client";

import {
  useOrganizationBranches,
  useOrganizationCompany,
  useOrganizationDepartments,
} from "@/platform/organization/api/organization-queries";

export function SetupOrganizationSummary() {
  const { data: company, isLoading: companyLoading } = useOrganizationCompany();
  const { data: branches, isLoading: branchesLoading } = useOrganizationBranches();
  const { data: departments, isLoading: departmentsLoading } = useOrganizationDepartments();

  if (companyLoading || branchesLoading || departmentsLoading) {
    return <p className="text-sm text-muted-foreground">Loading organization structure…</p>;
  }

  return (
    <div className="grid gap-3 text-sm md:grid-cols-2">
      <p>
        <span className="text-muted-foreground">Company:</span>{" "}
        {company ? `${company.name} (${company.code})` : "Not created yet"}
      </p>
      <p>
        <span className="text-muted-foreground">Branches:</span>{" "}
        {(branches?.length ?? 0).toLocaleString()}
      </p>
      <p>
        <span className="text-muted-foreground">Departments:</span>{" "}
        {(departments?.length ?? 0).toLocaleString()}
      </p>
      <p>
        <span className="text-muted-foreground">Numbering series:</span> Provisioned at onboarding
      </p>
      {(branches?.length ?? 0) > 0 ? (
        <ul className="md:col-span-2 list-inside list-disc text-muted-foreground">
          {(branches ?? []).map((branch) => (
            <li key={branch.id}>
              {branch.name} ({branch.code})
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
