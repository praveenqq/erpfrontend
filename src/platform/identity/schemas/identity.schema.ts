import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyId: z.string().uuid().optional(),
  roleIds: z.array(z.string().uuid()).optional(),
  branchIds: z.array(z.string().uuid()).optional(),
  departmentIds: z.array(z.string().uuid()).optional(),
});

export const updateUserAccessSchema = z.object({
  roleIds: z.array(z.string().uuid()).optional(),
  companyId: z.string().uuid().optional(),
  branchIds: z.array(z.string().uuid()).optional(),
  departmentIds: z.array(z.string().uuid()).optional(),
});

export const deactivateUserSchema = z.object({
  reason: z.string().min(3, "Reason is required"),
});

export const createRoleSchema = z.object({
  code: z.string().min(2).regex(/^[A-Z0-9_]+$/, "Use uppercase letters, numbers, and underscores"),
  name: z.string().min(2),
  permissionCodes: z.array(z.string()).optional(),
});

export const updateRolePermissionsSchema = z.object({
  permissionCodes: z.array(z.string()),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserAccessInput = z.infer<typeof updateUserAccessSchema>;
export type DeactivateUserInput = z.infer<typeof deactivateUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
