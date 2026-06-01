import { meRemoteDataSource } from "@/data/datasources/remote/me/meRemoteDataSource";

export const meRepository = {
  getSession: meRemoteDataSource.getSession,
  getProfile: meRemoteDataSource.getProfile,
};
