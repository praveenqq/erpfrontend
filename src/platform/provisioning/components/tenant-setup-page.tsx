"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { useWorkspaceNavigation } from "@/platform/moduleaccess/hooks/use-workspace-navigation";

export function TenantSetupPage() {
  const { setupProgress } = useWorkspaceNavigation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup wizard</CardTitle>
        <CardDescription>Complete required steps to activate modules.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${setupProgress}%` }}
          />
        </div>
        <p className="mt-2 text-sm">{setupProgress}% complete</p>
      </CardContent>
    </Card>
  );
}
