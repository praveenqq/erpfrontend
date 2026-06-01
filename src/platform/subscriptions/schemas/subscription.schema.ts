import { z } from "zod";

export const createSubscriptionSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  planId: z.string().min(1, "Plan is required"),
  trialDays: z.number().int().min(1).max(90).optional(),
});

export const subscriptionReasonSchema = z.object({
  reason: z.string().min(3, "Reason is required"),
  immediate: z.boolean().default(true),
});

export const changePlanSchema = z.object({
  newPlanId: z.string().min(1, "Plan is required"),
  reason: z.string().optional(),
});

export const tenantChangePlanSchema = z.object({
  planCode: z.string().min(1, "Plan is required"),
  reason: z.string().min(3, "A short reason is required for audit"),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type SubscriptionReasonInput = z.infer<typeof subscriptionReasonSchema>;
export type ChangePlanInput = z.infer<typeof changePlanSchema>;
export type TenantChangePlanInput = z.infer<typeof tenantChangePlanSchema>;
