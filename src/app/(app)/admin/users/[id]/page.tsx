import { use } from "react";
import { UserDetailPage } from "@/platform/identity";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <UserDetailPage id={id} />;
}
