import { use } from "react";
import { SubscriptionDetailPage } from "@/platform/subscriptions";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SubscriptionDetailPage id={id} />;
}
