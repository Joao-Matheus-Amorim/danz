import { Users, UserPlus, KanbanSquare, Megaphone, CalendarDays, type LucideIcon } from "lucide-react";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GrowthOverview } from "@/components/dashboard/GrowthOverview";
import { CampaignSummary } from "@/components/dashboard/CampaignSummary";
import { BoardsPreview } from "@/components/dashboard/BoardsPreview";
import { ClientUpdates } from "@/components/dashboard/ClientUpdates";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { dashboardMetrics, calendarEvents } from "@/lib/mock-data";
import { EVENT_TYPE_COLOR, EVENT_TYPE_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const KPI_ICONS: Record<string, LucideIcon> = {
  m_clientes: Users,
  m_novos: UserPlus,
  m_boards: KanbanSquare,
  m_campanhas: Megaphone,
};

export default function DashboardPage() {
  const proximosEventos = [...calendarEvents]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <DashboardHero />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((m) => (
          <MetricCard key={m.id} metric={m} icon={KPI_ICONS[m.id] ?? Users} />
        ))}
      </div>

      {/* Crescimento */}
      <GrowthOverview />

      {/* Seção inferior */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CampaignSummary />

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Calendário / Agenda</CardTitle>
            <CalendarDays className="h-4 w-4 text-content-muted" />
          </CardHeader>
          <CardContent className="space-y-2">
            {proximosEventos.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: EVENT_TYPE_COLOR[ev.type] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-content">{ev.title}</p>
                  <p className="text-[11px] text-content-muted">
                    {EVENT_TYPE_LABEL[ev.type]} · {formatDate(ev.date, "dd 'de' MMM")}
                    {ev.time ? ` · ${ev.time}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <BoardsPreview />
        <ClientUpdates />
      </div>
    </div>
  );
}
