import { asRecord, parseOptionalString, parseString } from "@/domain/models/common";

export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "TERMINATED";

export interface Employee {
  id: string;
  tenantId: string;
  companyId: string;
  employeeCode: string;
  fullName: string;
  email?: string | null;
  departmentId?: string | null;
  status: EmployeeStatus;
}

export function parseEmployee(value: unknown): Employee {
  const record = asRecord(value);
  return {
    id: parseString(record.id),
    tenantId: parseString(record.tenantId),
    companyId: parseString(record.companyId),
    employeeCode: parseString(record.employeeCode),
    fullName: parseString(record.fullName),
    email: parseOptionalString(record.email),
    departmentId: parseOptionalString(record.departmentId),
    status: parseString(record.status, "ACTIVE") as EmployeeStatus,
  };
}

export function formatEmployeeStatus(status: EmployeeStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
