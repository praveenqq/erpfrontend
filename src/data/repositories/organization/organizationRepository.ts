import { organizationRemoteDataSource } from "@/data/datasources/remote/organization/organizationRemoteDataSource";

export const organizationRepository = {
  getCompany: organizationRemoteDataSource.getCompany,
  updateCompany: organizationRemoteDataSource.updateCompany,
  listBranches: organizationRemoteDataSource.listBranches,
  createBranch: organizationRemoteDataSource.createBranch,
  listDepartments: organizationRemoteDataSource.listDepartments,
  createDepartment: organizationRemoteDataSource.createDepartment,
};
