import { ModuleAccessGuard } from "@/security/guards/module-access-guard";

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ModuleAccessGuard>{children}</ModuleAccessGuard>;
}
