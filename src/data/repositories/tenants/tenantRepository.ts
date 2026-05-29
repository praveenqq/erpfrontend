import { tenantRemoteDataSource } from "@/data/datasources/remote/tenants/tenantRemoteDataSource";

export const tenantRepository = {
  listTenants: tenantRemoteDataSource.list,
  getTenant: tenantRemoteDataSource.getById,
  createTenant: tenantRemoteDataSource.create,
};
