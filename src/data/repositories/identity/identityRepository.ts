import { identityRemoteDataSource } from "@/data/datasources/remote/identity/identityRemoteDataSource";

export const identityRepository = {
  listUsers: identityRemoteDataSource.listUsers,
  getUser: identityRemoteDataSource.getUser,
  createUser: identityRemoteDataSource.createUser,
  updateUserAccess: identityRemoteDataSource.updateUserAccess,
  deactivateUser: identityRemoteDataSource.deactivateUser,
  listRoles: identityRemoteDataSource.listRoles,
  getRole: identityRemoteDataSource.getRole,
  listPermissions: identityRemoteDataSource.listPermissions,
  createRole: identityRemoteDataSource.createRole,
  updateRolePermissions: identityRemoteDataSource.updateRolePermissions,
};
