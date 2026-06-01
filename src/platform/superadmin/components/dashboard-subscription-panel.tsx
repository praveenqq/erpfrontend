import Link from "next/link";
import { CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { SubscriptionStatusChart } from "@/common/components/charts/subscription-status-chart";
import { ROUTES } from "@/common/navigation/routes";
import type { SubscriptionCountsSnapshot } from "@/domain/models/workspace";
import { DashboardMetricCard } from "./dashboard-metric-card";

interface DashboardSubscriptionPanelProps {
  subscriptions: SubscriptionCountsSnapshot;
}

export function DashboardSubscriptionPanel({ subscriptions }: DashboardSubscriptionPanelProps) {
  const chartData = [
    { name: "Active", value: subscriptions.active },
    { name: "Trialing", value: subscriptions.trialing },
    { name: "Past due", value: subscriptions.pastDue },
    { name: "Expired", value: subscriptions.expired },
    { name: "Cancelled", value: subscriptions.cancelled },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Subscription status
            </CardTitle>
            <CardDescription>
              Commercial lifecycle distribution across all tenant subscriptions.
            </CardDescription>
          </div>
          <Link
            className="text-sm font-medium text-primary hover:underline"
            href={ROUTES.SUPER_ADMIN_SUBSCRIPTIONS}
          >
            Manage subscriptions
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardMetricCard
            description="Currently billable subscriptions"
            href={ROUTES.PLATFORM_TENANTS}
            label="Active"
            tone="success"
            value={subscriptions.active}
          />
          <DashboardMetricCard
            description="Tenants still in trial"
            href={ROUTES.PLATFORM_TENANTS}
            label="Trialing"
            value={subscriptions.trialing}
          />
          <DashboardMetricCard
            description="Payment recovery required"
            href={ROUTES.PLATFORM_TENANTS}
            label="Past due"
            tone={subscriptions.pastDue > 0 ? "warning" : "default"}
            value={subscriptions.pastDue}
          />
          <DashboardMetricCard
            description="Expired commercial coverage"
            href={ROUTES.PLATFORM_TENANTS}
            label="Expired"
            tone={subscriptions.expired > 0 ? "warning" : "default"}
            value={subscriptions.expired}
          />
          <DashboardMetricCard
            description="Cancelled subscriptions"
            href={ROUTES.PLATFORM_TENANTS}
            label="Cancelled"
            value={subscriptions.cancelled}
          />
        </div>
        <SubscriptionStatusChart data={chartData} />
      </CardContent>
    </Card>
  );
}
