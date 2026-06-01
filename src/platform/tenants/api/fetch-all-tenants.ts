import { tenantRepository } from "@/data/repositories/tenants/tenantRepository";
import type { Tenant } from "@/domain/models/tenant";

const PAGE_SIZE = 100;

export async function fetchAllTenants(params?: {
  q?: string;
  status?: string;
}): Promise<Tenant[]> {
  const firstPage = await tenantRepository.listTenants({
    ...params,
    page: 0,
    size: PAGE_SIZE,
  });

  const allRows = [...firstPage.content];
  for (let page = 1; page < firstPage.totalPages; page += 1) {
    const nextPage = await tenantRepository.listTenants({
      ...params,
      page,
      size: PAGE_SIZE,
    });
    allRows.push(...nextPage.content);
  }

  return allRows;
}
