"use client";

import { useState } from "react";
import { DataTable } from "@/common/components/data-table/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { useDebounce } from "@/common/hooks/use-debounce";
import { useTenants } from "@/platform/tenants/api/tenant-queries";
import { tenantColumns } from "@/platform/tenants/components/tenant-columns";
import { CreateTenantForm } from "@/platform/tenants/components/create-tenant-form";

export function TenantsPage() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);
  const { data, isLoading, error } = useTenants({ q: debouncedQ });

  return (
    <>
      <Card id="create-tenant">
        <CardHeader>
          <CardTitle>Create tenant</CardTitle>
          <CardDescription>Provision a new organization on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTenantForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All tenants</CardTitle>
            <CardDescription>Search and browse tenant records.</CardDescription>
          </div>
          <Input
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {error && (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Failed to load tenants"}
            </p>
          )}
          {data && <DataTable columns={tenantColumns} data={data.content} />}
        </CardContent>
      </Card>
    </>
  );
}
