import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseRepository } from "@/data/repositories/expenses/expenseRepository";
import type { Expense } from "@/domain/models/expense";
import { useTenant } from "@/tenancy/context/tenant-context";
import type { CreateExpenseInput } from "../schemas/expense.schema";

export type { Expense };

export const expenseKeys = {
  all: ["modules", "expenses"] as const,
};

export function useExpenses() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: expenseKeys.all,
    queryFn: () => expenseRepository.listExpenses(tenantId),
    enabled: Boolean(tenantId),
  });
}

export function useCreateExpense() {
  const { tenantId } = useTenant();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) =>
      expenseRepository.createExpense(input, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useSubmitExpense() {
  const { tenantId } = useTenant();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      expenseRepository.submitExpense(id, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}
