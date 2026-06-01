import { ROUTES } from "@/common/navigation/routes";

export interface BlockedReasonPresentation {
  message: string;
  statusLabel: string;
  actionLabel?: string;
  actionHref?: string;
}

const SUBSCRIPTION_REASONS = new Set([
  "SUBSCRIPTION_EXPIRED",
  "SUBSCRIPTION_INACTIVE",
  "PAYMENT_FAILED",
]);

const UPGRADE_REASONS = new Set([
  "MODULE_NOT_ENABLED",
  "MODULE_TRIAL_EXPIRED",
  "USAGE_LIMIT_EXCEEDED",
  "FEATURE_NOT_ENABLED",
]);

export function resolveBlockedReason(
  blockedReason?: string | null,
  reasonMessage?: string | null,
): BlockedReasonPresentation | undefined {
  if (!blockedReason) return undefined;

  if (blockedReason === "SETUP_INCOMPLETE") {
    return {
      message:
        reasonMessage ??
        "Complete company setup before this module can be used.",
      statusLabel: "Setup incomplete",
      actionLabel: "Continue setup",
      actionHref: ROUTES.ADMIN_SETUP,
    };
  }

  if (SUBSCRIPTION_REASONS.has(blockedReason)) {
    return {
      message:
        reasonMessage ?? "Your organization's plan does not include access to this module.",
      statusLabel: "Billing",
      actionLabel: "View plan and billing",
      actionHref: ROUTES.PLATFORM_SUBSCRIPTION,
    };
  }

  if (UPGRADE_REASONS.has(blockedReason)) {
    return {
      message:
        reasonMessage ??
        "This module is not included in your current plan or entitlement.",
      statusLabel: "Not in plan",
      actionLabel: "View plan and billing",
      actionHref: ROUTES.PLATFORM_SUBSCRIPTION,
    };
  }

  if (blockedReason === "MODULE_DEPENDENCY_MISSING") {
    return {
      message:
        reasonMessage ??
        "Required module dependencies must be enabled before access is granted.",
      statusLabel: "Dependency",
      actionLabel: "View plan and billing",
      actionHref: ROUTES.PLATFORM_SUBSCRIPTION,
    };
  }

  if (
    blockedReason === "MODULE_SUSPENDED" ||
    blockedReason === "MODULE_PENDING" ||
    blockedReason === "ACCESS_MODE_BLOCKED"
  ) {
    return {
      message: reasonMessage ?? "This module is temporarily unavailable.",
      statusLabel: "Unavailable",
      actionLabel: "View plan and billing",
      actionHref: ROUTES.PLATFORM_SUBSCRIPTION,
    };
  }

  if (
    blockedReason === "TENANT_SUSPENDED" ||
    blockedReason === "TENANT_NOT_ACTIVE"
  ) {
    return {
      message: reasonMessage ?? "Your organization is not active.",
      statusLabel: "Organization",
    };
  }

  return {
    message:
      reasonMessage ??
      "Access is controlled by backend entitlement and permission rules.",
    statusLabel: "Blocked",
  };
}

export function isSubscriptionBlocked(items: { blockedReasonCode?: string }[]): boolean {
  return items.some(
    (item) => item.blockedReasonCode && SUBSCRIPTION_REASONS.has(item.blockedReasonCode),
  );
}
