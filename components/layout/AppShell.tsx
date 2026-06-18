import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AuthGate } from "@/components/auth/AuthGate";
import { ToastProvider } from "@/components/ui/toast";
import { RoleProvider } from "@/lib/role/RoleContext";

/**
 * Estrutura base de todas as páginas internas: sidebar fixa + topbar +
 * área de conteúdo rolável. O ToastProvider envolve tudo para que qualquer
 * página possa sinalizar "integração futura". O RoleProvider resolve o papel
 * do usuário uma vez e disponibiliza via useRole() para guards de RBAC.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthGate>
        <RoleProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar />
              <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
            </div>
          </div>
        </RoleProvider>
      </AuthGate>
    </ToastProvider>
  );
}
