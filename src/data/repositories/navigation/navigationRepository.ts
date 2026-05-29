import { navigationRemoteDataSource } from "@/data/datasources/remote/navigation/navigationRemoteDataSource";

export const navigationRepository = {
  getNavigation: navigationRemoteDataSource.getNavigation,
};
