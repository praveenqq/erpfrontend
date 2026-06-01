import { employeeRemoteDataSource } from "@/data/datasources/remote/employees/employeeRemoteDataSource";

export const employeeRepository = {
  list: employeeRemoteDataSource.list,
  getById: employeeRemoteDataSource.getById,
  create: employeeRemoteDataSource.create,
  update: employeeRemoteDataSource.update,
};
