import { dashboardRemoteDataSource } from "@/data/datasources/remote/superadmin/dashboardRemoteDataSource";

export const dashboardRepository = {
  getPlatformDashboard: dashboardRemoteDataSource.getPlatformDashboard,
};
