"use client";

import * as React from "react";
import Link from "next/link";
import { parseISO } from "date-fns";
import { ListChecks, CalendarDays, KanbanSquare, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TodayAgenda } from "@/components/painel/TodayAgenda";
import { TaskSummary } from "@/components/painel/TaskSummary";
import { MyTasks } from "@/components/painel/MyTasks";
import { MyScore } from "@/components/painel/MyScore";
import { MyProjects } from "@/components/painel/MyProjects";
import { CalendarMonth } from "@/components/calendario/CalendarMonth";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/lib/routes";
import { APP_TODAY } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/repositories/auth";
import { listBoards, listMyBoardCards } from "@/lib/repositories/boards";
import { listMyCalendarEvents } from "@/lib/repositories/calendar";
import { createTask, listMyTasks, setTaskDone } from "@/lib/repositories/tasks";
import type { Board, BoardCard, CalendarEvent, Profile, Task } from "@/lib/types";

export default function MeuPainelPage() {
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [myTasks, setMyTasks] = React.useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>([]);
  const [myCards, setMyCards] = React.useState<BoardCard[]>([]);
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [loadingTasks, setLoadingTasks] = React.useState(true);
  const [loadingCalendarEvents, setLoadingCalendarEvents] = React.useState(true);
  const [loadingCards, setLoadingCards] = React.useState(true);
  const [loadingBoards, setLoadingBoards] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    getCurrentProfile()
      .then((item) => {
        if (mounted) setProfile(item);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar seu perfil.");
      })
      .finally(() => {
        if (mounted) setLoadingProfile(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  React.useEffect(() => {
    let mounted = true;

    listMyTasks()
      .then((items) => {
        if (mounted) setMyTasks(items);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar suas tarefas.");
      })
      .finally(() => {
        if (mounted) setLoadingTasks(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  React.useEffect(() => {
    let mounted = true;

    listMyCalendarEvents()
      .then((items) => {
        if (mounted) setCalendarEvents(items);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar sua agenda.");
      })
      .finally(() => {
        if (mounted) setLoadingCalendarEvents(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  React.useEffect(() => {
    let mounted = true;

    listMyBoardCards()
      .then((items) => {
        if (mounted) setMyCards(items);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar seus cards.");
      })
      .finally(() => {
        if (mounted) setLoadingCards(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  React.useEffect(() => {
    let mounted = true;

    listBoards()
      .then((items) => {
        if (mounted) setBoards(items);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) toast("Nao foi possivel carregar seus projetos.");
      })
      .finally(() => {
        if (mounted) setLoadingBoards(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  const todayEvents = calendarEvents.filter((event) => event.date === APP_TODAY);
  const assignedToMe = myTasks.filter((task) => !task.done);

  const stats = [
    {
      label: "A fazer hoje",
      value: myTasks.filter((task) => task.dueDate === APP_TODAY && !task.done).length,
    },
    {
      label: "Esta semana",
      value: myTasks.filter((task) => !task.done).length,
      tone: "neon" as const,
    },
    {
      label: "Atrasadas",
      value: myTasks.filter(
        (task) => task.dueDate !== undefined && task.dueDate < APP_TODAY && !task.done
      ).length,
      tone: "alert" as const,
    },
    {
      label: "Entregas no mes",
      value: myTasks.filter((task) => task.done).length,
    },
  ];

  async function handleCreateTask(title: string) {
    try {
      const task = await createTask({ title, dueDate: APP_TODAY });
      setMyTasks((prev) => [task, ...prev]);
      toast("Tarefa criada.");
    } catch (error) {
      console.error(error);
      toast("Nao foi possivel criar a tarefa.");
      throw error;
    }
  }

  async function handleToggleTask(task: Task) {
    const previous = myTasks;
    const nextDone = !task.done;
    setMyTasks((prev) =>
      prev.map((item) =>
        item.id === task.id
          ? { ...item, done: nextDone, status: nextDone ? "done" : "todo" }
          : item
      )
    );

    try {
      const updated = await setTaskDone(task.id, nextDone);
      setMyTasks((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (error) {
      console.error(error);
      setMyTasks(previous);
      toast("Nao foi possivel atualizar a tarefa.");
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        label={loadingProfile ? "Ola" : `Ola, ${profile?.name ?? "usuario"}`}
        title="MEU PAINEL"
        subtitle="Suas tarefas, seus prazos, seu ritmo."
        actions={
          <>
            <Button variant="primary" asChild>
              <Link href={ROUTES.meuPainel}>
                <ListChecks className="h-4 w-4" /> Minhas tarefas
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={ROUTES.calendario}>
                <CalendarDays className="h-4 w-4" /> Calendario
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={ROUTES.boards}>
                <KanbanSquare className="h-4 w-4" /> Boards
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={ROUTES.dogtooth}>
                <Sparkles className="h-4 w-4" /> Perguntar ao Dogtooth
              </Link>
            </Button>
          </>
        }
      />

      <TodayAgenda events={loadingCalendarEvents ? [] : todayEvents} />
      <TaskSummary stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Junho de 2026</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarMonth month={parseISO(APP_TODAY)} events={calendarEvents} />
            </CardContent>
          </Card>

          <MyTasks
            tasks={myTasks}
            loading={loadingTasks}
            onCreateTask={handleCreateTask}
            onToggleTask={handleToggleTask}
            canEdit={!loadingProfile && profile?.role !== "operador"}
          />

          <Card>
            <CardHeader>
              <CardTitle>Tarefas atribuidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingTasks ? (
                <p className="py-4 text-center text-sm text-content-muted">
                  Carregando tarefas...
                </p>
              ) : assignedToMe.length === 0 ? (
                <p className="py-4 text-center text-sm text-content-muted">
                  Nenhuma tarefa pendente.
                </p>
              ) : (
                assignedToMe.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-muted p-3"
                  >
                    <span className="text-sm text-content">{task.title}</span>
                    <span className="text-[11px] text-content-muted">
                      {task.dueDate
                        ? `vence ${task.dueDate.slice(8, 10)}/${task.dueDate.slice(5, 7)}`
                        : "sem prazo"}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meus cards nos quadros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingCards ? (
                <p className="py-4 text-center text-sm text-content-muted">
                  Carregando cards...
                </p>
              ) : myCards.length === 0 ? (
                <p className="py-4 text-center text-sm text-content-muted">
                  Nenhum card atribuido.
                </p>
              ) : (
                myCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface-muted p-3"
                  >
                    <span className="text-sm text-content">{card.title}</span>
                    <span className="text-[11px] text-content-muted">
                      {card.checklistDone}/{card.checklistTotal}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <MyScore />
          <MyProjects boards={boards} loading={loadingBoards} />
        </div>
      </div>
    </div>
  );
}
