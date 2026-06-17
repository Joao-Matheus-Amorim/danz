"use client";

import Link from "next/link";
import { Sparkles, UserPlus, KanbanSquare, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateClientButton } from "@/components/clientes/CreateClientButton";
import { ROUTES } from "@/lib/routes";
import { BRAND } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";

/** Hero principal do dashboard com CTA e círculo neon de IA. */
export function DashboardHero() {
  const { futureFeature } = useToast();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neon-border bg-surface p-6 shadow-card md:p-8">
      {/* Brilho radial de fundo */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-neon/[0.08] blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="dl-label">
            {BRAND.fullName.toUpperCase()} · CENTRAL OPERACIONAL
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-content md:text-4xl">
            VISÃO <span className="text-neon">GERAL</span> DA OPERAÇÃO
          </h1>
          <p className="text-sm text-content-muted">
            Inteligência, gestão e crescimento em um só lugar. Acompanhe clientes,
            projetos e pipeline em tempo real no workspace ativo.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <CreateClientButton>
              <UserPlus className="h-4 w-4" />
              Novo cliente
            </CreateClientButton>
            <Button variant="secondary" asChild>
              <Link href={ROUTES.boards}>
                <KanbanSquare className="h-4 w-4" />
                Ver Boards
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={ROUTES.dltinho}>
                <Sparkles className="h-4 w-4" />
                Perguntar à DL
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => futureFeature("POP Cliente Novo")}>
              <FileCheck2 className="h-4 w-4" />
              POP Cliente Novo
            </Button>
          </div>
        </div>

        {/* Círculo neon de IA */}
        <div className="relative mx-auto flex h-32 w-32 shrink-0 items-center justify-center">
          <div className="absolute inset-0 animate-pulse-dot rounded-full bg-neon/[0.12] blur-2xl" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-neon-border bg-neon/[0.06] shadow-neon-strong">
            <Sparkles className="h-10 w-10 text-neon" />
          </div>
        </div>
      </div>
    </div>
  );
}
