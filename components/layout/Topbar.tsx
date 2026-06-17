"use client";

import { Bell, LogOut, Search, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { MobileNav } from "@/components/layout/MobileNav";
import { currentProfile } from "@/lib/mock-data";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export function Topbar() {
  const { futureFeature } = useToast();
  const router = useRouter();

  async function signOut() {
    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.06] bg-background/70 px-4 backdrop-blur-xl lg:px-6">
      {/* Menu mobile (< lg) */}
      <MobileNav />

      <div className="hidden items-center gap-2 md:flex">
        <span className="h-2 w-2 animate-pulse-dot rounded-full bg-neon shadow-neon" />
        <span className="text-sm font-medium text-content">{BRAND.fullName}</span>
      </div>

      {/* Busca global */}
      <button
        type="button"
        onClick={() => futureFeature("Busca global")}
        className="group flex h-10 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-left text-sm text-content-muted transition-colors hover:border-neon-border lg:max-w-md"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1">Buscar em tudo...</span>
        <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-content-muted">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => futureFeature("Alternância de tema")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-content-muted transition-colors hover:text-content"
          aria-label="Alternar tema"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => futureFeature("Notificações")}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-content-muted transition-colors hover:text-content"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-alert px-1 text-[10px] font-semibold text-white">
            3
          </span>
        </button>
        <Avatar initials={currentProfile.initials} />
        {isSupabaseConfigured ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-content-muted transition-colors hover:text-content"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
