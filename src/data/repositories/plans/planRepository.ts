import { planRemoteDataSource } from "@/data/datasources/remote/plans/planRemoteDataSource";

export const planRepository = {
  listPlans: planRemoteDataSource.listPlans,
  getPlan: planRemoteDataSource.getPlan,
  createPlan: planRemoteDataSource.createPlan,
  updatePlan: planRemoteDataSource.updatePlan,
  publishPlan: planRemoteDataSource.publishPlan,
  deprecatePlan: planRemoteDataSource.deprecatePlan,
  archivePlan: planRemoteDataSource.archivePlan,
  createPlanVersion: planRemoteDataSource.createPlanVersion,
  addPlanPrice: planRemoteDataSource.addPlanPrice,
  configurePlanLimits: planRemoteDataSource.configurePlanLimits,
  configurePlanModules: planRemoteDataSource.configurePlanModules,
  listPublicPlans: planRemoteDataSource.listPublicPlans,
  comparePublicPlans: planRemoteDataSource.comparePublicPlans,
};
