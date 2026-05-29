"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";

export function SubscriptionPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current plan</CardTitle>
        <CardDescription>
          Tenant subscription via /v1/platform/tenant/subscription.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Implement plan upgrade flows in platform/subscriptions.
      </CardContent>
    </Card>
  );
}
