"use client";

import { client } from "./generated/client.gen";
import { env } from "@/common/config/env";
import { getAccessToken, refreshTokenIfNeeded } from "@/security/auth/keycloak";

let tenantIdResolver: () => string | null = () => null;

export function setTenantIdResolver(resolver: () => string | null) {
  tenantIdResolver = resolver;
}

/**
 * Wire the OpenAPI-generated fetch client with auth + tenant headers.
 */
export function configureGeneratedClient(getTenantId: () => string | null) {
  setTenantIdResolver(getTenantId);
  client.setConfig({
    baseUrl: env.apiBaseUrl,
    auth: async () => {
      await refreshTokenIfNeeded();
      return getAccessToken() ?? undefined;
    },
  });
  return client;
}

export function getGeneratedClientHeaders(): Record<string, string> {
  const tenantId = tenantIdResolver();
  return tenantId ? { [env.tenantHeader]: tenantId } : {};
}
