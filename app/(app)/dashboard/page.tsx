"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  KanbanSquare,
  Megaphone,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GrowthOverview } from "@/components/dashboard/GrowthOverview";
import { CampaignSummary } from "@/components/dashboard/CampaignSummary";
import { BoardsPreview } from "@/components/dashboard/BoardsPreview";
import { ClientUpdates } from "@/components/dashboard/ClientUpdates";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { APP_TODAY, EVENT_TYPE_COLOR, EVENT_TYPE_LABEL } from "@/lib/constants";
import { listBoards } from "@/lib/repositories/boards";
import { listCalendarEvents } from "@/lib/repositories/calendar";
import { listCampaigns } from "@/lib/repositories/campaigns";
import { listClients } from "@/lib/repositories/clients";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Board, CalendarEvent, Campaign, Client, DashboardMetric } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const KPI_ICONS: Record<string, LucideIcon> = {
  m_clientes: Users,
  m_novos: UserPlus,
  m_boards: KanbanSquare,
  m_campanhas: Megaphone,
};

const PLAN_MRR_CENTS: Record<string, number> = {
  Essencial: 150000,
  Pro: 250000,
  Premium: 350000,
  Performance: 450000,
};

function flatSeries(value: number) {
  return Array.from({ length: 7 }, (_, index) => ({
    label: `D${index + 1}`,
    value,
  }));
}

function isRecentClient(client: Client): boolean {
  const start = new Date(`${client.startDate}T00:00:00`);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
}

function getAgendaAnchorDate(): string {
  return isSupabaseConfigured ? new Date().toLocaleDateString("sv-SE") : APP_TODAY;
}

function buildDashboardMetrics({
  clients,
  boards,
  campaigns,
  loading,
}: {
  clients: Client[];
  boards: Board[];
  campaigns: Campaign[];
  loading: boolean;
}): DashboardMetric[] {
  const activeClients = clients.filter((client) => client.status === "ativo").length;
  const recentClients = clients.filter(isRecentClient).length;
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "ativa").length;

  const value = (count: number) => (loading ? "..." : formatNumber(count));

  return [
    {
      id: "m_clientes",
      label: "Clientes ativos",
      value: value(activeClients),
      hint: loading ? "carregando carteira" : `de ${formatNumber(clients.length)} no total`,
      deltaPct: null,
      series: flatSeries(activeClients),
    },
    {
      id: "m_novos",
      label: "Novos clientes",
      value: value(recentClients),
      hint: "ultimos 7 dias",
      deltaPct: null,
      series: flatSeries(recentClients),
    },
    {
      id: "m_boards",
      label: "Boards",
      value: value(boards.length),
      hint: "quadros ativos",
      deltaPct: null,
      series: flatSeries(boards.length),
    },
    {
      id: "m_campanhas",
      label: "Campanhas ativas",
      value: value(activeCampaigns),
      hint: "em veiculacao",
      deltaPct: null,
      series: flatSeries(activeCampaigns),
    },
  ];
}

function buildGrowthMetrics({
  clients,
  campaigns,
  loading,
}: {
  clients: Client[];
  campaigns: Campaign[];
  loading: boolean;
}): DashboardMetric[] {
  const activeClients = clients.filter((client) => client.status === "ativo");
  const recentClients = clients.filter(isRecentClient).length;
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "ativa").length;
  const mrrCents = activeClients.reduce(
    (total, client) => total + (PLAN_MRR_CENTS[client.plan] ?? 0),
    0
  );

  return [
    {
      id: "g_mrr",
      label: "Receita recorrente (MRR)",
      value: loading ? "..." : formatCurrency(mrrCents),
      hint: "estimado pelos planos ativos",
      deltaPct: null,
      series: flatSeries(mrrCents / 100),
    },
    {
      id: "g_novos",
      label: "Novos clientes 7D",
      value: loading ? "..." : formatNumber(recentClients),
      hint: "ultimos 7 dias",
      deltaPct: null,
      series: flatSeries(recentClients),
    },
    {
      id: "g_ativos",
      label: "Clientes ativos",
      value: loading ? "..." : formatNumber(activeClients.length),
      hint: `de ${formatNumber(clients.length)} no total`,
      deltaPct: null,
      series: flatSeries(activeClients.length),
    },
    {
      id: "g_campanhas",
      label: "Campanhas ativas",
      value: loading ? "..." : formatNumber(activeCampaigns),
      hint: "em veiculacao",
      deltaPct: null,
      series: flatSeries(activeCampaigns),
    },
  ];
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    Promise.all([
      listClients(),
      listBoards(),
      listCampaigns(),
      listCalendarEvents(),
    ])
      .then(([nextClients, nextBoards, nextCampaigns, nextEvents]) => {
        if (!mounted) return;
        setClients(nextClients);
        setBoards(nextBoards);
        setCampaigns(nextCampaigns);
        setCalendarEvents(nextEvents);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar o dashboard.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  const dashboardMetrics = buildDashboardMetrics({
    clients,
    boards,
    campaigns,
    loading,
  });
  const growthMetrics = buildGrowthMetrics({ clients, campaigns, loading });
  const todayIso = getAgendaAnchorDate();
  const upcomingEvents = calendarEvents
    .filter((event) => event.date >= todayIso)
    .sort((a, b) => `${a.date}${a.time ?? ""}`.localeCompare(`${b.date}${b.time ?? ""}`))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <DashboardHero />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} icon={KPI_ICONS[metric.id] ?? Users} />
        ))}
      </div>

      <GrowthOverview metrics={growthMetrics} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CampaignSummary />

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Calendario / Agenda</CardTitle>
            <CalendarDays className="h-4 w-4 text-content-muted" />
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="py-4 text-center text-sm text-content-muted">
                Carregando agenda...
              </p>
            ) : upcomingEvents.length === 0 ? (
              <p className="py-4 text-center text-sm text-content-muted">
                Nenhum evento encontrado.
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: EVENT_TYPE_COLOR[event.type] }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-content">{event.title}</p>
                    <p className="text-[11px] text-content-muted">
                      {EVENT_TYPE_LABEL[event.type]} - {formatDate(event.date, "dd 'de' MMM")}
                      {event.time ? ` - ${event.time}` : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <BoardsPreview boards={boards} loading={loading} />
        <ClientUpdates clients={clients} loading={loading} />
      </div>
    </div>
  );
}
