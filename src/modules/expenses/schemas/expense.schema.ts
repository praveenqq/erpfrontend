import { z } from "zod";

export const expenseLineItemSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  expenseDate: z.string().min(1),
});

export const createExpenseSchema = z.object({
  companyId: z.uuid(),
  employeeId: z.uuid(),
  title: z.string().min(2),
  currency: z.string().length(3),
  lineItems: z.array(expenseLineItemSchema).min(1),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
