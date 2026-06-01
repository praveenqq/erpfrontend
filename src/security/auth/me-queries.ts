import { useQuery } from "@tanstack/react-query";
import { meRepository } from "@/data/repositories/me/meRepository";
import { useAuth } from "@/security/auth/auth-provider";

export const meKeys = {
  profile: ["me", "profile"] as const,
};

export function useMeProfileQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: meKeys.profile,
    queryFn: () => meRepository.getSession(),
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: 2,
  });
}
