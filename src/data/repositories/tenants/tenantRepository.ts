import { superAdminTenantRemoteDataSource } from "@/data/datasources/remote/tenants/superAdminTenantRemoteDataSource";
import { tenantRemoteDataSource } from "@/data/datasources/remote/tenants/tenantRemoteDataSource";

export const tenantRepository = {
  listTenants: tenantRemoteDataSource.list,
  getTenant: tenantRemoteDataSource.getById,
  createTenant: tenantRemoteDataSource.create,
  getTenant360: superAdminTenantRemoteDataSource.get360,
  getTenantSummary: superAdminTenantRemoteDataSource.getSummary,
  getSuperAdminTenant: superAdminTenantRemoteDataSource.getById,
  updateTenantStatus: superAdminTenantRemoteDataSource.updateStatus,
  getTenantStatusHistory: superAdminTenantRemoteDataSource.getStatusHistory,
  getTenantModules: superAdminTenantRemoteDataSource.getModules,
  enableTenantModule: superAdminTenantRemoteDataSource.enableModule,
  disableTenantModule: superAdminTenantRemoteDataSource.disableModule,
  startTenantModuleTrial: superAdminTenantRemoteDataSource.startModuleTrial,
  getTenantAuditLogs: superAdminTenantRemoteDataSource.getAuditLogs,
};
