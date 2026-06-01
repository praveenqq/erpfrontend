import { z } from "zod";

export const planVisibilitySchema = z.enum(["PUBLIC", "PRIVATE", "INTERNAL"]);
export const planTypeSchema = z.enum(["STANDARD", "TRIAL", "ENTERPRISE", "CUSTOM"]);
export const planBillingCycleSchema = z.enum([
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
  "TRIAL",
  "CUSTOM",
]);
export const limitEnforcementSchema = z.enum(["HARD_LIMIT", "SOFT_LIMIT", "WARNING_ONLY"]);

export const createPlanSchema = z.object({
  code: z
    .string()
    .min(2, "Plan code is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  name: z.string().min(2, "Plan name is required"),
  description: z.string().optional(),
  planType: planTypeSchema,
  visibility: planVisibilitySchema,
  trialDays: z.number().int().min(0).optional(),
});

export const updatePlanSchema = z.object({
  name: z.string().min(2, "Plan name is required"),
  description: z.string().optional(),
  visibility: planVisibilitySchema,
  trialDays: z.number().int().min(0).optional(),
});

export const planPriceSchema = z.object({
  currency: z.string().length(3, "Use a 3-letter currency code"),
  billingCycle: planBillingCycleSchema,
  amount: z.number().positive("Amount must be greater than zero"),
  countryCode: z.string().length(2).optional().or(z.literal("")),
  taxInclusive: z.boolean(),
  version: z.number().int().min(1),
});

export const planLimitRowSchema = z.object({
  limitCode: z.string().min(1, "Limit code is required"),
  limitValue: z.number().int().min(0),
  limitType: z.string(),
  enforcementType: limitEnforcementSchema,
});

export const configurePlanLimitsSchema = z.object({
  version: z.number().int().min(1),
  limits: z.array(planLimitRowSchema).min(1, "Add at least one limit"),
});

export const configurePlanModulesSchema = z.object({
  version: z.number().int().min(1),
  modules: z.array(z.string().min(1)).min(1, "Select at least one module"),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type PlanPriceInput = z.infer<typeof planPriceSchema>;
export type ConfigurePlanLimitsInput = z.infer<typeof configurePlanLimitsSchema>;
export type ConfigurePlanModulesInput = z.infer<typeof configurePlanModulesSchema>;
