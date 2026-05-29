import { parseOptionalString, parseString } from "../common";

export interface Expense {
  id: string;
  title: string;
  currency: string;
  status: string;
  totalAmount?: number;
  createdAt?: string;
}

export function parseExpense(raw: unknown): Expense {
  const r = raw as Record<string, unknown>;
  return {
    id: parseString(r.id),
    title: parseString(r.title),
    currency: parseString(r.currency),
    status: parseString(r.status),
    totalAmount:
      typeof r.totalAmount === "number" ? r.totalAmount : undefined,
    createdAt: parseOptionalString(r.createdAt),
  };
}

export function parseExpenseList(raw: unknown): Expense[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(parseExpense);
}
