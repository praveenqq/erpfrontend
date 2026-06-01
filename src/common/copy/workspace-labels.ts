/** Production-facing labels for tenant type, workspace mode, and billing context. */

export function formatTenantTypeLabel(type?: string | null): string {
  switch (type?.toUpperCase()) {
    case "INTERNAL":
      return "Platform operator";
    case "SANDBOX":
      return "Sandbox";
    case "STANDARD":
      return "Customer";
    case "TRIAL":
      return "Trial customer";
    default:
      return type ? type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "Customer";
  }
}

export function isNonBillableTenantType(type?: string | null): boolean {
  const normalized = type?.toUpperCase();
  return normalized === "INTERNAL" || normalized === "SANDBOX";
}

export const WORKSPACE_COPY = {
  operatorContextLabel: "Platform operator",
  customerContextLabel: "Customer workspace",
  noWorkspaceSelected: "No workspace selected",
  platformOperatorMode: "Platform operator mode",
  tenantAdminMode: "Organization admin mode",
  tenantUserMode: "Team member mode",
  rolePlatformOperator: "Platform operator",
  roleOrgAdmin: "Organization admin",
  roleTeamMember: "Team member",
  rolePending: "Access pending sync",
  subscriptionDirectoryTitle: "Customer subscription directory",
  subscriptionDirectoryDescription:
    "Commercial plans and billing status for customer organizations. Platform operator workspaces do not require a subscription.",
  operatorPlanLabel: "Not applicable",
  operatorPlanHint: "Operator workspace — billing does not apply",
  operatorStatusLabel: "Operator workspace",
  customerUnassignedPlan: "No plan assigned",
  customerUnassignedStatus: "Awaiting subscription",
  createSubscriptionHint:
    "Assign a published plan to a customer organization. Platform operator workspaces are excluded from billing.",
} as const;
