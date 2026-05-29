"use client";

import { Badge } from "@/common/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { useTenant } from "@/platform/tenants/api/tenant-queries";

export function TenantDetailPage({ id }: { id: string }) {
  const { data: tenant, isLoading, error } = useTenant(id);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (error || !tenant) {
    return <p className="text-destructive">Tenant not found.</p>;
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Badge>{tenant.status}</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{tenant.displayName}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <p><span className="text-muted-foreground">Legal name:</span> {tenant.legalName}</p>
          <p><span className="text-muted-foreground">Slug:</span> {tenant.slug}</p>
          <p><span className="text-muted-foreground">Code:</span> {tenant.code ?? "—"}</p>
          <p><span className="text-muted-foreground">Email:</span> {tenant.primaryContactEmail ?? "—"}</p>
        </CardContent>
      </Card>
    </>
  );
}
