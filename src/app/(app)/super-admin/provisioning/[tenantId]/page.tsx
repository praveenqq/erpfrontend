import { use } from "react";
import { ProvisioningDetailPage } from "@/platform/provisioning";

export default function Page({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = use(params);
  return <ProvisioningDetailPage tenantId={tenantId} />;
}
