import { use } from "react";
import { TenantDetailPage } from "@/platform/tenants";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TenantDetailPage id={id} />;
}
