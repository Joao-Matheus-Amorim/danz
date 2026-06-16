import { AppShell } from "@/components/layout/AppShell";

/**
 * Layout do grupo de rotas internas. Usar um route group "(app)" mantém as
 * URLs idênticas à especificação (ex.: /dashboard) e ao mesmo tempo permite
 * que apenas as páginas internas compartilhem a AppShell — o /login fica fora
 * e renderiza em tela cheia.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
