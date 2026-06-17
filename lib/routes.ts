/**
 * Rotas centralizadas do DL Operational System.
 *
 * Toda navegação (sidebar, links, botões) deve referenciar ROUTES — nunca
 * strings de path hardcoded espalhadas pelos componentes. Os ícones são
 * referenciados por nome (string) e resolvidos em components/layout/Sidebar.tsx,
 * para que este módulo permaneça livre de dependências de UI.
 */

export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  dltinho: "/dltinho",
  meuPainel: "/meu-painel",
  boards: "/boards",
  clientes: "/clientes",
  calendario: "/calendario",
  briefings: "/briefings",
  campanhas: "/campanhas",
  drive: "/drive",
  documentos: "/documentos",
  planilhas: "/planilhas",
  inbox: "/inbox",
  configuracoes: "/configuracoes",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

export interface NavItem {
  label: string;
  href: RoutePath;
  /** Nome do ícone lucide — resolvido no componente Sidebar (ICONS). */
  icon: string;
}

export interface NavGroup {
  /** Título do grupo na sidebar (ex.: "OPERAÇÃO"). */
  title: string;
  items: NavItem[];
}

/** Estrutura do menu lateral. */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "OPERAÇÃO",
    items: [
      { label: "Dashboard", href: ROUTES.dashboard, icon: "LayoutDashboard" },
      { label: "DLtinho", href: ROUTES.dltinho, icon: "Sparkles" },
      { label: "Meu painel", href: ROUTES.meuPainel, icon: "UserCircle2" },
      { label: "Boards", href: ROUTES.boards, icon: "KanbanSquare" },
      { label: "Clientes", href: ROUTES.clientes, icon: "Users" },
      { label: "Calendário", href: ROUTES.calendario, icon: "CalendarDays" },
      { label: "Drive", href: ROUTES.drive, icon: "HardDrive" },
      { label: "Documentos", href: ROUTES.documentos, icon: "FileText" },
      { label: "Planilhas", href: ROUTES.planilhas, icon: "Sheet" },
      { label: "Inbox", href: ROUTES.inbox, icon: "MessageCircle" },
    ],
  },
  {
    title: "CRESCIMENTO",
    items: [
      { label: "Briefings", href: ROUTES.briefings, icon: "ClipboardCheck" },
      { label: "Campanhas", href: ROUTES.campanhas, icon: "Megaphone" },
    ],
  },
  {
    title: "ADMINISTRAÇÃO",
    items: [
      { label: "Configurações", href: ROUTES.configuracoes, icon: "Settings" },
    ],
  },
];
