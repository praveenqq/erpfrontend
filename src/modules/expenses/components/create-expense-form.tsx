"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { useEmployees } from "@/modules/employees/api/employee-queries";
import { useCreateExpense } from "@/modules/expenses/api/expense-queries";
import {
  createExpenseSchema,
  type CreateExpenseInput,
} from "@/modules/expenses/schemas/expense.schema";
import { useOrganizationCompany } from "@/platform/organization/api/organization-queries";

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm";

const defaultLineItem = () => ({
  category: "Travel",
  description: "",
  amount: 0,
  expenseDate: new Date().toISOString().slice(0, 10),
});

export function CreateExpenseForm() {
  const { data: company } = useOrganizationCompany();
  const { data: employees } = useEmployees();
  const createExpense = useCreateExpense();

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      companyId: "",
      employeeId: "",
      title: "",
      currency: "USD",
      lineItems: [defaultLineItem()],
    },
  });

  useEffect(() => {
    if (company?.id) {
      form.setValue("companyId", company.id);
    }
  }, [company?.id, form]);

  const lineItems = useFieldArray({ control: form.control, name: "lineItems" });

  const submit = form.handleSubmit(async (values) => {
    try {
      await createExpense.mutateAsync(values);
      toast.success("Expense claim created");
      form.reset({
        companyId: company?.id ?? values.companyId,
        employeeId: "",
        title: "",
        currency: values.currency,
        lineItems: [defaultLineItem()],
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create expense");
    }
  });

  if (!company?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create expense claim</CardTitle>
          <CardDescription>Complete company setup before creating expense claims.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create expense claim</CardTitle>
        <CardDescription>
          Draft a claim with line items. Submit it from the list or detail page when ready.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="expense-title">Title</Label>
              <Input id="expense-title" {...form.register("title")} placeholder="Client visit expenses" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-currency">Currency</Label>
              <Input id="expense-currency" maxLength={3} {...form.register("currency")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-employee">Employee</Label>
              <select
                className={selectClassName}
                id="expense-employee"
                {...form.register("employeeId")}
              >
                <option value="">Select employee…</option>
                {(employees ?? []).map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.employeeCode} — {employee.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Line items</p>
              <Button
                onClick={() => lineItems.append(defaultLineItem())}
                size="sm"
                type="button"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Add line
              </Button>
            </div>
            {lineItems.fields.map((field, index) => (
              <div className="grid gap-3 rounded-lg border p-3 md:grid-cols-5" key={field.id}>
                <Input placeholder="Category" {...form.register(`lineItems.${index}.category`)} />
                <Input
                  className="md:col-span-2"
                  placeholder="Description"
                  {...form.register(`lineItems.${index}.description`)}
                />
                <Input
                  placeholder="Amount"
                  step="0.01"
                  type="number"
                  {...form.register(`lineItems.${index}.amount`, { valueAsNumber: true })}
                />
                <div className="flex gap-2">
                  <Input type="date" {...form.register(`lineItems.${index}.expenseDate`)} />
                  {lineItems.fields.length > 1 ? (
                    <Button
                      aria-label="Remove line item"
                      onClick={() => lineItems.remove(index)}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <Button disabled={createExpense.isPending} type="submit">
            {createExpense.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create draft claim"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
