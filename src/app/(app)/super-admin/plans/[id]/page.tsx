import { use } from "react";
import { PlanDetailPage } from "@/platform/plans";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PlanDetailPage id={id} />;
}
