"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type Keycloak from "keycloak-js";
import { isDevAuth } from "@/common/config/env";
import {
  initKeycloak,
  login,
  logout,
  refreshTokenIfNeeded,
} from "./keycloak";

interface AuthContextValue {
  keycloak: Keycloak | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  token: string | undefined;
  roles: string[];
  userId: string | undefined;
  email: string | undefined;
  displayName: string | undefined;
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const DEV_ROLES = [
  "TENANT_VIEW",
  "TENANT_CREATE",
  "SUPER_ADMIN_ACCESS",
  "EXPENSE_APPROVE",
];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [isLoading, setIsLoading] = useState(() => !isDevAuth());
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isDevAuth()) return;

    let mounted = true;
    initKeycloak()
      .then((kc) => {
        if (mounted) {
          setKeycloak(kc);
          setAuthError(null);
        }
      })
      .catch((err: unknown) => {
        console.error("Keycloak initialization failed:", err);
        if (mounted) {
          setAuthError(
            "Unable to reach Keycloak. Start Keycloak or set NEXT_PUBLIC_AUTH_MODE=dev in .env.local.",
          );
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isDevAuth() || !keycloak?.authenticated) return;
    const interval = setInterval(() => {
      refreshTokenIfNeeded().catch(console.error);
    }, 60_000);
    return () => clearInterval(interval);
  }, [keycloak]);

  const roles = useMemo(() => {
    if (isDevAuth()) return DEV_ROLES;
    const realmRoles = keycloak?.realmAccess?.roles ?? [];
    const clientRoles =
      keycloak?.resourceAccess?.[keycloak.clientId ?? ""]?.roles ?? [];
    return [...new Set([...realmRoles, ...clientRoles])];
  }, [keycloak]);

  const isAuthenticated = isDevAuth() || Boolean(keycloak?.authenticated);

  const value = useMemo<AuthContextValue>(
    () => ({
      keycloak,
      isAuthenticated,
      isLoading,
      authError,
      token: isDevAuth() ? "dev-token" : keycloak?.token,
      roles,
      userId: isDevAuth() ? "dev-user-id" : keycloak?.subject,
      email: isDevAuth()
        ? "dev@localhost"
        : (keycloak?.tokenParsed?.email as string | undefined),
      displayName: isDevAuth()
        ? "Dev User"
        : (keycloak?.tokenParsed?.name as string | undefined),
      login,
      logout,
      refreshToken: refreshTokenIfNeeded,
    }),
    [keycloak, isAuthenticated, isLoading, authError, roles],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useHasRole(role: string): boolean {
  const { roles } = useAuth();
  return roles.includes(role);
}

export function useHasRoles(
  requiredRoles: string[],
  match: "any" | "all" = "any",
): boolean {
  const { roles } = useAuth();
  if (requiredRoles.length === 0) return true;
  return match === "all"
    ? requiredRoles.every((role) => roles.includes(role))
    : requiredRoles.some((role) => roles.includes(role));
}

export function useRequireAuth() {
  const auth = useAuth();
  const handleLogin = useCallback(() => login(), []);
  return { ...auth, login: handleLogin };
}
