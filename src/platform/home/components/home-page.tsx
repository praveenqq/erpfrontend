"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/common/navigation/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { useWorkspaceNavigation } from "@/platform/moduleaccess/hooks/use-workspace-navigation";

export function HomePage() {
  const { setupProgress, minimumSetupComplete } = useWorkspaceNavigation();

  return (
    <>
      {setupProgress > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Setup progress</CardTitle>
            <CardDescription>
              {minimumSetupComplete
                ? "Minimum setup is complete."
                : "Complete setup to unlock all modules."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${setupProgress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {setupProgress}% complete
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { href: ROUTES.PLATFORM_TENANTS, title: "Tenants", desc: "Manage organizations" },
          { href: ROUTES.MODULE_EXPENSES, title: "Expenses", desc: "Submit and approve claims" },
          { href: ROUTES.SUPER_ADMIN_DASHBOARD, title: "Platform", desc: "Super admin overview" },
        ].map((item) => (
          <Card key={item.href}>
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.desc}</CardDescription>
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
    </>
  );
}
