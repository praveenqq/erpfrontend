"use client";

import { usePathname } from "next/navigation";
import { getModulePageConfig } from "@/platform/moduleaccess/config/module-registry";
import { ModulePageHeader } from "./module-page-header";

export function ModulePageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const config = getModulePageConfig(pathname);

  if (!config) return <>{children}</>;

  return (
    <div className="space-y-6">
      <ModulePageHeader config={config} />
      {children}
    </div>
  );
}
