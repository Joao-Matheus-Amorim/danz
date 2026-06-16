"use client";

import * as React from "react";
import { addMonths, subMonths, parseISO, isSameMonth } from "date-fns";
import { Plus, CheckSquare, Users, FileText, KanbanSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarMonth } from "@/components/calendario/CalendarMonth";
import { CalendarEvent } from "@/components/calendario/CalendarEvent";
import {
  CalendarToolbar,
  type CalendarView,
} from "@/components/calendario/CalendarToolbar";
import { EventModal } from "@/components/calendario/EventModal";
import { calendarEvents as initialEvents } from "@/lib/mock-data";
import { APP_TODAY } from "@/lib/constants";
import type { CalendarEvent as CalendarEventT } from "@/lib/types";

export default function CalendarioPage() {
  const [month, setMonth] = React.useState<Date>(parseISO(APP_TODAY));
  const [view, setView] = React.useState<CalendarView | "todos">("todos");
  const [events, setEvents] = React.useState<CalendarEventT[]>(initialEvents);
  const [modalOpen, setModalOpen] = React.useState(false);

  const monthEvents = events.filter((e) => isSameMonth(parseISO(e.date), month));

  const metrics = [
    { label: "Tarefas", value: monthEvents.filter((e) => e.type === "tarefa").length, icon: CheckSquare },
    { label: "Reuniões", value: monthEvents.filter((e) => e.type === "reuniao").length, icon: Users },
    { label: "Conteúdo", value: monthEvents.filter((e) => e.type === "conteudo").length, icon: FileText },
    { label: "Boards", value: monthEvents.filter((e) => e.type === "campanha").length, icon: KanbanSquare },
  ];

  const showAgenda = view === "agenda";

  return (
    <div className="space-y-6">
      <PageHeader
        label="Agenda"
        title="CALENDÁRIO"
        subtitle="O que cada pessoa tem pra fazer — tarefas, posts e reuniões organizados por responsável."
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Novo evento
          </Button>
        }
      />

      <CalendarToolbar
        month={month}
        view={view}
        onPrev={() => setMonth((m) => subMonths(m, 1))}
        onNext={() => setMonth((m) => addMonths(m, 1))}
        onToday={() => setMonth(parseISO(APP_TODAY))}
        onViewChange={setView}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="dl-label">{m.label}</p>
              <m.icon className="h-4 w-4 text-content-muted" />
            </div>
            <p className="mt-2 text-2xl font-bold text-content">{m.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          {showAgenda ? (
            <div className="space-y-2">
              {monthEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-content-muted">
                  Nenhum evento neste mês.
                </p>
              ) : (
                [...monthEvents]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((ev) => <CalendarEvent key={ev.id} event={ev} />)
              )}
            </div>
          ) : (
            <CalendarMonth month={month} events={events} />
          )}
        </CardContent>
      </Card>

      <EventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={(ev) => setEvents((prev) => [...prev, ev])}
      />
    </div>
  );
}
