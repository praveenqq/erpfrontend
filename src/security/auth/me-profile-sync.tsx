"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { isDevAuth } from "@/common/config/env";
import { useMeProfileQuery } from "@/security/auth/me-queries";
import { useApplyMeProfile, useAuth } from "@/security/auth/auth-provider";

export function MeProfileSync() {
  const { isAuthenticated } = useAuth();
  const { data: profile, isError, error, isFetched } = useMeProfileQuery();
  const applyMeProfile = useApplyMeProfile();
  const errorShown = useRef(false);

  useEffect(() => {
    if (profile) applyMeProfile(profile);
  }, [profile, applyMeProfile]);

  useEffect(() => {
    if (!isError || errorShown.current || isDevAuth()) return;
    errorShown.current = true;
    toast.error(
      error instanceof Error
        ? error.message
        : "Unable to load your ERP session. Platform permissions may be unavailable until this is resolved.",
    );
  }, [isError, error]);

  if (isDevAuth() || !isAuthenticated || isFetched) {
    return null;
  }

  return null;
}
