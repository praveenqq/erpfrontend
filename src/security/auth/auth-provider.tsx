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
  isDevSessionSignedIn,
  markDevSessionSignedIn,
  markDevSessionSignedOut,
} from "./dev-session";
import {
  initKeycloak,
  loginWithKeycloak,
  logoutWithKeycloak,
  refreshTokenIfNeeded,
} from "./keycloak";
import type { MeProfile } from "@/domain/models/me";

type TokenClaims = Record<string, unknown> | undefined;

export type AuthMode = "super-admin" | "tenant-admin" | "tenant-user" | "anonymous";

export interface CurrentUserContext {
  id: string | undefined;
  email: string | undefined;
  displayName: string | undefined;
  tenantId: string | null;
  companyId: string | null;
  roles: string[];
  permissions: string[];
  mode: AuthMode;
  isSuperAdmin: boolean;
  isTenantUser: boolean;
  isTenantAdmin: boolean;
}

interface AuthContextValue extends CurrentUserContext {
  keycloak: Keycloak | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  token: string | undefined;
  currentUser: CurrentUserContext;
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  applyMeProfile: (profile: MeProfile) => void;
}

const DEV_ROLES = [
  "TENANT_VIEW",
  "TENANT_CREATE",
  "SUPER_ADMIN_ACCESS",
  "EXPENSE_APPROVE",
];

const DEV_PERMISSIONS = [
  "SUPER_ADMIN_ACCESS",
  "SUPER_ADMIN_TENANT_READ",
  "SUPER_ADMIN_TENANT_WRITE",
  "SUPER_ADMIN_MODULE_MANAGE",
  "PLAN_VIEW_INTERNAL",
  "PLAN_CREATE",
  "PLAN_UPDATE",
  "PLAN_PUBLISH",
  "PLAN_DEPRECATE",
  "PLAN_PRICE_MANAGE",
  "PLAN_LIMIT_MANAGE",
  "PLAN_ENTITLEMENT_MANAGE",
  "SUBSCRIPTION_VIEW",
  "SUBSCRIPTION_CREATE",
  "SUBSCRIPTION_ACTIVATE",
  "SUBSCRIPTION_MANAGE",
  "SUBSCRIPTION_CHANGE_PLAN",
  "SUBSCRIPTION_CANCEL",
  "SUBSCRIPTION_SUSPEND",
  "SUBSCRIPTION_RESUME",
  "SUBSCRIPTION_OVERRIDE",
  "SUBSCRIPTION_VIEW_BILLING",
  "SUPER_ADMIN_SUBSCRIPTION_READ",
  "SUPER_ADMIN_SUBSCRIPTION_MANAGE",
  "SUPER_ADMIN_BILLING_MANAGE",
  "SUPER_ADMIN_DANGEROUS_ACTION",
  "SUPER_ADMIN_AUDIT_READ",
  "SUPER_ADMIN_PROVISIONING_MANAGE",
  "TENANT_VIEW",
  "TENANT_CREATE",
  "TENANT_UPDATE",
  "USER_VIEW",
  "USER_MANAGE",
  "ROLE_VIEW",
  "ROLE_MANAGE",
  "EMPLOYEE_VIEW",
  "EMPLOYEE_MANAGE",
  "EXPENSE_APPROVE",
];

const AuthContext = createContext<AuthContextValue | null>(null);

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function claimString(claims: TokenClaims, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = asString(claims?.[key]);
    if (value) return value;
  }
  return undefined;
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    return value
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function extractRoles(keycloak: Keycloak | null, claims: TokenClaims): string[] {
  if (isDevAuth()) return DEV_ROLES;

  const realmRoles = keycloak?.realmAccess?.roles ?? [];
  const clientRoles =
    keycloak?.resourceAccess?.[keycloak.clientId ?? ""]?.roles ?? [];
  const directRoles = normalizeList(claims?.roles);
  const authorities = normalizeList(claims?.authorities);

  return [...new Set([...realmRoles, ...clientRoles, ...directRoles, ...authorities])];
}

function extractPermissions(claims: TokenClaims, roles: string[]): string[] {
  if (isDevAuth()) return DEV_PERMISSIONS;

  const permissions = normalizeList(claims?.permissions);
  const scopePermissions = normalizeList(claims?.scope);

  return [...new Set([...permissions, ...scopePermissions, ...roles])];
}

function resolveDisplayName(claims: TokenClaims): string | undefined {
  const explicitName = claimString(claims, "name", "preferred_username");
  if (explicitName) return explicitName;

  const firstName = claimString(claims, "given_name");
  const lastName = claimString(claims, "family_name");
  return [firstName, lastName].filter(Boolean).join(" ") || undefined;
}

function resolveMode(roles: string[], permissions: string[], tenantId: string | null): AuthMode {
  const access = new Set([...roles, ...permissions]);
  if (
    access.has("SUPER_ADMIN_ACCESS") ||
    roles.includes("PLATFORM_SUPER_ADMIN") ||
    permissions.includes("PLATFORM_SUPER_ADMIN")
  ) {
    return "super-admin";
  }
  if ([...access].some((item) => item.includes("ADMIN"))) return "tenant-admin";
  if (tenantId) return "tenant-user";
  return "anonymous";
}

