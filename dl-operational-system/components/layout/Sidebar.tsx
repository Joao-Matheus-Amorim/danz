"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  UserCircle2,
  KanbanSquare,
  Users,
  CalendarDays,
  HardDrive,
  FileText,
  Sheet,
  MessageCircle,
  ClipboardCheck,
  Megaphone,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { NAV_GROUPS } from "@/lib/routes";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Mapeia o nome do ícone (string em routes.ts) para o componente lucide. */
const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Sparkles,
  UserCircle2,
  KanbanSquare,
  Users,
  CalendarDays,
  HardDrive,
  FileText,
  Sheet,
  MessageCircle,
  ClipboardCheck,
  Megaphone,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.06] bg-background/60 backdrop-blur-xl lg:flex">
      {/* Marca */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-border bg-neon/[0.10] font-bold text-neon shadow-neon">
          {BRAND.shortName}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-content">{BRAND.system}</p>
          <p className="text-[11px] text-content-muted">{BRAND.legalName}</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="dl-label px-3 pb-2">{group.title}</p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = ICONS[item.icon] ?? LayoutDashboard;
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
                        active
                          ? "dl-neon-active text-content"
                          : "text-content-muted hover:bg-white/[0.04] hover:text-content"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          active ? "text-neon" : "text-content-muted group-hover:text-content"
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {active && (
                        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-neon shadow-neon" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Rodapé: workspace ativo */}
      <div className="border-t border-white/[0.06] p-4">
        <p className="dl-label">Workspace ativo</p>
        <p className="mt-1 text-sm font-medium text-content">{BRAND.fullName}</p>
        <p className="text-xs text-content-muted">Função: {BRAND.role}</p>
      </div>
    </aside>
  );
}
