import { provisioningRemoteDataSource } from "@/data/datasources/remote/provisioning/provisioningRemoteDataSource";

export const provisioningRepository = {
  getStatus: provisioningRemoteDataSource.getStatus,
  getSuperAdminSummary: provisioningRemoteDataSource.getSuperAdminSummary,
  retry: provisioningRemoteDataSource.retry,
  retryPlatform: provisioningRemoteDataSource.retryPlatform,
};
