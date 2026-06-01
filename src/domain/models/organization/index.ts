import { asRecord, parseString } from "@/domain/models/common";

export interface Company {
  id: string;
  tenantId: string;
  code: string;
  name: string;
}

export interface Branch {
  id: string;
  tenantId: string;
  companyId: string;
  code: string;
  name: string;
}

export interface Department {
  id: string;
  tenantId: string;
  companyId: string;
  code: string;
  name: string;
}

export function parseCompany(value: unknown): Company {
  const record = asRecord(value);
  return {
    id: parseString(record.id),
    tenantId: parseString(record.tenantId),
    code: parseString(record.code),
    name: parseString(record.name),
  };
}

export function parseBranch(value: unknown): Branch {
  const record = asRecord(value);
  return {
    id: parseString(record.id),
    tenantId: parseString(record.tenantId),
    companyId: parseString(record.companyId),
    code: parseString(record.code),
    name: parseString(record.name),
  };
}

export function parseDepartment(value: unknown): Department {
  const record = asRecord(value);
  return {
    id: parseString(record.id),
    tenantId: parseString(record.tenantId),
    companyId: parseString(record.companyId),
    code: parseString(record.code),
    name: parseString(record.name),
  };
}
