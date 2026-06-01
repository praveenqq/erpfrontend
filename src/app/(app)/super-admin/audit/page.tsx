import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AuditLogsPage } from "@/platform/audit";

function AuditLoading() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<AuditLoading />}>
      <AuditLogsPage />
    </Suspense>
  );
}
