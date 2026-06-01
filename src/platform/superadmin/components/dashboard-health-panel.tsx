import Link from "next/link";
import { AlertTriangle, CheckCircle2, ServerCrash } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { ROUTES } from "@/common/navigation/routes";
import type { PlatformHealthSnapshot } from "@/domain/models/workspace";
import { DashboardMetricCard } from "./dashboard-metric-card";

interface DashboardHealthPanelProps {
  health: PlatformHealthSnapshot;
}

function HealthAlert({
  active,
  label,
  detail,
}: {
  active: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
      {active ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      )}
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          <Badge variant={active ? "warning" : "success"}>{active ? "Attention" : "Healthy"}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

export function DashboardHealthPanel({ health }: DashboardHealthPanelProps) {
  const provisioningNeedsAttention = health.failedProvisioningJobs > 0;
  const billingNeedsAttention = health.pastDueSubscriptions > 0 || health.failedWebhooks > 0;
  const messagingNeedsAttention = health.pendingOutboxEvents > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ServerCrash className="h-5 w-5 text-primary" />
              Platform health
            </CardTitle>
            <CardDescription>
              Operational signals for provisioning, billing, and background processing.
            </CardDescription>
          </div>
          <Link
            className="text-sm font-medium text-primary hover:underline"
            href={ROUTES.SUPER_ADMIN_PROVISIONING}
          >
            Open provisioning
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetricCard
            description="Failed tenant provisioning jobs"
            href={ROUTES.SUPER_ADMIN_PROVISIONING}
            label="Failed provisioning"
            tone={provisioningNeedsAttention ? "warning" : "default"}
            value={health.failedProvisioningJobs}
          />
          <DashboardMetricCard
            description="Subscriptions currently past due"
            href={ROUTES.PLATFORM_TENANTS}
            label="Past due subscriptions"
            tone={health.pastDueSubscriptions > 0 ? "warning" : "default"}
            value={health.pastDueSubscriptions}
          />
          <DashboardMetricCard
            description="Events waiting in the outbox"
            label="Pending outbox events"
            tone={messagingNeedsAttention ? "warning" : "default"}
            value={health.pendingOutboxEvents}
          />
          <DashboardMetricCard
            description="Payment webhook delivery failures"
            href={ROUTES.PLATFORM_TENANTS}
            label="Failed webhooks"
            tone={health.failedWebhooks > 0 ? "destructive" : "default"}
            value={health.failedWebhooks}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <HealthAlert
            active={provisioningNeedsAttention}
            detail={
              provisioningNeedsAttention
                ? `${health.failedProvisioningJobs} provisioning job(s) need review before affected tenants can become fully operational.`
                : "No failed provisioning jobs are currently recorded."
            }
            label="Provisioning health"
          />
          <HealthAlert
            active={billingNeedsAttention}
            detail={
              billingNeedsAttention
                ? `${health.pastDueSubscriptions} past due subscription(s) and ${health.failedWebhooks} failed webhook(s) may block billing recovery.`
                : "Billing and webhook delivery look stable across the platform."
            }
            label="Billing health"
          />
          <HealthAlert
            active={messagingNeedsAttention}
            detail={
              messagingNeedsAttention
                ? `${health.pendingOutboxEvents} outbox event(s) are still waiting to be processed.`
                : "Background event processing has no pending backlog."
            }
            label="Messaging health"
          />
        </div>
      </CardContent>
    </Card>
  );
}
