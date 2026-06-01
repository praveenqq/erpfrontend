import { setupRemoteDataSource } from "@/data/datasources/remote/setup/setupRemoteDataSource";
import type { TenantSetupStepCode } from "@/domain/models/setup";

export const setupRepository = {
  getProgress: setupRemoteDataSource.getProgress,
  completeStep: (step: TenantSetupStepCode, tenantId: string | null) =>
    setupRemoteDataSource.completeStep(step, tenantId),
};
