function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export type AuthMode = "keycloak" | "dev";

export const env = {
  /** Same-origin `/api` in dev (proxied by Next.js). Override for direct backend URL if needed. */
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  authMode: (process.env.NEXT_PUBLIC_AUTH_MODE ?? "keycloak") as AuthMode,
  keycloak: {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "http://localhost:8180",
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "erp",
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "erp-frontend",
  },
  tenantHeader: process.env.NEXT_PUBLIC_TENANT_HEADER ?? "X-Tenant-Id",
} as const;

export function isDevAuth(): boolean {
  return env.authMode === "dev";
}

export function assertRuntimeEnv() {
  if (typeof window === "undefined") return;
  required("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL);
}
