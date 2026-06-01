"use client";

import Keycloak from "keycloak-js";
import { env, isDevAuth } from "@/common/config/env";

let keycloakInstance: Keycloak | null = null;

export function getKeycloak(): Keycloak {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: env.keycloak.url,
      realm: env.keycloak.realm,
      clientId: env.keycloak.clientId,
    });
  }
  return keycloakInstance;
}

export async function initKeycloak(): Promise<Keycloak | null> {
  if (isDevAuth()) return null;

  const keycloak = getKeycloak();
  const authenticated = await keycloak.init({
    onLoad: "check-sso",
    pkceMethod: "S256",
    checkLoginIframe: false,
    silentCheckSsoFallback: false,
  });

  if (!authenticated) {
    return keycloak;
  }

  return keycloak;
}

export function loginWithKeycloak(): Promise<void> {
  return getKeycloak().login({ redirectUri: window.location.href });
}

export function getAccessToken(): string | undefined {
  if (isDevAuth()) return "dev-token";
  return getKeycloak().token ?? undefined;
}

export async function refreshTokenIfNeeded(minValiditySec = 30): Promise<void> {
  if (isDevAuth()) return;
  const keycloak = getKeycloak();
  if (!keycloak.authenticated) return;
  try {
    await keycloak.updateToken(minValiditySec);
  } catch {
    await keycloak.login({ redirectUri: window.location.href });
  }
}

export function logoutWithKeycloak(): void {
  getKeycloak().logout({ redirectUri: window.location.origin });
}
