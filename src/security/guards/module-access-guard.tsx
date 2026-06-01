"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { findNavigationItemByPath } from "@/domain/models/navigation";
import { useNavigation } from "@/platform/moduleaccess/api/navigation-queries";
import { resolveBlockedReason } from "@/platform/moduleaccess/config/navigation-blocked-reasons";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { ROUTES } from "@/common/navigation/routes";

export function ModuleAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, isLoading, isError } = useNavigation();

  if (!pathname.startsWith("/modules/")) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Checking module access</CardTitle>
          <CardDescription>Loading backend navigation rules for this workspace.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-amber-500/30">
        <CardHeader>
          <CardTitle>Navigation unavailable</CardTitle>
          <CardDescription>
            Module access could not be verified. Backend enforcement still applies to API calls.
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  const navItem = findNavigationItemByPath(data?.items ?? [], pathname);

  if (!navItem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Module not available</CardTitle>
          <CardDescription>
            This module is not exposed in backend navigation for your current permissions or
            entitlements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={ROUTES.HOME}>Return to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!navItem.enabled) {
    const blocked = resolveBlockedReason(navItem.blockedReason, navItem.reasonMessage);

    return (
      <Card className="border-amber-500/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{navItem.label}</CardTitle>
            {blocked?.statusLabel ? <Badge variant="warning">{blocked.statusLabel}</Badge> : null}
          </div>
          <CardDescription>
            {blocked?.message ?? "This module is blocked for the current workspace."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {blocked?.actionHref && blocked.actionLabel ? (
            <Button asChild>
              <Link href={blocked.actionHref}>{blocked.actionLabel}</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href={ROUTES.HOME}>Return to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
