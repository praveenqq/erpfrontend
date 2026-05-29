import { env } from "@/common/config/env";
import type { ApiResponse } from "@/common/types/api";
import { getAccessToken, refreshTokenIfNeeded } from "@/security/auth/keycloak";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  tenantId?: string | null;
  skipAuth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { body, tenantId, skipAuth, headers: initHeaders, ...rest } = options;

  if (!skipAuth) {
    await refreshTokenIfNeeded();
  }

  const headers = new Headers(initHeaders);
  headers.set("Accept", "application/json");
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  if (tenantId) {
    headers.set(env.tenantHeader, tenantId);
  }

  const base = env.apiBaseUrl.replace(/\/$/, "");
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const response = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      (payload as { message?: string })?.message ?? response.statusText,
      response.status,
      payload,
    );
  }

  return payload as ApiResponse<T>;
}
