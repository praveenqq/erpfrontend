import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import { extractApiData } from "@/domain/models/common";
import { parseEmployee, type Employee } from "@/domain/models/employee";
import { apiFetch } from "@/lib/api/client";

export interface CreateEmployeeInput {
  companyId: string;
  employeeCode: string;
  fullName: string;
  email?: string;
  departmentId?: string;
}

export interface UpdateEmployeeInput {
  fullName: string;
  email?: string;
  departmentId?: string;
  status?: "ACTIVE" | "INACTIVE" | "TERMINATED";
}

export const employeeRemoteDataSource = {
  async list(tenantId: string | null): Promise<Employee[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.MODULES.EMPLOYEES, { tenantId });
    const data = extractApiData<unknown[]>(response);
    return data.map(parseEmployee);
  },

  async getById(id: string, tenantId: string | null): Promise<Employee> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.MODULES.EMPLOYEE(id), { tenantId });
    return parseEmployee(extractApiData(response));
  },

  async create(input: CreateEmployeeInput, tenantId: string | null): Promise<Employee> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.MODULES.EMPLOYEES, {
      method: "POST",
      body: input,
      tenantId,
    });
    return parseEmployee(extractApiData(response));
  },

  async update(id: string, input: UpdateEmployeeInput, tenantId: string | null): Promise<Employee> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.MODULES.EMPLOYEE(id), {
      method: "PATCH",
      body: input,
      tenantId,
    });
    return parseEmployee(extractApiData(response));
  },
};
