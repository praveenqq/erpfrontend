import type { ApiResponse } from "@/common/types/api";

export const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export function extractApiData<T>(payload: ApiResponse<T> | unknown): T {
  const record = asRecord(payload);
  if ("data" in record) {
    return record.data as T;
  }
  return payload as T;
}

export function parseString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function parseOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function parseNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}
