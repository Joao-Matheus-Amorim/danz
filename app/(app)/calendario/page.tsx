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
import { useToast } from "@/components/ui/toast";
import { APP_TODAY } from "@/lib/constants";
import {
  createCalendarEvent,
  listCalendarEvents,
  type CalendarEventInput,
} from "@/lib/repositories/calendar";
import type { CalendarEvent as CalendarEventT } from "@/lib/types";

export default function CalendarioPage() {
  const { toast } = useToast();
  const [month, setMonth] = React.useState<Date>(parseISO(APP_TODAY));
  const [view, setView] = React.useState<CalendarView | "todos">("todos");
  const [events, setEvents] = React.useState<CalendarEventT[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    listCalendarEvents()
      .then((items) => {
        if (mounted) setEvents(items);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Não foi possível carregar o calendário.");
      })
      .finally(() => {
        if (mounted) setLoadingEvents(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  const monthEvents = events.filter((event) =>
    isSameMonth(parseISO(event.date), month)
  );

  const metrics = [
    {
      label: "Tarefas",
      value: monthEvents.filter((event) => event.type === "tarefa").length,
      icon: CheckSquare,
    },
    {
      label: "Reuniões",
      value: monthEvents.filter((event) => event.type === "reuniao").length,
      icon: Users,
    },
    {
      label: "Conteúdo",
      value: monthEvents.filter((event) => event.type === "conteudo").length,
      icon: FileText,
    },
    {
      label: "Boards",
      value: monthEvents.filter((event) => event.type === "campanha").length,
      icon: KanbanSquare,
    },
  ];

  const showAgenda = view === "agenda";

  async function handleCreateEvent(input: CalendarEventInput) {
    try {
      const event = await createCalendarEvent(input);
      setEvents((prev) => [...prev, event]);
      toast("Evento criado.");
    } catch (error) {
      console.error(error);
      toast("Não foi possível criar o evento.");
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label="Agenda"
        title="CALENDÁRIO"
        subtitle="O que cada pessoa tem pra fazer: tarefas, posts e reuniões organizados por responsável."
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Novo evento
          </Button>
        }
      />

      <CalendarToolbar
        month={month}
        view={view}
        onPrev={() => setMonth((current) => subMonths(current, 1))}
        onNext={() => setMonth((current) => addMonths(current, 1))}
        onToday={() => setMonth(parseISO(APP_TODAY))}
        onViewChange={setView}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-center justify-between">
              <p className="dl-label">{metric.label}</p>
              <metric.icon className="h-4 w-4 text-content-muted" />
            </div>
            <p className="mt-2 text-2xl font-bold text-content">{metric.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          {showAgenda ? (
            <div className="space-y-2">
              {loadingEvents ? (
                <p className="py-6 text-center text-sm text-content-muted">
                  Carregando calendário...
                </p>
              ) : monthEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-content-muted">
                  Nenhum evento neste mês.
                </p>
              ) : (
                [...monthEvents]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((event) => <CalendarEvent key={event.id} event={event} />)
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
        onCreate={handleCreateEvent}
      />
    </div>
  );
}
