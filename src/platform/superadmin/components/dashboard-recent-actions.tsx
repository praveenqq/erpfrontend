import Link from "next/link";
import { Clock3 } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
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
import type { RecentPlatformAction } from "@/domain/models/workspace";
import {
  formatActionType,
  formatDashboardTimestamp,
} from "@/platform/superadmin/utils/dashboard-formatters";

interface DashboardRecentActionsProps {
  actions: RecentPlatformAction[];
}

export function DashboardRecentActions({ actions }: DashboardRecentActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-primary" />
          Recent platform actions
        </CardTitle>
        <CardDescription>
          Latest super-admin changes across tenants, subscriptions, modules, and provisioning.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            No platform actions have been recorded yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <Badge variant="secondary">{formatActionType(action.actionType)}</Badge>
                  </TableCell>
                  <TableCell>
                    {action.targetTenantId ? (
                      <Link
                        className="font-medium text-primary hover:underline"
                        href={ROUTES.PLATFORM_TENANT_DETAIL(action.targetTenantId)}
                      >
                        View tenant
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Platform</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {action.actorUserId ? `${action.actorUserId.slice(0, 8)}…` : "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDashboardTimestamp(action.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
