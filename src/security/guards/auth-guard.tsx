"use client";

import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { GENEX_BRAND } from "@/common/brand/constants";
import { isDevAuth } from "@/common/config/env";
import { useAuth } from "@/security/auth/auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, authError, login } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-teal-50 p-6">
        <Card className="w-full max-w-md border-emerald-100 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Preparing secure workspace</p>
              <p className="text-sm text-muted-foreground">
                Validating the current session, user profile, and tenant context.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-teal-50 p-6">
        <Card className="w-full max-w-md border-red-100 shadow-lg">
          <CardHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <CardTitle>Authentication unavailable</CardTitle>
            <CardDescription>{authError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => login()}>
              Retry secure sign in
            </Button>
            <p className="text-xs text-muted-foreground">
              Protected ERP pages remain unavailable until the identity service confirms the user session.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-teal-50 p-6">
        <Card className="w-full max-w-md border-emerald-100 shadow-lg">
          <CardHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              {isDevAuth()
                ? `Start a local development session to access ${GENEX_BRAND.name} with your configured dev user, roles, and tenant context.`
                : `Sign in with Keycloak to access ${GENEX_BRAND.name} and load your role, permissions, tenant context, and available modules.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => login()}>
              {isDevAuth() ? "Continue with dev session" : "Sign in securely"}
            </Button>
            <p className="text-xs text-muted-foreground">
              {isDevAuth()
                ? "Development mode keeps sign-in local. Use sign out from the user menu to end the session and return here."
                : "The frontend uses the authenticated access token for all protected backend requests and keeps tenant context aligned with token claims."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