function buildCurrentUser(
  keycloak: Keycloak | null,
  devSignedIn: boolean,
  serverProfile: MeProfile | null,
): CurrentUserContext {
  if (isDevAuth() && !devSignedIn) {
    return {
      id: undefined,
      email: undefined,
      displayName: undefined,
      tenantId: null,
      companyId: null,
      roles: [],
      permissions: [],
      mode: "anonymous",
      isSuperAdmin: false,
      isTenantAdmin: false,
      isTenantUser: false,
    };
  }

  const claims = isDevAuth()
    ? {
        sub: "dev-user-id",
        email: "dev@localhost",
        name: "Dev User",
        tenant_id: process.env.NEXT_PUBLIC_DEV_TENANT_ID ?? "dev-tenant",
        company_id: process.env.NEXT_PUBLIC_DEV_COMPANY_ID ?? "dev-company",
        permissions: DEV_PERMISSIONS,
      }
    : (keycloak?.tokenParsed as TokenClaims);

  const tenantId =
    serverProfile?.tenantId ??
    claimString(claims, "tenant_id", "tenantId") ??
    null;
  const companyId =
    serverProfile?.companyId ??
    claimString(claims, "company_id", "companyId") ??
    null;

  const mergedRoles = serverProfile?.roles?.length
    ? serverProfile.roles
    : extractRoles(keycloak, claims);
  const mergedPermissions = serverProfile?.permissions?.length
    ? serverProfile.permissions
    : extractPermissions(claims, mergedRoles);
  const mode = resolveMode(mergedRoles, mergedPermissions, tenantId);

  return {
    id: isDevAuth()
      ? "dev-user-id"
      : serverProfile?.userId ?? keycloak?.subject ?? claimString(claims, "sub"),
    email: claimString(claims, "email"),
    displayName: resolveDisplayName(claims),
    tenantId,
    companyId,
    roles: mergedRoles,
    permissions: mergedPermissions,
    mode,
    isSuperAdmin: mode === "super-admin",
    isTenantAdmin: mode === "tenant-admin",
    isTenantUser: mode === "tenant-admin" || mode === "tenant-user",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [devSignedIn, setDevSignedIn] = useState(() =>
    isDevAuth() ? isDevSessionSignedIn() : false,
  );
  const [isLoading, setIsLoading] = useState(() => !isDevAuth());
  const [authError, setAuthError] = useState<string | null>(null);
  const [serverProfile, setServerProfile] = useState<MeProfile | null>(null);

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
            "Unable to reach the identity provider. Confirm the authentication service is available or use development authentication locally.",
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

  const currentUser = useMemo(
    () => buildCurrentUser(keycloak, devSignedIn, serverProfile),
    [keycloak, devSignedIn, serverProfile],
  );
  const isAuthenticated = isDevAuth()
    ? devSignedIn
    : Boolean(keycloak?.authenticated);

  const handleLogin = useCallback(async () => {
    if (isDevAuth()) {
      markDevSessionSignedIn();
      setDevSignedIn(true);
      return;
    }
    await loginWithKeycloak();
  }, []);

  const handleLogout = useCallback(() => {
    if (isDevAuth()) {
      markDevSessionSignedOut();
      setDevSignedIn(false);
      return;
    }
    logoutWithKeycloak();
  }, []);

  const hasRole = useCallback(
    (role: string) => currentUser.roles.includes(role),
    [currentUser.roles],
  );
  const hasAnyRole = useCallback(
    (rolesToMatch: string[]) =>
      rolesToMatch.length === 0 || rolesToMatch.some((role) => currentUser.roles.includes(role)),
    [currentUser.roles],
  );
  const hasAllRoles = useCallback(
    (rolesToMatch: string[]) => rolesToMatch.every((role) => currentUser.roles.includes(role)),
    [currentUser.roles],
  );
  const hasPermission = useCallback(
    (permission: string) => currentUser.permissions.includes(permission),
    [currentUser.permissions],
  );
  const hasAnyPermission = useCallback(
    (permissionsToMatch: string[]) =>
      permissionsToMatch.length === 0 ||
      permissionsToMatch.some((permission) => currentUser.permissions.includes(permission)),
    [currentUser.permissions],
  );
  const hasAllPermissions = useCallback(
    (permissionsToMatch: string[]) =>
      permissionsToMatch.every((permission) => currentUser.permissions.includes(permission)),
    [currentUser.permissions],
  );

  const applyMeProfile = useCallback((profile: MeProfile) => {
    setServerProfile(profile);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      keycloak,
      isAuthenticated,
      isLoading,
      authError,
      token: isDevAuth()
        ? devSignedIn
          ? "dev-token"
          : undefined
        : keycloak?.token,
      currentUser,
      ...currentUser,
      login: handleLogin,
      logout: handleLogout,
      refreshToken: refreshTokenIfNeeded,
      hasRole,
      hasAnyRole,
      hasAllRoles,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      applyMeProfile,
    }),
    [
      keycloak,
      isAuthenticated,
      isLoading,
      authError,
      devSignedIn,
      currentUser,
      handleLogin,
      handleLogout,
      hasRole,
      hasAnyRole,
      hasAllRoles,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      applyMeProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useCurrentUser() {
  return useAuth().currentUser;
}

export function useHasRole(role: string): boolean {
  const { hasRole } = useAuth();
  return hasRole(role);
}

export function useHasRoles(
  requiredRoles: string[],
  match: "any" | "all" = "any",
): boolean {
  const { hasAnyRole, hasAllRoles } = useAuth();
  if (requiredRoles.length === 0) return true;
  return match === "all" ? hasAllRoles(requiredRoles) : hasAnyRole(requiredRoles);
}

export function useHasPermission(permission: string): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

export function useHasPermissions(
  requiredPermissions: string[],
  match: "any" | "all" = "any",
): boolean {
  const { hasAnyPermission, hasAllPermissions } = useAuth();
  if (requiredPermissions.length === 0) return true;
  return match === "all"
    ? hasAllPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions);
}

export function useRequireAuth() {
  const auth = useAuth();
  return auth;
}

export function useApplyMeProfile() {
  return useAuth().applyMeProfile;
}
