import { use } from "react";
import { RoleDetailPage } from "@/platform/identity";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <RoleDetailPage id={id} />;
}
