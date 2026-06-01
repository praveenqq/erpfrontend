import { UnauthorizedState } from "@/security/components/unauthorized-state";

export default function UnauthorizedPage() {
  return (
    <UnauthorizedState
      description="You are signed in, but this page requires a different role or permission set. Contact an administrator if you believe you should have access."
    />
  );
}
