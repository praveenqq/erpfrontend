"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { configureGeneratedClient } from "@/lib/api/configure-client";
import { createQueryClient } from "@/lib/query/query-client";
import { AuthProvider } from "@/security/auth/auth-provider";
import { MeProfileSync } from "@/security/auth/me-profile-sync";
import { TenantProvider, useTenant } from "@/tenancy/context/tenant-context";

function ApiClientBootstrap({ children }: { children: React.ReactNode }) {
  const { tenantId } = useTenant();
  useEffect(() => {
    configureGeneratedClient(() => tenantId);
  }, [tenantId]);
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <ApiClientBootstrap>
              <MeProfileSync />
              {children}
              <Toaster richColors position="top-right" />
            </ApiClientBootstrap>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
