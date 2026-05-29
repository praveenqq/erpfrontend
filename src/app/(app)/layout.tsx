import { WorkspaceShell } from "@/common/components/layout/workspace-shell";
import { ModulePageShell } from "@/common/components/layout/module-page-shell";
import { AuthGuard } from "@/security/guards/auth-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <WorkspaceShell>
        <ModulePageShell>{children}</ModulePageShell>
      </WorkspaceShell>
    </AuthGuard>
  );
}
