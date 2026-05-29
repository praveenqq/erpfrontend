"use client";

import { AppHeader } from "@/common/components/layout/app-header";
import { AppSidebar } from "@/common/components/layout/app-sidebar";

/**
 * Authenticated workspace shell — persistent sidebar on every module route (Printila SellerPortal pattern).
 */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="min-h-0 flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
