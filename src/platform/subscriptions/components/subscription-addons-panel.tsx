"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import type { SubscriptionAddon } from "@/domain/models/subscription";
import { useModuleRegistry } from "@/platform/moduleaccess/api/module-registry-queries";
import {
  useAddSubscriptionAddon,
  useRemoveSubscriptionAddon,
  useSubscriptionAddons,
} from "@/platform/subscriptions/api/subscription-queries";

export function SubscriptionAddonsPanel({ subscriptionId }: { subscriptionId: string }) {
  const { data: addons, isLoading, error } = useSubscriptionAddons(subscriptionId);
  const { data: registry } = useModuleRegistry();
  const addAddon = useAddSubscriptionAddon(subscriptionId);
  const removeAddon = useRemoveSubscriptionAddon(subscriptionId);
  const [addonCode, setAddonCode] = useState("");
  const [name, setName] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [quantity, setQuantity] = useState("1");

  const paidModules = (registry ?? []).filter((entry) => entry.paid);

  const submit = async () => {
    if (!addonCode.trim() || !name.trim()) {
      toast.error("Add-on code and name are required");
      return;
    }
    const parsedQuantity = Number.parseInt(quantity, 10);
    try {
      await addAddon.mutateAsync({
        addonCode: addonCode.trim(),
        name: name.trim(),
        moduleCode: moduleCode || undefined,
        quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
      });
      toast.success("Add-on attached");
      setAddonCode("");
      setName("");
      setModuleCode("");
      setQuantity("1");
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Failed to add add-on");
    }
  };

  const remove = async (addon: SubscriptionAddon) => {
    try {
      await removeAddon.mutateAsync(addon.id);
      toast.success("Add-on removed");
    } catch (removeError) {
      toast.error(removeError instanceof Error ? removeError.message : "Failed to remove add-on");
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? <p className="text-sm text-muted-foreground">Loading add-ons…</p> : null}
      {error ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load add-ons"}
        </p>
      ) : null}

      {!isLoading && !error ? (
        <>
          {(addons?.length ?? 0) > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(addons ?? []).map((addon) => (
                  <TableRow key={addon.id}>
                    <TableCell className="font-mono text-xs">{addon.addonCode}</TableCell>
                    <TableCell>{addon.name}</TableCell>
                    <TableCell>{addon.moduleCode ?? "—"}</TableCell>
                    <TableCell>{addon.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{addon.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        disabled={removeAddon.isPending}
                        onClick={() => remove(addon)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No active add-ons on this subscription.</p>
          )}

          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold">Attach add-on</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="addon-code">Add-on code</Label>
                <Input
                  id="addon-code"
                  onChange={(event) => setAddonCode(event.target.value)}
                  value={addonCode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addon-name">Display name</Label>
                <Input id="addon-name" onChange={(event) => setName(event.target.value)} value={name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addon-module">Module (optional)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  id="addon-module"
                  onChange={(event) => setModuleCode(event.target.value)}
                  value={moduleCode}
                >
                  <option value="">No module link</option>
                  {paidModules.map((module) => (
                    <option key={module.code} value={module.code}>
                      {module.name} ({module.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addon-quantity">Quantity</Label>
                <Input
                  id="addon-quantity"
                  inputMode="numeric"
                  min={1}
                  onChange={(event) => setQuantity(event.target.value)}
                  type="number"
                  value={quantity}
                />
              </div>
            </div>
            <Button className="mt-4" disabled={addAddon.isPending} onClick={submit} type="button">
              {addAddon.isPending ? "Adding…" : "Add add-on"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
