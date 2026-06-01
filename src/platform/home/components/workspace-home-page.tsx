"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { ROUTES } from "@/common/navigation/routes";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { useWorkspaceNavigation } from "@/platform/moduleaccess/hooks/use-workspace-navigation";
import { isSubscriptionBlocked } from "@/platform/moduleaccess/config/navigation-blocked-reasons";
import { useSuperAdminDashboard } from "@/platform/superadmin/api/dashboard-queries";
import { useAuth } from "@/security/auth/auth-provider";

export function WorkspaceHomePage() {
  const { setupProgress, minimumSetupComplete, blockedModuleItems, items, isLoading } =
    useWorkspaceNavigation();
  const { isSuperAdmin } = useAuth();
  const { data: dashboard, isLoading: dashboardLoading } = useSuperAdminDashboard();

  const activeModules = items.filter(
    (item) => item.group === "module" && !item.disabled,
  );
  const subscriptionBlocked = isSubscriptionBlocked(blockedModuleItems);

  return (
    <>
      {isSuperAdmin ? (
        <>
          <Card className="border-primary/20 bg-muted/30">
            <CardHeader>
              <CardTitle>Platform operations</CardTitle>
              <CardDescription>
                Monitor customer organizations, billing health, and onboarding from the platform
                overview. Operator workspaces do not require customer plans.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={ROUTES.SUPER_ADMIN_DASHBOARD}>Platform overview</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={ROUTES.SUPER_ADMIN_PROVISIONING}>Onboard customer</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={ROUTES.SUPER_ADMIN_PLANS}>Commercial plans</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={ROUTES.SUPER_ADMIN_SUBSCRIPTIONS}>Customer billing</Link>
              </Button>
            </CardContent>
          </Card>

          {dashboardLoading ? (
            <div className="flex min-h-[120px] items-center justify-center rounded-xl border bg-card">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : null}

          {dashboard ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Organizations",
                  value: dashboard.tenants.total,
                  href: ROUTES.PLATFORM_TENANTS,
                },
                {
                  label: "Active subscriptions",
                  value: dashboard.subscriptions.active,
                  href: ROUTES.SUPER_ADMIN_SUBSCRIPTIONS,
                },
                {
                  label: "Past due billing",
                  value: dashboard.subscriptions.pastDue,
                  href: ROUTES.SUPER_ADMIN_SUBSCRIPTIONS,
                },
                {
                  label: "Failed onboarding",
                  value: dashboard.health.failedProvisioningJobs,
                  href: ROUTES.SUPER_ADMIN_PROVISIONING,
                },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-3xl tabular-nums">{item.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      href={item.href}
                    >
                      Open <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      {!isSuperAdmin && !minimumSetupComplete ? (
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle>Company setup required</CardTitle>
            <CardDescription>
              Finish organization setup before operational modules can be used. {setupProgress}% complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${setupProgress}%` }}
              />
            </div>
            <Button asChild>
              <Link href={ROUTES.ADMIN_SETUP}>Continue company setup</Link>
            </Button>
          </CardContent>
        </Card>
      ) : !isSuperAdmin && setupProgress > 0 && setupProgress < 100 ? (
        <Card>
          <CardHeader>
            <CardTitle>Company setup in progress</CardTitle>
            <CardDescription>Required setup is complete. Optional steps remain.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${setupProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{setupProgress}% complete</p>
            <Button asChild variant="outline">
              <Link href={ROUTES.ADMIN_SETUP}>Open setup wizard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isSuperAdmin && subscriptionBlocked ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Billing action required</CardTitle>
            <CardDescription>
              One or more modules are unavailable because your organization does not have an active plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={ROUTES.PLATFORM_SUBSCRIPTION}>View plan and billing</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isSuperAdmin && blockedModuleItems.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Modules unavailable</CardTitle>
            <CardDescription>
              {blockedModuleItems.length} module{blockedModuleItems.length === 1 ? "" : "s"} cannot
              be used until setup, billing, or entitlements are resolved.
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
                    {item.statusLabel ? <Badge variant="warning">{item.statusLabel}</Badge> : null}
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

      {!isLoading && activeModules.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {activeModules.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.label}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  Open <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </>
  );
}
