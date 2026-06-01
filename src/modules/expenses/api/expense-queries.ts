import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseRepository } from "@/data/repositories/expenses/expenseRepository";
import type { Expense } from "@/domain/models/expense";
import { navigationKeys } from "@/platform/moduleaccess/api/navigation-queries";
import { useTenant } from "@/tenancy/context/tenant-context";
import type { CreateExpenseInput } from "../schemas/expense.schema";

export type { Expense };

export const expenseKeys = {
  all: ["modules", "expenses"] as const,
  list: (tenantId: string | null) => [...expenseKeys.all, "list", tenantId] as const,
  detail: (id: string) => [...expenseKeys.all, "detail", id] as const,
};

export function useExpenses() {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: expenseKeys.list(tenantId),
    queryFn: () => expenseRepository.listExpenses(tenantId),
    enabled: Boolean(tenantId),
  });
}

export function useExpense(id: string) {
  const { tenantId } = useTenant();
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: (): Promise<Expense> => expenseRepository.getExpense(id, tenantId),
    enabled: Boolean(tenantId && id),
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
    mutationFn: (id: string) => expenseRepository.submitExpense(id, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useApproveExpense() {
  const { tenantId } = useTenant();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseRepository.approveExpense(id, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.all });
      qc.invalidateQueries({ queryKey: navigationKeys.navigation });
    },
  });
}

export function useRejectExpense() {
  const { tenantId } = useTenant();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseRepository.rejectExpense(id, tenantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}
