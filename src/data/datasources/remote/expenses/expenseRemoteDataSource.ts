import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import { extractApiData } from "@/domain/models/common";
import {
  parseExpense,
  parseExpenseList,
  type Expense,
} from "@/domain/models/expense";
import { apiFetch } from "@/lib/api/client";
import type { CreateExpenseInput } from "@/modules/expenses/schemas/expense.schema";

export const expenseRemoteDataSource = {
  async list(tenantId: string | null): Promise<Expense[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.MODULES.EXPENSES, {
      tenantId,
    });
    return parseExpenseList(extractApiData(response));
  },

  async create(
    input: CreateExpenseInput,
    tenantId: string | null,
  ): Promise<Expense> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.MODULES.EXPENSES, {
      method: "POST",
      body: input,
      tenantId,
    });
    return parseExpense(extractApiData(response));
  },

  async submit(id: string, tenantId: string | null): Promise<Expense> {
    const response = await apiFetch<unknown>(
      API_ENDPOINTS.MODULES.EXPENSE_SUBMIT(id),
      { method: "POST", tenantId },
    );
    return parseExpense(extractApiData(response));
  },
};
