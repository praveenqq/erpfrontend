import { z } from "zod";

export const retryProvisioningSchema = z.object({
  reason: z.string().min(3, "Reason is required for audit trail"),
});

export type RetryProvisioningInput = z.infer<typeof retryProvisioningSchema>;
