import { moduleRegistryRemoteDataSource } from "@/data/datasources/remote/moduleaccess/moduleRegistryRemoteDataSource";

export const moduleRegistryRepository = {
  listRegistry: moduleRegistryRemoteDataSource.listRegistry,
};
