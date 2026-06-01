import { auditRemoteDataSource } from "@/data/datasources/remote/audit/auditRemoteDataSource";

export const auditRepository = {
  searchSuperAdminAudit: auditRemoteDataSource.searchSuperAdminAudit,
  getTenantAudit: auditRemoteDataSource.getTenantAudit,
};
