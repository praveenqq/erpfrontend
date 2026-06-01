"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { ROUTES } from "@/common/navigation/routes";
import {
  formatSubscriptionPrice,
  formatSubscriptionStatus,
  formatSubscriptionTimestamp,
  subscriptionAllowsAccess,
} from "@/domain/models/subscription";
import {
  useSubscription,
  useSubscriptionBilling,
  useSubscriptionEntitlements,
  useSubscriptionHistory,
  useSubscriptionUsage,
} from "@/platform/subscriptions/api/subscription-queries";
import { SubscriptionActionsPanel } from "@/platform/subscriptions/components/subscription-actions-panel";
import { SubscriptionAddonsPanel } from "@/platform/subscriptions/components/subscription-addons-panel";
import { getSubscriptionStatusVariant } from "@/platform/subscriptions/components/subscription-columns";
import { useTenant } from "@/platform/tenants/api/tenant-queries";
import { RoleGuard } from "@/security/guards/role-guard";
import { AuditLink } from "@/common/components/audit/audit-link";

export function SubscriptionDetailPage({ id }: { id: string }) {
  const { data: subscription, isLoading, error } = useSubscription(id);
  const { data: entitlements } = useSubscriptionEntitlements(id);
  const { data: usage } = useSubscriptionUsage(id);
  const { data: history } = useSubscriptionHistory(id);
  const tenantId = subscription?.tenantId ?? "";
  const { data: tenant } = useTenant(tenantId);
  const { data: billing } = useSubscriptionBilling(tenantId);

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading subscription…
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Subscription not found</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Unable to load this subscription."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={ROUTES.SUPER_ADMIN_SUBSCRIPTIONS}>Back to customer billing</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <RoleGuard
      permissions={["SUBSCRIPTION_VIEW", "SUPER_ADMIN_ACCESS", "SUPER_ADMIN_SUBSCRIPTION_READ"]}
      match="any"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.SUPER_ADMIN_SUBSCRIPTIONS}>
              <ArrowLeft className="h-4 w-4" />
              Back to customer billing
            </Link>
          </Button>
          <Badge variant={getSubscriptionStatusVariant(subscription.status)}>
            {formatSubscriptionStatus(subscription.status)}
          </Badge>
          <Badge variant={subscriptionAllowsAccess(subscription.status) ? "success" : "warning"}>
            {subscriptionAllowsAccess(subscription.status) ? "Access allowed" : "Access blocked"}
          </Badge>
          <AuditLink tenantId={tenantId} label="Subscription audit" variant="button" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{subscription.planName ?? "Subscription"}</CardTitle>
            <CardDescription>
              <span className="font-mono">{subscription.planCode ?? subscription.planId}</span>
              {" · "}
              Organization{" "}
              <Link
                className="font-medium text-primary hover:underline"
                href={ROUTES.PLATFORM_TENANT_DETAIL(subscription.tenantId)}
              >
                {tenant?.displayName ?? subscription.tenantId}
              </Link>
              {tenant?.slug ? (
                <span className="text-muted-foreground"> · {tenant.slug}</span>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
            <p><span className="text-muted-foreground">Price:</span> {formatSubscriptionPrice(subscription)}</p>
            <p><span className="text-muted-foreground">Billing cycle:</span> {subscription.billingCycle ?? "—"}</p>
            <p><span className="text-muted-foreground">Period end:</span> {formatSubscriptionTimestamp(subscription.currentPeriodEnd)}</p>
            <p><span className="text-muted-foreground">Renewal:</span> {formatSubscriptionTimestamp(subscription.renewalAt)}</p>
            <p><span className="text-muted-foreground">Trial end:</span> {formatSubscriptionTimestamp(subscription.trialEnd)}</p>
            <p><span className="text-muted-foreground">Payment provider:</span> {subscription.paymentProvider ?? "—"}</p>
            <p><span className="text-muted-foreground">Cancel at period end:</span> {subscription.cancelAtPeriodEnd ? "Yes" : "No"}</p>
            <p><span className="text-muted-foreground">Current subscription:</span> {subscription.current ? "Yes" : "No"}</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle actions</CardTitle>
              <CardDescription>
                Activate, renew, suspend, resume, cancel, change plan, or recalculate entitlements through backend-controlled operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionActionsPanel subscription={subscription} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access impact</CardTitle>
              <CardDescription>Billing status controls which business modules this organization can use.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                {subscriptionAllowsAccess(subscription.status)
                  ? "This plan currently allows module access according to billing rules."
                  : "This plan currently blocks module access until billing status is restored or the plan is changed."}
              </p>
              <p className="text-muted-foreground">
                Plan changes update entitlements without deleting organization business data.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscription add-ons</CardTitle>
            <CardDescription>
              Attach paid module add-ons to extend entitlements beyond the base plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionAddonsPanel subscriptionId={subscription.id} />
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Entitlements</CardTitle>
              <CardDescription>Module access generated from the active subscription and plan mapping.</CardDescription>
            </CardHeader>
            <CardContent>
              {entitlements && entitlements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entitlements.map((item) => (
                      <TableRow key={`${item.moduleCode}-${item.status}`}>
                        <TableCell className="font-medium">{item.moduleCode}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No entitlements synced yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription>Current usage counters against plan limits.</CardDescription>
            </CardHeader>
            <CardContent>
              {usage && usage.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Counter</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Limit</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usage.map((item) => (
                      <TableRow key={`${item.counterCode}-${item.periodKey}`}>
                        <TableCell>{item.counterCode}</TableCell>
                        <TableCell>{item.currentValue.toLocaleString()}</TableCell>
                        <TableCell>{item.limitValue.toLocaleString()}</TableCell>
                        <TableCell>{item.periodKey}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No usage counters recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment status</CardTitle>
              <CardDescription>Recent invoices and payment attempts for this tenant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {billing?.payments && billing.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid at</TableHead>
                      <TableHead>Failure</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billing.payments.map((payment) => (
                      <TableRow key={payment.id}>
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

          <Card>
            <CardHeader>
              <CardTitle>Audit trail</CardTitle>
              <CardDescription>Recent subscription lifecycle events.</CardDescription>
            </CardHeader>
            <CardContent>
              {history && history.content.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.content.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entry.eventType}</p>
                            {entry.reason ? (
                              <p className="text-xs text-muted-foreground">{entry.reason}</p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entry.oldValue ?? "—"} → {entry.newValue ?? "—"}
                        </TableCell>
                        <TableCell>{formatSubscriptionTimestamp(entry.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No subscription history recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
