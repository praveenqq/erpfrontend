"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import {
  entitlementGrantsAccess,
  formatPlanPrice,
  formatSubscriptionPrice,
  formatSubscriptionStatus,
  formatSubscriptionTimestamp,
  subscriptionAllowsAccess,
  type Subscription,
  type SubscriptionEntitlement,
  type SubscriptionUsage,
  type TenantBillingSnapshot,
  type TenantPlanOption,
} from "@/domain/models/subscription";
import { useTenantSubscriptionDashboard } from "@/platform/subscriptions/api/tenant-subscription-queries";
import { getSubscriptionStatusVariant } from "@/platform/subscriptions/components/subscription-columns";
import { TenantPlanChangePanel } from "@/platform/subscriptions/components/tenant-plan-change-panel";
import { useWorkspaceNavigation } from "@/platform/moduleaccess/hooks/use-workspace-navigation";
import { RoleGuard } from "@/security/guards/role-guard";
import { useAuth } from "@/security/auth/auth-provider";
import { AuditLink } from "@/common/components/audit/audit-link";

export function SubscriptionPage() {
  const {
    subscription,
    billing,
    entitlements,
    usage,
    availablePlans,
    isLoading,
    isError,
    error,
    billingLoading,
    billingError,
  } = useTenantSubscriptionDashboard();
  const { blockedModuleItems } = useWorkspaceNavigation();
  const { hasAnyPermission } = useAuth();
  const canViewBilling = hasAnyPermission(["SUBSCRIPTION_VIEW_BILLING", "SUPER_ADMIN_ACCESS"]);

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading subscription dashboard…
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Unable to load subscription</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "The tenant subscription API is unavailable."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <RoleGuard permissions={["SUBSCRIPTION_VIEW", "SUPER_ADMIN_ACCESS"]} match="any">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <AuditLink tenantScoped label="View subscription audit" variant="button" />
        </div>

        {!subscription ? (
          <NoSubscriptionState availablePlans={availablePlans} />
        ) : (
          <>
            <SubscriptionSummary subscription={subscription} entitlements={entitlements} usage={usage} />

            {!subscriptionAllowsAccess(subscription.status) ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle>Access is blocked</CardTitle>
                  <CardDescription>
                    Your subscription status prevents module access until billing or lifecycle status is
                    restored.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Current status:{" "}
                  <Badge variant={getSubscriptionStatusVariant(subscription.status)}>
                    {formatSubscriptionStatus(subscription.status)}
                  </Badge>
                </CardContent>
              </Card>
            ) : null}

            {blockedModuleItems.length > 0 ? (
              <Card className="border-amber-500/30">
                <CardHeader>
                  <CardTitle>Blocked capabilities</CardTitle>
                  <CardDescription>
                    Modules reported by backend navigation that are not currently usable, with reasons
                    and next steps.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {blockedModuleItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.label}</p>
                          {item.statusLabel ? (
                            <Badge variant="warning">{item.statusLabel}</Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.blockedReason}</p>
                      </div>
                      {item.actionHref && item.actionLabel ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={item.actionHref}>{item.actionLabel}</Link>
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-2">
              <EntitlementsCard entitlements={entitlements} />
              <UsageCard usage={usage} />
            </div>

            {canViewBilling ? (
              <BillingCard
                billing={billing}
                isLoading={billingLoading}
                isError={billingError}
              />
            ) : null}

            <TenantPlanChangePanel
              availablePlans={availablePlans}
              subscription={subscription}
              usage={usage}
            />
          </>
        )}
      </div>
    </RoleGuard>
  );
}

function SubscriptionSummary({
  subscription,
  entitlements,
  usage,
}: {
  subscription: Subscription;
  entitlements: SubscriptionEntitlement[];
  usage: SubscriptionUsage[];
}) {
  const enabledModules = entitlements.filter((item) => entitlementGrantsAccess(item.status)).length;
  const usageAlerts = usage.filter(
    (item) => item.limitValue > 0 && item.currentValue >= item.limitValue,
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{subscription.planName ?? "Current plan"}</CardTitle>
            <CardDescription>
              <span className="font-mono">{subscription.planCode ?? subscription.planId}</span>
              {" · "}
              {formatSubscriptionPrice(subscription)}
              {subscription.billingCycle ? ` · ${subscription.billingCycle}` : ""}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getSubscriptionStatusVariant(subscription.status)}>
              {formatSubscriptionStatus(subscription.status)}
            </Badge>
            <Badge variant={subscriptionAllowsAccess(subscription.status) ? "success" : "warning"}>
              {subscriptionAllowsAccess(subscription.status) ? "Access allowed" : "Access blocked"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
        <Metric label="Renewal" value={formatSubscriptionTimestamp(subscription.renewalAt)} />
        <Metric label="Current period ends" value={formatSubscriptionTimestamp(subscription.currentPeriodEnd)} />
        <Metric label="Trial ends" value={formatSubscriptionTimestamp(subscription.trialEnd)} />
        <Metric label="Enabled modules" value={String(enabledModules)} />
        <Metric label="Usage limits reached" value={String(usageAlerts)} />
        <Metric
          label="Cancel at period end"
          value={subscription.cancelAtPeriodEnd ? "Yes" : "No"}
        />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function EntitlementsCard({ entitlements }: { entitlements: SubscriptionEntitlement[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enabled modules</CardTitle>
        <CardDescription>
          Module entitlements synced from your subscription and plan packaging.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entitlements.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entitlements.map((item) => (
                <TableRow key={`${item.moduleCode}-${item.status}`}>
                  <TableCell className="font-medium">{item.moduleCode}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={entitlementGrantsAccess(item.status) ? "success" : "warning"}>
                      {entitlementGrantsAccess(item.status) ? "Granted" : "Blocked"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No module entitlements synced yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function UsageCard({ usage }: { usage: SubscriptionUsage[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage limits</CardTitle>
        <CardDescription>Current usage counters against plan limits for this billing period.</CardDescription>
      </CardHeader>
      <CardContent>
        {usage.length > 0 ? (
          <div className="space-y-4">
            {usage.map((item) => {
              const ratio =
                item.limitValue > 0
                  ? Math.min(100, Math.round((item.currentValue / item.limitValue) * 100))
                  : 0;
              const atLimit = item.limitValue > 0 && item.currentValue >= item.limitValue;

              return (
                <div key={`${item.counterCode}-${item.periodKey}`} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium">{item.counterCode}</p>
                      <p className="text-xs text-muted-foreground">{item.periodKey}</p>
                    </div>
                    <div className="text-right">
                      <p>
                        {item.currentValue.toLocaleString()} / {item.limitValue.toLocaleString()}
                      </p>
                      {atLimit ? <Badge variant="warning">Limit reached</Badge> : null}
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full transition-all ${atLimit ? "bg-amber-500" : "bg-primary"}`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No usage counters recorded for this workspace.</p>
        )}
      </CardContent>
    </Card>
  );
}

function BillingCard({
  billing,
  isLoading,
  isError,
}: {
  billing?: TenantBillingSnapshot;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing status</CardTitle>
          <CardDescription>Loading invoices and payment history…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-amber-500/30">
        <CardHeader>
          <CardTitle>Billing status</CardTitle>
          <CardDescription>Billing details require the SUBSCRIPTION_VIEW_BILLING permission.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing status</CardTitle>
        <CardDescription>Recent invoices and payment attempts for this workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {billing?.payments && billing.payments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid at</TableHead>
                <TableHead>Failure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billing.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">{payment.id.slice(0, 8)}</TableCell>
                  <TableCell>{payment.status ?? "—"}</TableCell>
                  <TableCell>
                    {payment.amount != null && payment.currency
                      ? new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: payment.currency,
                        }).format(payment.amount)
                      : "—"}
                  </TableCell>
                  <TableCell>{formatSubscriptionTimestamp(payment.paidAt)}</TableCell>
                  <TableCell>{payment.failedReason ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No payment records available.</p>
        )}

        {billing?.invoices && billing.invoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billing.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber ?? invoice.id.slice(0, 8)}</TableCell>
                  <TableCell>{invoice.status ?? "—"}</TableCell>
                  <TableCell>
                    {invoice.totalAmount != null && invoice.currency
                      ? new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: invoice.currency,
                        }).format(invoice.totalAmount)
                      : "—"}
                  </TableCell>
                  <TableCell>{formatSubscriptionTimestamp(invoice.dueDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AvailablePlansOverview({ availablePlans }: { availablePlans: TenantPlanOption[] }) {
  return (
    <Card id="upgrade-options">
      <CardHeader>
        <CardTitle>Available plans</CardTitle>
        <CardDescription>
          Public plans published by the platform. A subscription must be assigned before self-service
          plan changes are available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availablePlans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {availablePlans.map((plan) => (
              <div key={plan.planId} className="rounded-xl border p-4">
                <p className="font-semibold">{plan.planName}</p>
                <p className="font-mono text-xs text-muted-foreground">{plan.planCode}</p>
                <p className="mt-3 text-lg font-medium">{formatPlanPrice(plan)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No public plans are available for this workspace.</p>
        )}
      </CardContent>
    </Card>
  );
}

function NoSubscriptionState({ availablePlans }: { availablePlans: TenantPlanOption[] }) {
  return (
    <div className="space-y-6">
      <Card className="border-amber-500/30">
        <CardHeader>
          <CardTitle>No plan assigned</CardTitle>
          <CardDescription>
            Your organization does not have an active plan. Business modules stay unavailable until a plan is assigned.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Contact your platform administrator to assign a plan, or review available public plans below.
        </CardContent>
      </Card>
      <AvailablePlansOverview availablePlans={availablePlans} />
    </div>
  );
}
