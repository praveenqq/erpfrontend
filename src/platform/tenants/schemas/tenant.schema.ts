import { z } from "zod";

export const createTenantSchema = z.object({
  legalName: z.string().min(2, "Legal name is required"),
  displayName: z.string().min(2, "Display name is required"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  type: z.enum(["SMB", "ENTERPRISE", "PARTNER"]),
  countryCode: z.string().length(2),
  defaultCurrency: z.string().length(3),
  defaultTimezone: z.string().min(1),
  defaultLocale: z.string().min(2),
  primaryContactEmail: z.email(),
  planCode: z.string().min(1),
  idempotencyKey: z.string().optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export const updateTenantStatusSchema = z.object({
  status: z.enum(["PENDING", "PROVISIONING", "ACTIVE", "SUSPENDED", "CANCELLED", "ARCHIVED"]),
  reason: z.string().min(3, "Reason is required"),
});

export type UpdateTenantStatusInput = z.infer<typeof updateTenantStatusSchema>;
