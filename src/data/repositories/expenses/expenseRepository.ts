import { expenseRemoteDataSource } from "@/data/datasources/remote/expenses/expenseRemoteDataSource";

export const expenseRepository = {
  listExpenses: expenseRemoteDataSource.list,
  createExpense: expenseRemoteDataSource.create,
  submitExpense: expenseRemoteDataSource.submit,
  getExpense: expenseRemoteDataSource.getById,
  approveExpense: expenseRemoteDataSource.approve,
  rejectExpense: expenseRemoteDataSource.reject,
};
