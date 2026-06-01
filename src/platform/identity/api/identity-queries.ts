import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { identityRepository } from "@/data/repositories/identity/identityRepository";
import { useAuth } from "@/security/auth/auth-provider";
import type {
  CreateRoleInput,
  CreateUserInput,
  DeactivateUserInput,
  UpdateRolePermissionsInput,
  UpdateUserAccessInput,
} from "@/platform/identity/schemas/identity.schema";

export const identityKeys = {
  all: ["admin", "identity"] as const,
  users: (params: { q?: string; page?: number; size?: number }) =>
    [...identityKeys.all, "users", params] as const,
  user: (id: string) => [...identityKeys.all, "user", id] as const,
  roles: () => [...identityKeys.all, "roles"] as const,
  role: (id: string) => [...identityKeys.all, "role", id] as const,
  permissions: () => [...identityKeys.all, "permissions"] as const,
};

function useIdentityReadEnabled() {
  const { isAuthenticated, hasAnyPermission } = useAuth();
  return (
    isAuthenticated &&
    hasAnyPermission(["USER_VIEW", "ROLE_VIEW", "SUPER_ADMIN_ACCESS"])
  );
}

export function useUsers(params: { q?: string; page?: number; size?: number }) {
  const enabled = useIdentityReadEnabled();
  return useQuery({
    queryKey: identityKeys.users(params),
    queryFn: () => identityRepository.listUsers(params),
    enabled,
  });
}

export function useUser(id: string) {
  const enabled = useIdentityReadEnabled() && Boolean(id);
  return useQuery({
    queryKey: identityKeys.user(id),
    queryFn: () => identityRepository.getUser(id),
    enabled,
  });
}

export function useRoles() {
  const enabled = useIdentityReadEnabled();
  return useQuery({
    queryKey: identityKeys.roles(),
    queryFn: () => identityRepository.listRoles(),
    enabled,
  });
}

export function useRole(id: string) {
  const enabled = useIdentityReadEnabled() && Boolean(id);
  return useQuery({
    queryKey: identityKeys.role(id),
    queryFn: () => identityRepository.getRole(id),
    enabled,
  });
}

export function usePermissions() {
  const enabled = useIdentityReadEnabled();
  return useQuery({
    queryKey: identityKeys.permissions(),
    queryFn: () => identityRepository.listPermissions(),
    enabled,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => identityRepository.createUser(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: identityKeys.all }),
  });
}

export function useUpdateUserAccess(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserAccessInput) => identityRepository.updateUserAccess(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: identityKeys.all });
      qc.invalidateQueries({ queryKey: identityKeys.user(id) });
    },
  });
}

export function useDeactivateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DeactivateUserInput) => identityRepository.deactivateUser(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: identityKeys.all });
      qc.invalidateQueries({ queryKey: identityKeys.user(id) });
    },
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) => identityRepository.createRole(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: identityKeys.all }),
  });
}

export function useUpdateRolePermissions(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateRolePermissionsInput) =>
      identityRepository.updateRolePermissions(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: identityKeys.all });
      qc.invalidateQueries({ queryKey: identityKeys.role(id) });
    },
  });
}
